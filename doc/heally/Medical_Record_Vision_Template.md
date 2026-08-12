# Rekam Medis — Parser Dokumen

Format standar: `sehatica-medical-record-v1`. Dua jalur parsing:

## Arsitektur

| Input | Pipeline | Model |
|-------|----------|-------|
| **PDF** | Ekstrak teks (`unpdf`) → LLM JSON | Groq teks (`LLM_MODEL`) |
| **Foto** (kamera/galeri) | Vision multimodal | Groq VLM (`LLM_MODEL`) |

- PDF **tidak** di-render ke bitmap — teks diekstrak dulu, lalu dikirim ke LLM.
- Vision **hanya untuk gambar** (foto resep, scan via kamera, dll).
- PDF scan tanpa layer teks → error: unggah foto via kamera.

## Alur mobile

1. **Upload PDF** → simpan lokal → backend ekstrak teks → LLM → JSON standar
2. **Pilih foto / kamera** → simpan lokal → backend Groq Vision → JSON standar
3. Bukan dokumen medis → record dihapus + alert

## Konfigurasi

```env
LLM_PROVIDER=groq
LLM_API_KEY=gsk_...
LLM_MODEL=qwen/qwen3.6-27b
```

Satu API key untuk Heally chat, PDF parse, dan foto vision.
