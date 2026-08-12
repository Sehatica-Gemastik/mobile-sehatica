# Heally — Jadwal Harian, PTM & Catatan (Planning)

Dokumen ini merangkum alur **jadwal per hari**, **screening risiko PTM**, **catatan harian**, filter **RDSA**, dan **CTA di chat Heally**.

---

## 1. Ringkasan produk

| Fitur | Perilaku |
|-------|----------|
| Jadwal harian | Dibuat **per tanggal**; AI menambah food/exercise/water; obat (**pill**) hanya manual |
| Update jadwal | User minta lewat chat atau tombol **AI** di tab Jadwal → regenerate item AI untuk hari itu |
| Screening PTM | Checklist faktor risiko **harian** (lokal); hasil mempengaruhi prompt jadwal AI |
| Catatan hari ini | Daily log (makan/obat/olahraga/air); mempengaruhi prompt jadwal AI |
| Reminder chat | Heally menampilkan **CTA** (bukan spam teks) jika screening/log belum lengkap |
| RDSA asks | **Tidak** mengirim ask tentang PTM/log jika user sudah menyelesaikannya hari ini |

---

## 2. Alur data

```text
Mobile (SQLite)                    Backend (Postgres)
─────────────────                  ───────────────────
screening_sessions  ──sync──►     user_daily_compliance
daily_logs          ──sync──►       (ptmScreeningDone, dailyLogsJson, …)
schedule_items      ──sync──►     scheduleSnapshotJson + schedules (AI)
                                   pendingScheduleIntent
                                   │
                                   ├─► Heally chat context (PTM + catatan)
                                   ├─► RDSA getEligibleArms (filter)
                                   └─► generateSchedule / auto-resume
```

Sync endpoint: `POST /api/v1/health/daily-sync`

Jika pasien diminta isi PTM + catatan sebelum jadwal (`pendingScheduleIntent`), backend mengirim **konfirmasi chat + CTA** saat sync dari tab Heally — **tidak** auto-generate jadwal.

---

## 3. Generate jadwal AI

### Input (mobile → backend)

- `date`, `timezone`
- `healthContext` — ringkasan rekam medis lokal
- `screeningSummary` — faktor PTM hari ini
- `dailyLogsSummary` — catatan harian
- `explicitMedicationInstructions` — obat manual (pill)

### Output

```json
{
  "items": [{ "type": "food|exercise|water", "label", "detail", "time", "colorScheme" }],
  "warnings": ["Jadwal obat tidak dibuat oleh AI …"]
}
```

### Aturan

- LLM **tidak** membuat jadwal pill baru
- Item AI diganti per hari (`replaceAiSchedules` di mobile)
- Faktor PTM (mis. kurang aktivitas) → tambahan olahraga ringan di prompt

---

## 4. Filter RDSA

Sebelum memilih arm, backend membaca `user_daily_compliance` untuk tanggal hari ini:

| Kondisi | Ask yang di-suppress |
|---------|----------------------|
| `ptmScreeningDone = true` | Ask dengan kata kunci screening/PTM/tekanan darah/gula, intent `nudge.records` |
| `dailyLogCount >= 1` | Ask check-in tentang catatan/gejala/energi/makan/air hari ini |

Ask tentang **jadwal** (mis. pengingat pill) tetap eligible jika snapshot jadwal menunjukkan item relevan.

---

## 5. CTA di chat Heally

Format marker (disembunyikan dari markdown, ditampilkan sebagai tombol):

```text
[HEALLY_CTA:generate_schedule|Buat jadwal AI hari ini]
[HEALLY_CTA:open_screening|Isi screening risiko PTM]
[HEALLY_CTA:open_daily_log|Catat aktivitas hari ini]
```

| CTA | Aksi mobile |
|-----|-------------|
| `generate_schedule` | `scheduleService.aiGenerate()` |
| `open_screening` | Navigate ke tab Screening |
| `open_daily_log` | Navigate ke Home (catatan hari ini) |

CTA ditambahkan oleh:

- Server setelah `POST /heally/chat` (berdasarkan compliance)
- RDSA ask tentang jadwal (`appendAskCtas`)

---

## 6. UI

- **Tab Jadwal** — tombol AI (modal generate) tetap ada
- **Tab Heally** — tombol CTA di bawah bubble assistant
- **Home** — catatan + kartu screening; sync compliance saat buka

---

## 7. Setup backend

Setelah pull, jalankan migrasi schema:

```bash
cd backend-sehatica && bun run db:push
```

---

## 8. Referensi kode

| Area | Path |
|------|------|
| Compliance sync | `backend-sehatica/src/services/heally/daily-compliance.ts` |
| RDSA filter | `backend-sehatica/src/services/rdsa/recommend.ts` |
| Generate jadwal | `backend-sehatica/src/services/ai.ts` → `generateSchedule` |
| Health route | `backend-sehatica/src/routes/health.ts` |
| Mobile sync | `mobile-sehatica/src/services/daily-sync.service.ts` |
| CTA parser | `mobile-sehatica/src/utils/heally-cta.ts` |
| Chat actions UI | `mobile-sehatica/src/components/heally-chat-actions.tsx` |

---

## 9. Dokumen terkait

- [Heally Plan](./Heally_Plan.md)
- [RDSA Implementation Plan](./RDSA_Implementation_Plan.md)
- [Heally Privacy & Security](./Heally_Privacy_Security.md)
