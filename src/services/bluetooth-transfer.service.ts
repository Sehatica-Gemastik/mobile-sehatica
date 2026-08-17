import { Platform, PermissionsAndroid } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import {
  getPairedBluetoothDevices,
  scanNearbyBluetoothDevices,
  sendFileToBluetoothDevice,
  type PairedBluetoothDevice,
} from 'sehatica-bluetooth';
import { base64FromBytes } from '@/utils/read-document-file';

export type ScannedDevice = PairedBluetoothDevice & {
  paired: boolean;
  nearby: boolean;
};

export function isBluetoothSupported(): boolean {
  return Platform.OS === 'android';
}

export function isLikelyComputerReceiver(name: string): boolean {
  return /macbook|macintosh|\bimac\b|\bmac\b|windows|laptop|pc\b/i.test(name);
}

function mapDevice(device: PairedBluetoothDevice): ScannedDevice {
  return {
    ...device,
    paired: device.paired === '1',
    nearby: device.nearby === '1',
  };
}

function mergeDevices(list: ScannedDevice[]): ScannedDevice[] {
  const byAddress = new Map<string, ScannedDevice>();
  for (const device of list) {
    const prev = byAddress.get(device.address);
    if (!prev) {
      byAddress.set(device.address, device);
      continue;
    }
    byAddress.set(device.address, {
      ...prev,
      ...device,
      name: device.name && device.name !== device.address ? device.name : prev.name,
      paired: prev.paired || device.paired,
      nearby: prev.nearby || device.nearby,
    });
  }
  return [...byAddress.values()].sort((a, b) => {
    if (a.nearby !== b.nearby) return a.nearby ? -1 : 1;
    if (a.paired !== b.paired) return a.paired ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const permissions: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS][] = [];
  if (Platform.Version >= 31) {
    permissions.push(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT!,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN!,
    );
  }
  permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!);

  const results = await PermissionsAndroid.requestMultiple(permissions);
  if (Platform.Version >= 31) {
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT!] === PermissionsAndroid.RESULTS.GRANTED
      && results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN!] === PermissionsAndroid.RESULTS.GRANTED
    );
  }
  return results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION!] === PermissionsAndroid.RESULTS.GRANTED;
}

export async function listPairedDevices(): Promise<ScannedDevice[]> {
  const granted = await requestBluetoothPermissions();
  if (!granted) {
    throw new Error('Izin Bluetooth dan lokasi diperlukan untuk melihat perangkat.');
  }
  const paired = await getPairedBluetoothDevices();
  return mergeDevices(paired.map(mapDevice));
}

export async function scanActiveDevices(
  onDevice?: (devices: ScannedDevice[]) => void,
): Promise<ScannedDevice[]> {
  const granted = await requestBluetoothPermissions();
  if (!granted) {
    throw new Error('Izin Bluetooth dan lokasi diperlukan untuk scan perangkat.');
  }

  let current: ScannedDevice[] = [];
  const scanned = await scanNearbyBluetoothDevices(12000, (device) => {
    current = mergeDevices([...current, mapDevice(device)]);
    onDevice?.(current);
  });
  return mergeDevices(scanned.map(mapDevice));
}

async function writeTempPdf(fileName: string, data: Uint8Array): Promise<string> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error('Cache tidak tersedia untuk transfer file.');
  const safeName = fileName.replace(/[^\w.-]+/g, '_') || 'rekam-medis.pdf';
  const uri = `${dir}${safeName}`;
  await FileSystem.writeAsStringAsync(uri, base64FromBytes(data), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

export async function sendPdfToPairedDevice(input: {
  address: string;
  fileName: string;
  mimeType: string;
  data: Uint8Array;
}): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('Transfer Bluetooth hanya tersedia di Android.');
  }

  const granted = await requestBluetoothPermissions();
  if (!granted) {
    throw new Error('Izin Bluetooth diperlukan untuk transfer file.');
  }

  const fileUri = await writeTempPdf(input.fileName, input.data);
  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await sendFileToBluetoothDevice(input.address, contentUri, input.mimeType);
}
