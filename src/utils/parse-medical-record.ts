import {
  DOCUMENT_KIND_LABELS,
  MEDICAL_RECORD_SCHEMA_VERSION,
  StandardMedicalRecord,
  VisionParseResult,
} from '@/types/medical-record-standard';

export function parseStandardMedicalRecord(content: string | null | undefined): StandardMedicalRecord | null {
  if (!content?.trim()) return null;
  try {
    const parsed = JSON.parse(content) as StandardMedicalRecord;
    if (parsed.schemaVersion !== MEDICAL_RECORD_SCHEMA_VERSION) return null;
    if (typeof parsed.isMedicalDocument !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function documentKindLabel(kind: StandardMedicalRecord['documentKind']): string {
  return DOCUMENT_KIND_LABELS[kind] ?? 'Dokumen Medis';
}

export function buildExportText(record: StandardMedicalRecord, fallbackTitle: string): string {
  const lines: string[] = [
    `# ${record.title || fallbackTitle}`,
    `Jenis: ${documentKindLabel(record.documentKind)}`,
    record.recordDate ? `Tanggal: ${record.recordDate}` : '',
    record.doctorName ? `Dokter: ${record.doctorName}` : '',
    record.facilityName ? `Fasilitas: ${record.facilityName}` : '',
    '',
    '## Ringkasan',
    record.summary,
  ].filter(Boolean);

  if (record.sections.diagnosis?.length) {
    lines.push('', '## Diagnosis', ...record.sections.diagnosis.map((d) => `- ${d}`));
  }
  if (record.sections.medications?.length) {
    lines.push('', '## Obat');
    for (const med of record.sections.medications) {
      lines.push(`- ${med.name}${med.dose ? ` ${med.dose}` : ''}${med.frequency ? ` · ${med.frequency}` : ''}`);
    }
  }
  if (record.sections.labResults?.length) {
    lines.push('', '## Hasil Lab');
    for (const lab of record.sections.labResults) {
      lines.push(`- ${lab.test}: ${lab.value ?? '-'} ${lab.unit ?? ''} ${lab.reference ? `(ref ${lab.reference})` : ''}`.trim());
    }
  }
  if (record.sections.instructions?.length) {
    lines.push('', '## Instruksi', ...record.sections.instructions.map((i) => `- ${i}`));
  }
  if (record.sections.rawExtractedText) {
    lines.push('', '## Teks Ekstraksi', record.sections.rawExtractedText);
  }

  lines.push('', '---', `Diekspor dari Sehatica · ${new Date().toLocaleString('id-ID')}`);
  return lines.join('\n');
}

export function visionResultToStandard(result: VisionParseResult): StandardMedicalRecord | null {
  try {
    const parsed = JSON.parse(result.extractedText) as StandardMedicalRecord;
    if (parsed.schemaVersion === MEDICAL_RECORD_SCHEMA_VERSION) return parsed;
  } catch {
    // fall through
  }
  return null;
}
