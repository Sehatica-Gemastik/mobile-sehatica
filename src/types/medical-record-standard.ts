import { RecordType } from '@/types';

export const MEDICAL_RECORD_SCHEMA_VERSION = 'sehatica-medical-record-v1';

export type MedicalDocumentKind =
  | 'prescription'
  | 'lab_result'
  | 'consultation_note'
  | 'medical_certificate'
  | 'imaging_report'
  | 'discharge_summary'
  | 'other_medical'
  | 'not_medical';

export type MedicationEntry = {
  name: string;
  dose?: string | null;
  frequency?: string | null;
  duration?: string | null;
  notes?: string | null;
};

export type LabResultEntry = {
  test: string;
  value?: string | null;
  unit?: string | null;
  reference?: string | null;
  flag?: string | null;
};

export type VitalEntry = {
  name: string;
  value: string;
  unit?: string | null;
};

export type StandardMedicalRecord = {
  schemaVersion: typeof MEDICAL_RECORD_SCHEMA_VERSION;
  isMedicalDocument: boolean;
  documentKind: MedicalDocumentKind;
  confidence: number;
  rejectionReason?: string | null;
  title: string;
  summary: string;
  recordDate: string | null;
  recordType: RecordType;
  tags: string[];
  doctorName: string | null;
  facilityName: string | null;
  sections: {
    chiefComplaint?: string | null;
    diagnosis?: string[];
    medications?: MedicationEntry[];
    labResults?: LabResultEntry[];
    vitals?: VitalEntry[];
    procedures?: string[];
    instructions?: string[];
    followUp?: string | null;
    rawExtractedText?: string | null;
  };
  parsingMeta?: {
    provider: string;
    model: string;
    parsedAt: string;
  };
};

export type VisionParseResult = {
  extractedText: string;
  title: string;
  summary: string;
  tags: string[];
  recordType: RecordType;
  isMedicalDocument: boolean;
  documentKind: MedicalDocumentKind;
  rejectionReason?: string | null;
  doctorName?: string | null;
  recordDate?: string | null;
};

export const DOCUMENT_KIND_LABELS: Record<MedicalDocumentKind, string> = {
  prescription: 'Resep Dokter',
  lab_result: 'Hasil Laboratorium',
  consultation_note: 'Catatan Konsultasi',
  medical_certificate: 'Surat Keterangan Medis',
  imaging_report: 'Laporan Pencitraan',
  discharge_summary: 'Ringkasan Pulang',
  other_medical: 'Dokumen Medis',
  not_medical: 'Bukan Dokumen Medis',
};
