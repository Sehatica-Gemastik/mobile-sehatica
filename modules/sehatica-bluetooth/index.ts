import { Platform } from 'react-native';
import { EventEmitter, requireOptionalNativeModule } from 'expo-modules-core';

export type PairedBluetoothDevice = {
  id: string;
  name: string;
  address: string;
  paired?: string;
  nearby?: string;
};

type NativeModule = {
  getPairedDevices(): Promise<PairedBluetoothDevice[]>;
  scanNearbyDevices(durationMs: number): Promise<PairedBluetoothDevice[]>;
  stopScan(): Promise<void>;
  sendFile(address: string, fileUri: string, mimeType: string): Promise<void>;
};

function native(): NativeModule | null {
  if (Platform.OS !== 'android') return null;
  return requireOptionalNativeModule<NativeModule>('SehaticaBluetooth');
}

export async function getPairedBluetoothDevices(): Promise<PairedBluetoothDevice[]> {
  const mod = native();
  if (!mod) return [];
  return mod.getPairedDevices();
}

export async function scanNearbyBluetoothDevices(
  durationMs = 12000,
  onDevice?: (device: PairedBluetoothDevice) => void,
): Promise<PairedBluetoothDevice[]> {
  const mod = native();
  if (!mod) return [];
  const emitter = new EventEmitter(mod);
  const sub = onDevice ? emitter.addListener('onDeviceFound', onDevice) : null;
  try {
    return await mod.scanNearbyDevices(durationMs);
  } finally {
    sub?.remove();
  }
}

export async function sendFileToBluetoothDevice(
  address: string,
  fileUri: string,
  mimeType: string,
): Promise<void> {
  const mod = native();
  if (!mod) {
    throw new Error('Transfer Bluetooth hanya tersedia di Android.');
  }
  await mod.sendFile(address, fileUri, mimeType);
}
