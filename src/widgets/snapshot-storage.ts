import { File, Paths } from 'expo-file-system';
import { emptyWidgetSnapshot, type WidgetSnapshot } from './types';

const FILE_NAME = 'sehatica-widget-snapshot.json';

function snapshotFile() {
  return new File(Paths.document, FILE_NAME);
}

export async function loadWidgetSnapshot(): Promise<WidgetSnapshot> {
  try {
    const file = snapshotFile();
    if (!file.exists) return emptyWidgetSnapshot();
    const raw = await file.text();
    const parsed = JSON.parse(raw) as WidgetSnapshot;
    if (!parsed || typeof parsed !== 'object') return emptyWidgetSnapshot();
    return { ...emptyWidgetSnapshot(), ...parsed };
  } catch {
    return emptyWidgetSnapshot();
  }
}

export async function saveWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  const file = snapshotFile();
  file.write(JSON.stringify(snapshot));
}

export async function clearWidgetSnapshot(): Promise<void> {
  try {
    const file = snapshotFile();
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}
