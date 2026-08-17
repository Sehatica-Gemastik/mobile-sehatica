package com.sehatica.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SehaticaBluetoothModule : Module() {
  private val context: Context
    get() = appContext.reactContext
      ?: throw IllegalStateException("Context aplikasi belum siap")

  private var scanReceiver: BroadcastReceiver? = null
  private var scanPromise: Promise? = null
  private val foundByAddress = linkedMapOf<String, Map<String, String>>()
  private val handler = Handler(Looper.getMainLooper())
  private val stopScanRunnable = Runnable { finishScan() }

  override fun definition() = ModuleDefinition {
    Name("SehaticaBluetooth")
    Events("onDeviceFound")

    AsyncFunction("getPairedDevices") {
      pairedDevices()
    }

    AsyncFunction("scanNearbyDevices") { durationMs: Int, promise: Promise ->
      startNearbyScan(durationMs.coerceIn(4000, 20000), promise)
    }

    AsyncFunction("stopScan") {
      finishScan()
    }

    AsyncFunction("sendFile") { address: String, fileUri: String, mimeType: String ->
      sendFileToDevice(address, fileUri, mimeType)
    }

    OnDestroy {
      finishScan()
    }
  }

  @SuppressLint("MissingPermission")
  private fun pairedDevices(): List<Map<String, String>> {
    val adapter = requireAdapter()
    return adapter.bondedDevices
      .map { toDeviceMap(it, paired = true, nearby = false) }
      .sortedBy { it["name"]?.lowercase() }
  }

  @SuppressLint("MissingPermission")
  private fun startNearbyScan(durationMs: Int, promise: Promise) {
    if (scanPromise != null) {
      finishScan()
    }

    val adapter = requireAdapter()
    if (!isLocationEnabled()) {
      promise.reject(
        "LOCATION_OFF",
        "Nyalakan lokasi HP. Android butuh lokasi menyala untuk scan Bluetooth.",
        null,
      )
      return
    }

    foundByAddress.clear()
    pairedDevices().forEach { device ->
      val address = device["address"] ?: return@forEach
      foundByAddress[address] = device
      sendEvent("onDeviceFound", device)
    }

    val receiver = object : BroadcastReceiver() {
      override fun onReceive(ctx: Context?, intent: Intent?) {
        when (intent?.action) {
          BluetoothDevice.ACTION_FOUND -> {
            val device = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
              intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
            } else {
              @Suppress("DEPRECATION")
              intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
            } ?: return
            val mapped = toDeviceMap(
              device,
              paired = device.bondState == BluetoothDevice.BOND_BONDED,
              nearby = true,
            )
            val name = mapped["name"].orEmpty()
            if (name.isBlank() || looksLikeAddress(name)) return
            foundByAddress[mapped["address"]!!] = mapped
            sendEvent("onDeviceFound", mapped)
          }
          BluetoothAdapter.ACTION_DISCOVERY_FINISHED -> finishScan()
        }
      }
    }

    val filter = IntentFilter().apply {
      addAction(BluetoothDevice.ACTION_FOUND)
      addAction(BluetoothAdapter.ACTION_DISCOVERY_FINISHED)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      context.registerReceiver(receiver, filter)
    }
    scanReceiver = receiver
    scanPromise = promise

    adapter.cancelDiscovery()
    val started = adapter.startDiscovery()
    if (!started) {
      finishScan()
      return
    }
    handler.removeCallbacks(stopScanRunnable)
    handler.postDelayed(stopScanRunnable, durationMs.toLong())
  }

  @SuppressLint("MissingPermission")
  private fun finishScan() {
    handler.removeCallbacks(stopScanRunnable)
    try {
      bluetoothAdapter()?.cancelDiscovery()
    } catch (_: Exception) {
      // ignore
    }
    scanReceiver?.let { receiver ->
      try {
        context.unregisterReceiver(receiver)
      } catch (_: Exception) {
        // already unregistered
      }
    }
    scanReceiver = null
    val result = foundByAddress.values.toList()
    foundByAddress.clear()
    scanPromise?.resolve(result)
    scanPromise = null
  }

  @SuppressLint("MissingPermission")
  private fun sendFileToDevice(address: String, fileUri: String, mimeType: String) {
    val adapter = requireAdapter()
    val uri = Uri.parse(fileUri)
    val device = adapter.getRemoteDevice(address)
    val intent = Intent(Intent.ACTION_SEND).apply {
      type = mimeType.ifBlank { "application/pdf" }
      putExtra(Intent.EXTRA_STREAM, uri)
      putExtra(BluetoothDevice.EXTRA_DEVICE, device)
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    try {
      context.grantUriPermission(
        "com.android.bluetooth",
        uri,
        Intent.FLAG_GRANT_READ_URI_PERMISSION,
      )
    } catch (_: Exception) {
      // some OEM skins use another bluetooth package
    }

    try {
      intent.setClassName(
        "com.android.bluetooth",
        "com.android.bluetooth.opp.BluetoothOppLauncherActivity",
      )
      context.startActivity(intent)
    } catch (_: Exception) {
      intent.component = null
      intent.setPackage(null)
      context.startActivity(Intent.createChooser(intent, "Kirim via Bluetooth"))
    }
  }

  @SuppressLint("MissingPermission")
  private fun toDeviceMap(
    device: BluetoothDevice,
    paired: Boolean,
    nearby: Boolean,
  ): Map<String, String> {
    val rawName = device.name?.trim().orEmpty()
    val name = if (rawName.isNotBlank() && !looksLikeAddress(rawName)) rawName else ""
    return mapOf(
      "id" to device.address,
      "address" to device.address,
      "name" to name.ifBlank { device.address },
      "paired" to if (paired) "1" else "0",
      "nearby" to if (nearby) "1" else "0",
    )
  }

  private fun looksLikeAddress(value: String): Boolean {
    return value.matches(Regex("([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}"))
  }

  private fun isLocationEnabled(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      val manager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
      manager.isLocationEnabled
    } else {
      Settings.Secure.getInt(context.contentResolver, Settings.Secure.LOCATION_MODE, 0) != 0
    }
  }

  private fun requireAdapter(): BluetoothAdapter {
    val adapter = bluetoothAdapter()
      ?: throw IllegalStateException("Bluetooth tidak tersedia di perangkat ini")
    if (!adapter.isEnabled) {
      throw IllegalStateException("Nyalakan Bluetooth dulu")
    }
    return adapter
  }

  private fun bluetoothAdapter() =
    (context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter
}
