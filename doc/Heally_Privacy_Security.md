# Heally — Keamanan & Privasi LLM

Dokumen ini menjelaskan bagaimana Sehatica memisahkan **data lengkap di database lokal** dengan **payload yang dikirim ke provider LLM cloud** (mis. Groq, Gemini).

---

## 1. Prinsip

| Lapisan | Isi | Tujuan |
|--------|-----|--------|
| **Database (PostgreSQL)** | Chat penuh, nama, email, telepon, rekam medis asli, verifikasi dokter | Riwayat produk, audit, UX personal di app |
| **Request ke LLM cloud** | Konteks klinis de-identified, teks chat disanitasi, tanpa identitas langsung | Minimalkan PII yang keluar ke pihak ketiga |

Provider LLM **tidak** menerima nama lengkap, email, atau nomor telepon user. Usia dikirim sebagai **rentang** (bukan tanggal lahir exact).

---

## 2. Alur chat Heally

```
User mengetik pesan
    ↓
Simpan pesan ASLI → chat_messages (DB)
    ↓
Bangun konteks klinis de-identified + sanitasi pesan & riwayat
    ↓
Kirim ke LLM cloud (Groq / Gemini / …)
    ↓
Simpan jawaban Heally → chat_messages (DB)
```

Riwayat yang ditampilkan di app tetap **teks asli** user. Sanitasi hanya pada boundary sebelum `generateChat` / `generateText`.

Implementasi: `backend-sehatica/src/services/heally/privacy.ts` dan pemanggilan di `src/services/ai.ts`.

---

## 3. Field yang disamarkan sebelum LLM

### Identitas user

| Field DB | Ke LLM cloud |
|----------|----------------|
| `users.name` | Dihapus → pseudonym **"Pasien"** |
| `users.email` | Tidak dikirim; redact jika muncul di teks bebas |
| `users.phone` | Tidak dikirim; redact jika muncul di teks bebas |
| `users.dateOfBirth` | **Rentang usia** ±1 tahun (contoh: 39 th → `38-40 tahun`) |
| `users.bloodType` | Tetap (relevansi klinis, bukan identitas langsung) |
| `users.conditions`, `allergies` | Dikirim setelah sanitasi teks (nama/ kontak di dalam string ikut redact) |

### Rekam medis

- Judul, ringkasan, dan isi: **sanitasi regex + redact nama/kontak**
- `doctorName`: diganti label **"Dokter (nama disamarkan)"**
- `recordDate`: hanya **bulan + tahun** (bukan hari exact)

### Dokter partner

Nama dokter yang terhubung via `user_doctors` ditambahkan ke daftar **redactTerms** agar tidak ikut terkirim jika user menyebut nama dokter di chat.

### Pola otomatis di teks bebas

- Email
- Nomor HP Indonesia (`08…`, `+62…`)
- NIK 16 digit → `[NIK disamarkan]`
- Tanggal (`DD/MM/YYYY`, `YYYY-MM-DD`) → `[tanggal disamarkan]`
- Pola alamat (`Jl.`, `Jalan …`) → `[alamat disamarkan]`

---

## 4. Endpoint / fitur yang ter-cover

| Fitur | Sanitasi ke LLM |
|-------|------------------|
| Chat Heally | ✅ system prompt, history, pesan user |
| Jadwal harian AI | ✅ prompt |
| Daily insight | ✅ prompt |
| Ringkasan rekam medis teks/suara | ✅ prompt (+ profile user) |
| OCR gambar (Gemini Vision) | ⚠️ **Pengecualian** — gambar dokumen medis dikirim ke API vision; berpotensi berisi PII di dokumen. Provider saat ini: Gemini only. |

---

## 5. Konfigurasi

| Env | Default | Keterangan |
|-----|---------|------------|
| `LLM_PROVIDER` | `dummy` | Provider `dummy` tidak memanggil cloud → sanitasi bisa dilewati |
| `LLM_PRIVACY_SANITIZE` | *(tidak set = aktif untuk cloud)* | Set `false` hanya untuk debug lokal — **jangan di production** |

Log server **tidak** mencetak payload sanitasi mentah secara default; hindari log `console.log` prompt LLM di production.

---

## 6. Batasan & risiko residual

1. **De-identifikasi ≠ anonim sempurna** — kombinasi kondisi langka + rekam medis masih bisa jadi quasi-identifier. Review berkala diperlukan.
2. **User bisa mengetik PII baru** (nama kerabat, alamat detail) — regex menangkap pola umum, bukan semua variasi.
3. **OCR / vision** — jika aktif, gambar keluar ke provider; pertimbangkan consent terpisah atau OCR on-device di masa depan.
4. **Respons LLM** — model bisa mengulang detail klinis; tidak disimpan ulang ke cloud setelah generate; disimpan di DB milik Sehatica.
5. **Provider LLM** — kebijakan retensi/data training mengikuti kontrak masing-masing vendor (Groq, Google, dll.).

---

## 7. Checklist engineering

- [x] Modul `privacy.ts` (profile, age range, sanitasi teks & history)
- [x] `buildClinicalContextForProvider()` — full vs de-identified
- [x] `chatWithHeally` — sanitasi sebelum `generateChat`
- [x] Schedule, insight, summarize record — sanitasi prompt
- [ ] Consent UI di app (“data chat diproses oleh AI cloud dengan identitas disamarkan”)
- [ ] OCR: consent + warning sebelum upload ke vision API
- [ ] Audit log `llm_request_meta` (provider, token estimate, tanpa isi prompt) — opsional

---

## 8. Referensi kode

```
backend-sehatica/src/services/heally/privacy.ts   — de-identifikasi & sanitasi
backend-sehatica/src/services/heally/context.ts — konteks klinis full vs LLM
backend-sehatica/src/services/ai.ts               — boundary sebelum provider
backend-sehatica/src/config/llm.ts                — provider & env
```

---

## 9. Dokumen terkait

- [Heally Plan](./Heally_Plan.md)
- [RDSA Implementation Plan](./RDSA_Implementation_Plan.md)
- [Heally Message Templates](./Heally_Message_Templates.md)
