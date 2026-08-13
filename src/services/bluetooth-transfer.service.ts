import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { base64FromBytes } from '@/utils/read-document-file';

/** Nordic UART service — common BLE serial profile for file chunks */
export const SEHATICA_BLE_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
export const SEHATICA_BLE_TX_CHAR = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';

const CHUNK_SIZE = 400;
const WRITE_DELAY_MS = 25;

let manager: BleManager | null = null;

function getManager(): BleManager {
  if (!manager) manager = new BleManager();
  return manager;
}

export type ScannedDevice = {
  id: string;
  name: string;
  rssi: number | null;
};

export function isBluetoothSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN!,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT!,
    ]);
    return Object.values(results).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
  }

  const location = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!
  );
  return location === PermissionsAndroid.RESULTS.GRANTED;
}

export async function ensureBluetoothOn(): Promise<void> {
  const ble = getManager();
  const state = await ble.state();
  if (state === State.PoweredOn) return;
  if (state === State.PoweredOff) {
    throw new Error('Nyalakan Bluetooth di pengaturan perangkat.');
  }
  throw new Error('Bluetooth belum siap. Coba lagi sebentar.');
}

export function scanDevices(
  onDevice: (device: ScannedDevice) => void,
  durationMs = 8000,
): { stop: () => void; done: Promise<void> } {
  const ble = getManager();
  const seen = new Set<string>();
  let stopped = false;

  void ble.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
    if (stopped || error || !device?.id) return;
    if (seen.has(device.id)) return;
    seen.add(device.id);

    const name = device.name ?? device.localName ?? 'Perangkat tanpa nama';
    onDevice({ id: device.id, name, rssi: device.rssi });
  });

  const done = new Promise<void>((resolve) => {
    setTimeout(() => {
      stopped = true;
      void ble.stopDeviceScan().finally(resolve);
    }, durationMs);
  });

  return {
    stop: () => {
      stopped = true;
      void ble.stopDeviceScan();
    },
    done,
  };
}

export async function connectDevice(deviceId: string): Promise<Device> {
  const ble = getManager();
  const device = await ble.connectToDevice(deviceId, { timeout: 12000 });
  await device.discoverAllServicesAndCharacteristics();
  return device;
}

export async function disconnectDevice(device: Device | null): Promise<void> {
  if (!device) return;
  try {
    await device.cancelConnection();
  } catch {
    // already disconnected
  }
}

async function writeLine(device: Device, line: string): Promise<void> {
  const payload = base64FromBytes(new TextEncoder().encode(line));
  await device.writeCharacteristicWithResponseForService(
    SEHATICA_BLE_SERVICE,
    SEHATICA_BLE_TX_CHAR,
    payload,
  );
  await delay(WRITE_DELAY_MS);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type TransferFilePayload = {
  recordId: number;
  title: string;
  fileName: string;
  mimeType: string;
  data: Uint8Array;
};

export async function sendRecordFile(
  device: Device,
  file: TransferFilePayload,
  onProgress?: (sent: number, total: number) => void,
): Promise<void> {
  const meta = {
    recordId: file.recordId,
    title: file.title,
    fileName: file.fileName,
    mimeType: file.mimeType,
    size: file.data.byteLength,
  };

  await writeLine(device, `SEHATICA_META:${JSON.stringify(meta)}`);

  const total = file.data.byteLength;
  let sent = 0;
  while (sent < total) {
    const chunk = file.data.subarray(sent, sent + CHUNK_SIZE);
    await writeLine(device, `SEHATICA_DATA:${base64FromBytes(chunk)}`);
    sent += chunk.byteLength;
    onProgress?.(sent, total);
  }

  await writeLine(device, 'SEHATICA_END');
}

export function destroyBluetoothManager(): void {
  manager?.destroy();
  manager = null;
}
