# Heally Message Templates

> Library template (arms) ala Duolingo untuk **notifikasi**, **chat Heally**, **WhatsApp**, dan **pengingat sistem** (jadwal).
> Dipakai bersama [`Heally_Plan.md`](./Heally_Plan.md) + [`RDSA_Implementation_Plan.md`](./RDSA_Implementation_Plan.md).

## Cara pakai

| Field | Arti |
|---|---|
| `arm_id` | ID unik untuk RDSA / logging |
| `intent` | Kategori produk (eligibility) |
| `channels` | `push` · `system` · `chat` · `whatsapp` |
| `title` | Judul push / notifikasi (kosong = chat-only) |
| `body` | Isi pesan; placeholder `{{name}}`, `{{label}}`, `{{time}}`, dll. |
| `tone` | gentle / warm / playful / motivating / soft_urgent / … |

### Aturan channel

- **`system` / `push` murni**: pengingat jadwal, progress — boleh tanpa bubble chat.
- **`chat` / `whatsapp`**: masuk sebagai pesan Heally (bubble biasa); WA sinkron ke thread yang sama.
- Satu `ask_id` bisa kirim arm yang sama ke beberapa channel.
- Copy bersifat **pengingat / check-in**, bukan diagnosis. Saran kritis tetap jalur `needsVerif`.

**Total arms:** 300

## Index intent

- `ask.checkin` — 35 templates
- `ask.reengage` — 25 templates
- `celebration` — 10 templates
- `channel.whatsapp_short` — 20 templates
- `chat.suggestion` — 25 templates
- `chat.system` — 10 templates
- `insight.tip` — 15 templates
- `nudge.doctor` — 10 templates
- `nudge.missed` — 10 templates
- `nudge.records` — 10 templates
- `personal.name` — 10 templates
- `schedule.exercise` — 15 templates
- `schedule.food` — 15 templates
- `schedule.pill` — 25 templates
- `schedule.progress` — 10 templates
- `schedule.water` — 15 templates
- `time.afternoon` — 10 templates
- `time.evening` — 10 templates
- `time.morning` — 10 templates
- `time.night` — 10 templates

## Machine-readable (JSONL)

Salin ke seed DB / `notification_arms` bila perlu:

```jsonl
{"arm_id": "sched_pill_001", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Waktunya obat", "body": "Saatnya minum obat{{detail}}. Tandai selesai kalau sudah ya.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_002", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Pengingat obat", "body": "{{label}} jam {{time}} — jangan sampai terlewat.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_003", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Obat menunggu", "body": "Heally ingat: {{label}} belum ditandai selesai.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_004", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Sedikit lagi", "body": "Sekilas saja — minum obat sesuai jadwal {{time}}.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_005", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Untuk konsistensi", "body": "Rutin obat bantu pemulihan. Cek {{label}} sekarang.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_006", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Halo dari Heally", "body": "Pengingat lembut: {{label}} pukul {{time}}.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_007", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Jangan lupa", "body": "Obat {{label}} sudah waktunya.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_008", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Cek jadwal", "body": "Ada obat yang perlu diminum: {{label}}.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_009", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Satu langkah sehat", "body": "Minum obat sekarang biar streak jadwal tetap jalan.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_010", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Heally nanya", "body": "Sudah minum {{label}}? Balas atau tandai di app.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_011", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Pengingat singkat", "body": "{{time}} · {{label}}", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_012", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Tetap on track", "body": "Jadwal obatmu masih menunggu konfirmasi.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_013", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Sebelum sibuk", "body": "Ambil 10 detik untuk obat {{label}}.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_014", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Malam ini penting", "body": "Obat malam: {{label}}. Sudah?", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_015", "intent": "schedule.pill", "channels": ["push", "system", "chat"], "title": "Pagi dimulai", "body": "Obat pagi {{label}} siap dikonfirmasi.", "tone": "gentle", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_pill_016", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Heally cek: obat {{label}} belum selesai.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_017", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Kalau belum minum {{label}}, sekarang waktu yang bagus.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_018", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Kesehatanmu prioritas — {{label}} jam {{time}}.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_019", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Satu centang kecil: {{label}}.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_020", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Pengingat dari jadwalmu: {{label}}.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_021", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Masih sempat: tandai {{label}} sudah diminum.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_022", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Heally di sini supaya {{label}} tidak terlupakan.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_023", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Obat terjadwal menunggu balasanmu.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_024", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Buka Sehatica dan selesaikan {{label}}.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_pill_025", "intent": "schedule.pill", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat obat", "body": "Yuk selesaikan obat {{label}} sebelum lupa.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_001", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Waktunya makan", "body": "Jadwal makan: {{label}} pukul {{time}}.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_002", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat makan", "body": "Sudah makan sesuai rencana? {{label}}", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_003", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Nutrisi dulu", "body": "Heally ingat jadwal makanmu: {{label}}.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_004", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Jeda sehat", "body": "Saatnya {{label}}. Tandai jika sudah.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_005", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Makan teratur", "body": "Pola makan rutin membantu. Cek {{label}}.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_006", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Halo lapar?", "body": "Jadwal {{label}} sudah masuk.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_007", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Konsistensi", "body": "Tandai {{label}} supaya Heally bisa bantu lebih akurat.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_008", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Reminder lembut", "body": "{{time}} · jangan lewatkan {{label}}.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_009", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Dari jadwalmu", "body": "Aktivitas makan: {{label}}.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_010", "intent": "schedule.food", "channels": ["push", "chat", "whatsapp"], "title": "Heally nanya", "body": "Sudah {{label}}? Balas di chat atau WA.", "tone": "gentle", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_011", "intent": "schedule.food", "channels": ["push", "system"], "title": "Jadwal makan", "body": "Makan sesuai jadwal bantu energi stabil. {{label}}", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_012", "intent": "schedule.food", "channels": ["push", "system"], "title": "Jadwal makan", "body": "Cek {{label}} — sudah atau belum?", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_013", "intent": "schedule.food", "channels": ["push", "system"], "title": "Jadwal makan", "body": "Pengingat singkat: {{label}} jam {{time}}.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_014", "intent": "schedule.food", "channels": ["push", "system"], "title": "Jadwal makan", "body": "Satu langkah: selesaikan jadwal makan {{label}}.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_food_015", "intent": "schedule.food", "channels": ["push", "system"], "title": "Jadwal makan", "body": "Heally jaga ritme makamu hari ini.", "tone": "neutral", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_water_001", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Saatnya minum air. {{detail}}", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_002", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Hidrasi dulu — {{label}}.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_003", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Segelas air untuk tubuhmu sekarang.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_004", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Heally: jangan lupa minum air.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_005", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Pengingat air: {{time}}.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_006", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Tubuhmu butuh cairan. Tandai {{label}}.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_007", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Minum air sebentar, lanjut aktivitas.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_008", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Streak hidrasi menunggu satu centang.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_009", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Air dulu, baru sibuk lagi.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_010", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Reminder lembut: minum air sekarang.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_011", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Sudah minum air belum? {{label}}", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_012", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Heally jaga agar kamu tidak dehidrasi.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_013", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Satu teguk besar sekarang juga.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_014", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Jadwal air {{time}} sudah tiba.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_water_015", "intent": "schedule.water", "channels": ["push", "system"], "title": "Minum air", "body": "Hidrasi = fokus lebih baik. Yuk minum.", "tone": "playful", "placeholders": ["label", "time", "detail"], "locale": "id"}
{"arm_id": "sched_exercise_001", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Gerak sebentar", "body": "Jadwal olahraga: {{label}} pukul {{time}}.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_002", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Waktunya aktif", "body": "{{label}} menunggu. Bisa singkat saja.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_003", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Badan kaku?", "body": "Heally usul: mulai {{label}} sekarang.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_004", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Olahraga ringan", "body": "Selesaikan {{label}} biar jadwal hari ini lengkap.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_005", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Energi naik", "body": "Saatnya {{label}}.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_006", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Konsistensi gerak", "body": "Jangan skip {{label}} hari ini.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_007", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat gerak", "body": "{{time}} · {{label}}", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_008", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Heally nanya", "body": "Sudah olahraga ({{label}})?", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_009", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Langkah kecil", "body": "5–10 menit {{label}} sudah berarti.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_010", "intent": "schedule.exercise", "channels": ["push", "chat", "whatsapp"], "title": "Dari jadwalmu", "body": "Aktivitas: {{label}}.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_011", "intent": "schedule.exercise", "channels": ["push", "system"], "title": "Olahraga", "body": "Gerakan ringan lebih baik daripada tidak sama sekali: {{label}}.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_012", "intent": "schedule.exercise", "channels": ["push", "system"], "title": "Olahraga", "body": "Heally siap dampingi setelah {{label}} selesai.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_013", "intent": "schedule.exercise", "channels": ["push", "system"], "title": "Olahraga", "body": "Tandai {{label}} kalau sudah bergerak.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_014", "intent": "schedule.exercise", "channels": ["push", "system"], "title": "Olahraga", "body": "Olahraga terjadwal: {{label}}.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_exercise_015", "intent": "schedule.exercise", "channels": ["push", "system"], "title": "Olahraga", "body": "Yuk selesaikan {{label}} sebelum hari berakhir.", "tone": "motivating", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "sched_progress_001", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Jadwal menunggu", "body": "Ada aktivitas belum selesai hari ini.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_002", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Progress hari ini", "body": "{{done}}/{{total}} selesai. Yuk lanjut.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_003", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Hampir selesai", "body": "Tinggal sedikit lagi dari jadwal hari ini.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_004", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Satu item tersisa", "body": "Selesaikan sisa jadwal supaya 100%.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_005", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Ringkasan sore", "body": "Cek sisa jadwal sebelum malam.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_006", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Ringkasan malam", "body": "Masih ada jadwal belum ditandai.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_007", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Mulai hari", "body": "Lihat jadwal pagi milikmu.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_008", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Heally update", "body": "Jadwalmu butuh sedikit perhatian.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_009", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Jangan biarkan menumpuk", "body": "Selesaikan satu item jadwal sekarang.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "sched_progress_010", "intent": "schedule.progress", "channels": ["push", "system"], "title": "Kembali ke ritme", "body": "Buka jadwal dan centang yang sudah dilakukan.", "tone": "neutral", "placeholders": ["done", "total"], "locale": "id"}
{"arm_id": "ask_checkin_001", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Cek kondisi", "body": "Bagaimana perasaanmu hari ini?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_002", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally penasaran", "body": "Ada keluhan yang perlu dibahas?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_003", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Check-in singkat", "body": "Skala 1–5, energimu hari ini berapa?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_004", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Kabarin Heally", "body": "Sudah lebih baik dibanding kemarin?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_005", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Satu pertanyaan", "body": "Tidurmu semalam cukup?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_006", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Halo {{name}}", "body": "Mau cerita singkat soal kondisi hari ini?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_007", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally di sini", "body": "Kalau ada gejala baru, bilang saja.", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_008", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Update cepat", "body": "Nyeri / pusing / lelah — ada yang muncul?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_009", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Jaga-jaga", "body": "Ada yang terasa tidak biasa hari ini?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_010", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Obrolan singkat", "body": "Heally siap dengarkan 1 menit saja.", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_011", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Kondisi malam", "body": "Sebelum istirahat, ada yang ingin dicatat?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_012", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Kondisi pagi", "body": "Mulai hari: badan terasa oke?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_013", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Follow-up", "body": "Kemarin kamu bilang {{topic}}. Sekarang bagaimana?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_014", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Cek kepatuhan", "body": "Obat kemarin semua diminum?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_015", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Catatan kesehatan", "body": "Mau Heally catat gejala hari ini?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_016", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Tanya kecil", "body": "Nafsu makanmu hari ini bagaimana?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_017", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Tanya kecil", "body": "Tekanan / detak — sudah diukur?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_018", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Tanya kecil", "body": "Sudah minum air cukup hari ini?", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_019", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Dampingi", "body": "Kalau bingung soal jadwal, tanya Heally.", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_020", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Akurasi saran", "body": "Update kondisi biar saran Heally lebih pas.", "tone": "gentle", "placeholders": ["name", "topic"], "locale": "id"}
{"arm_id": "ask_checkin_021", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Heally mau pastikan: ada gejala yang mengkhawatirkan?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_022", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Balas singkat saja — baik / biasa / kurang fit.", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_023", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Kalau lagi oke, cukup bilang “baik”.", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_024", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Kalau kurang fit, ceritakan gejalanya.", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_025", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Satu kata pun membantu Heally memahami harimu.", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_026", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Ada yang ingin diverifikasi dokter lewat Heally?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_027", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Mau review singkat rekam medis terakhir?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_028", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Perlu Heally cek interaksi obat?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_029", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Mau dibuatkan jadwal olahraga ringan?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_030", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Mau tips diet sesuai kondisimu?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_031", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Bagaimana stres / beban pikiran hari ini?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_032", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Apakah obat terasa efek samping?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_033", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Sudah ukur tekanan darah / gula hari ini?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_034", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Ada janji dokter yang perlu diingat?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_checkin_035", "intent": "ask.checkin", "channels": ["chat", "whatsapp"], "title": "Heally nanya", "body": "Mau Heally ringkas progress minggu ini?", "tone": "curious", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_001", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Kami kangen", "body": "Heally belum dengar kabarmu. Ada yang bisa dibantu?", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_002", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Masih di sini", "body": "Kapan saja siap saat kamu butuh.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_003", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Lanjut lagi?", "body": "Jadwal kesehatanmu menunggu di Sehatica.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_004", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Satu menit saja", "body": "Buka Heally sebentar untuk update kondisi.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_005", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Jangan hilang", "body": "Konsistensi kecil lebih baik daripada berhenti.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_006", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Halo lagi", "body": "{{name}}, yuk cek progress kesehatanmu.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_007", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally menunggu", "body": "Ada pertanyaan tertunda untukmu.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_008", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Kembali ke ritme", "body": "Mulai dari satu centang jadwal hari ini.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_009", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Pengingat lembut", "body": "Sudah beberapa hari. Mau check-in singkat?", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_010", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "WA atau app", "body": "Balas di sini atau buka Sehatica — sama saja.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_011", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Streak putus?", "body": "Tidak masalah. Mulai lagi dari sekarang.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_012", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Kami jaga datamu", "body": "Rekam medis tetap aman. Tinggal lanjut chat.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_013", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Sore yang tenang", "body": "Waktu bagus untuk update singkat ke Heally.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_014", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Malam tenang", "body": "Sebelum tidur, kabari Heally kabarmu.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_015", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Pagi baru", "body": "Mulai hari dengan satu pertanyaan sehat.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "ask_reengage_016", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Heally punya pertanyaan singkat untukmu.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_017", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Ada follow-up kesehatan yang tertunda.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_018", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Balas kapan saja — Heally tidak menghakimi.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_019", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Satu balasan membantu saran jadi lebih akurat.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_020", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Sehatica siap saat kamu siap.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_021", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Jadwal dan Heally menunggu di app.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_022", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Kalau sibuk, balas nanti juga boleh.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_023", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Pengingat: kesehatan butuh ritme, bukan sempurna.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_024", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Kamu tidak sendirian — Heally dampingi.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "ask_reengage_025", "intent": "ask.reengage", "channels": ["push", "chat", "whatsapp"], "title": "Heally mengingatmu", "body": "Yuk lanjut perjalanan sehatmu.", "tone": "warm", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_001", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Lengkapi rekam", "body": "Upload hasil kunjungan biar Heally lebih akurat.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_002", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Rekam medis", "body": "Belum ada catatan baru. Mau tambah sekarang?", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_003", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Foto lab?", "body": "Bisa OCR dokumen medis di tab Rekam.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_004", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Catatan singkat", "body": "Tulis keluhan hari ini di rekam medis.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_005", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Agar saran pas", "body": "Heally butuh data terbaru dari rekammu.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_006", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Setelah kontrol", "body": "Simpan hasil dokter ke Sehatica.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_007", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Jangan hilang", "body": "Simpan ringkasan konsultasi sekarang.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_008", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Satu upload", "body": "Foto resep / hasil lab cukup untuk mulai.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_009", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Update data", "body": "Rekam medis membantu verifikasi dokter.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_records_010", "intent": "nudge.records", "channels": ["push", "chat", "whatsapp"], "title": "Heally sarankan", "body": "Tambah catatan kondisi minggu ini.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_001", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Partner dokter", "body": "Scan QR dokter untuk menambah partner.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_002", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Verifikasi", "body": "Ada saran Heally yang bisa diminta verifikasi dokter.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_003", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Dokter online", "body": "Partner doktermu tersedia untuk konsultasi.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_004", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Menunggu dokter", "body": "Permintaan verifikasi masih diproses.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_005", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Hasil verifikasi", "body": "Dokter sudah meninjau saran Heally.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_006", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Tambah partner", "body": "Hubungkan dokter lewat QR di tab Dokter.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_007", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Aman dulu", "body": "Untuk saran kritis, minta verifikasi dokter ya.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_008", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Update partner", "body": "Cek status dokter partner di Sehatica.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_009", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "Konsultasi", "body": "Dokter partner siap dihubungi.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_doctor_010", "intent": "nudge.doctor", "channels": ["push", "system", "chat"], "title": "QR siap", "body": "Minta kode QR ke dokter klinikmu.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "celeb_001", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Mantap!", "body": "Jadwal hari ini 100% selesai.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_002", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Bagus!", "body": "Obat ditandai tepat waktu. Heally bangga.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_003", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Progres bagus", "body": "{{done}} aktivitas selesai hari ini.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_004", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Konsisten", "body": "Kamu menjaga ritme — itu yang penting.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_005", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Streak hidup", "body": "Hari berturut terisi. Lanjut besok!", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_006", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Satu kemenangan", "body": "Centang kecil, dampak besar.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_007", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Heally apresiasi", "body": "Terima kasih sudah update kondisimu.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_008", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Rekam tersimpan", "body": "Catatan medis berhasil ditambahkan.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_009", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Partner terhubung", "body": "Dokter berhasil ditambahkan.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "celeb_010", "intent": "celebration", "channels": ["push", "chat", "whatsapp"], "title": "Balasan diterima", "body": "Heally sudah membaca pesanmu.", "tone": "positive", "placeholders": ["done"], "locale": "id"}
{"arm_id": "tod_morning_001", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Selamat pagi{{name_suffix}}. Badan terasa fit?", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_002", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Pagi! Cek jadwal obat / makan pagi yuk.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_003", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Mulai hari dengan satu centang sehat.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_004", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Heally ucapkan pagi. Ada keluhan semalam?", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_005", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Pagi adalah waktu bagus untuk minum air.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_006", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Lihat jadwal pagi sebelum aktivitas padat.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_007", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Satu pertanyaan pagi: tidurmu cukup?", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_008", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Heally siap dampingi harimu.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_009", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Jangan skip sarapan / obat pagi ya.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_morning_010", "intent": "time.morning", "channels": ["push", "chat", "whatsapp"], "title": "Pagi dari Heally", "body": "Kabarin Heally kalau kurang fit pagi ini.", "tone": "warm", "placeholders": ["name_suffix"], "locale": "id"}
{"arm_id": "tod_afternoon_001", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Siang. Sudah minum air cukup?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_002", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Heally cek: jadwal siang sudah ditandai?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_003", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Istirahat sebentar dan update kondisi?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_004", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Siang produktif — jangan lupa obat siang.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_005", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Bagaimana energimu sore menjelang?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_006", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Ada gejala yang muncul siang ini?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_007", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Cek sisa jadwal sebelum sore.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_008", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Heally siap kalau mau tanya cepat.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_009", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Makan siang sesuai rencana?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_afternoon_010", "intent": "time.afternoon", "channels": ["push", "chat", "whatsapp"], "title": "Siang dari Heally", "body": "Satu napas, satu teguk air.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_001", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Sore. Saatnya review jadwal hari ini.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_002", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Bagaimana harimu secara keseluruhan?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_003", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Obat malam jangan sampai lupa.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_004", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Heally nanya: ada yang perlu dicatat?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_005", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Sisa jadwal: selesaikan sebelum malam.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_006", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Update singkat biar saran malam lebih pas.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_007", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Sudah olahraga / jalan sore?", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_008", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Minum air terakhir sebelum malam.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_009", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Cerita ke Heally kalau ada keluhan sore.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_evening_010", "intent": "time.evening", "channels": ["push", "chat", "whatsapp"], "title": "Sore dari Heally", "body": "Sore tenang — check-in 30 detik saja.", "tone": "gentle", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_001", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Menjelang tidur: sudah minum obat malam?", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_002", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Tidur cukup bantu pemulihan. Siap istirahat?", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_003", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Heally: catat keluhan sebelum tidur?", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_004", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Matikan notifikasi lain, tapi jangan skip obat malam.", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_005", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Satu checklist malam: air, obat, istirahat.", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_006", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Kalau insomnia / nyeri malam, kabari Heally.", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_007", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Selamat beristirahat. Heally jaga ringkasanmu.", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_008", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Malam ini, tubuhmu butuh istirahat.", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_009", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Review singkat hari ini sebelum tidur?", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "tod_night_010", "intent": "time.night", "channels": ["push", "chat", "whatsapp"], "title": "Malam dari Heally", "body": "Jadwal besok sudah siap — tidur dulu.", "tone": "calm", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_001", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Heally: sudah minum obat?", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_002", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Cek jadwal yuk 👆", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_003", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Kabarin kondisi hari ini dong", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_004", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Minum air dulu ya", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_005", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Ada gejala baru?", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_006", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Tandai jadwal di Sehatica", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_007", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Heally tunggu balasan singkat", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_008", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Obat malam jangan lupa", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_009", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Upload lab kalau sudah ada", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_010", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Scan QR dokter di app", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_011", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Baik / kurang fit? Balas satu kata", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_012", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Progress jadwal: buka app sebentar", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_013", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Follow-up dari Heally 💬", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_014", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Pertanyaan cepat dari Heally", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_015", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Sinkron WA ↔ Sehatica aktif", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_016", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Butuh verifikasi dokter?", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_017", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Jadwal olahraga hari ini?", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_018", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Makan sesuai jadwal?", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_019", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Heally di sini 24/7 (bot)", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "wa_short_020", "intent": "channel.whatsapp_short", "channels": ["whatsapp"], "title": "Heally", "body": "Balas kapan saja", "tone": "concise", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_001", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Cek interaksi obat saya", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_002", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Buat jadwal olahraga", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_003", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Tips diet untuk kondisi saya", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_004", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Analisis rekam medis saya", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_005", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Gejala yang perlu diwaspadai", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_006", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Ringkas hasil lab terakhir", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_007", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Apa arti diagnosis saya?", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_008", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Jadwal minum obat ideal", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_009", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Tips tidur lebih baik", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_010", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Cek kepatuhan jadwal minggu ini", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_011", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Kapan harus ke dokter?", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_012", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Saran olahraga ringan di rumah", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_013", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Makanan yang sebaiknya dihindari", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_014", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Cara catat gejala harian", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_015", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Persiapan sebelum kontrol dokter", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_016", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Apa itu efek samping obat saya?", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_017", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Bantu buat checklist harian", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_018", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Tips mengelola stres", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_019", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Ingatkan saya minum air", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_020", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Review progress kesehatan bulan ini", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_021", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Apakah olahraga ini aman untuk saya?", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_022", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Bantu interpretasi tekanan darah", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_023", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Saran menu makan pagi sehat", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_024", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Apa yang harus dilakukan jika pusing?", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_suggest_025", "intent": "chat.suggestion", "channels": ["chat"], "title": "", "body": "Buat pengingat obat malam", "tone": "neutral", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_001", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Halo! Saya Heally. Asisten kesehatan AI Anda.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_002", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Silakan pilih topik di bawah atau ketik pertanyaan.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_003", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Saya bisa bantu pahami rekam medis, jadwal, dan gejala.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_004", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Saran saya bisa diminta verifikasi dokter partner.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_005", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Data kesehatanmu dipakai untuk personalisasi — kamu kendalikan.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_006", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Mau mulai dari jadwal, rekam, atau keluhan hari ini?", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_007", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Tanya apa saja — mulai dari yang sederhana juga boleh.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_008", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Jika mendesak / darurat, hubungi layanan medis setempat.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_009", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Heally bukan pengganti dokter, tapi teman pantau harian.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "chat_system_010", "intent": "chat.system", "channels": ["chat", "whatsapp"], "title": "Heally", "body": "Kamu bisa lanjut di WhatsApp dengan nomor yang sama terhubung.", "tone": "informative", "placeholders": [], "locale": "id"}
{"arm_id": "nudge_missed_001", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Terlewat", "body": "{{label}} belum ditandai. Masih sempat sekarang.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_002", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Lewat jam", "body": "Jadwal {{time}} terlewat — selesaikan jika masih relevan.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_003", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Perlu perhatian", "body": "Beberapa item jadwal tertunda hari ini.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_004", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Follow-up", "body": "Kemarin ada jadwal belum selesai. Lanjut hari ini?", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_005", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Jangan menumpuk", "body": "Selesaikan satu yang tertunda dulu: {{label}}.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_006", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Heally khawatir kecil", "body": "Sudah lama tidak ada update kepatuhan jadwal.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_007", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Cek sekarang", "body": "Ada pengingat penting yang belum direspons.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_008", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Agar akurat", "body": "Tanpa konfirmasi, Heally sulit menyesuaikan saran.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_009", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Prioritas", "body": "Fokus ke {{label}} dulu hari ini.", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "nudge_missed_010", "intent": "nudge.missed", "channels": ["push", "chat", "whatsapp"], "title": "Masih relevan?", "body": "Apakah {{label}} masih perlu dilakukan?", "tone": "soft_urgent", "placeholders": ["label", "time"], "locale": "id"}
{"arm_id": "insight_tip_001", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Minum air sebelum kopi membantu hidrasi pagi.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_002", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Jalan kaki 10 menit setelah makan bisa bantu metabolisme.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_003", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Catat gejala di jam yang sama tiap hari biar polanya kelihatan.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_004", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Obat lebih mudah diingat jika dipasangkan ke kebiasaan (mis. setelah sikat gigi).", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_005", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Tidur teratur sering lebih berdampak daripada “sempurna sekali”.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_006", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Kalau pusing saat berdiri, duduk dulu lalu kabari Heally.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_007", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Foto label obat membantu Heally mengingatkan dosis.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_008", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Satu pertanyaan ke dokter di kontrol lebih baik daripada sepuluh yang terlupa.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_009", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Streak kecil mengalahkan motivasi besar yang putus.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_010", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Kalau ragu saran AI, minta verifikasi dokter di app.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_011", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Kurangi scroll malam — tidur lebih dalam bantu pemulihan.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_012", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Garam & gula: catat jika dokter meminta pantauan.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_013", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Olahraga bukan harus gym — naik tangga juga dihitung.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_014", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Bawa botol minum kecil di tas mengurangi lupa hidrasi.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "insight_tip_015", "intent": "insight.tip", "channels": ["chat", "whatsapp", "push"], "title": "Tips Heally", "body": "Update alergi/kondisi di profil biar saran lebih aman.", "tone": "helpful", "placeholders": [], "locale": "id"}
{"arm_id": "pers_name_001", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, jadwalmu menunggu sebentar saja.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_002", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, Heally punya pertanyaan singkat.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_003", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, sudah minum obat hari ini?", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_004", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, kabari kondisi biar kami bisa bantu.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_005", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, progress minggu ini bisa kita review.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_006", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, jangan lupa hidrasi.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_007", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, partner dokter bisa ditambah lewat QR.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_008", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, rekam medis terbaru bantu akurasi saran.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_009", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, satu centang jadwal sekarang juga boleh.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
{"arm_id": "pers_name_010", "intent": "personal.name", "channels": ["push", "chat", "whatsapp"], "title": "Hai {{name}}", "body": "{{name}}, Heally siap di WA maupun app.", "tone": "warm", "placeholders": ["name"], "locale": "id"}
```

## Check-in Heally (`ask.checkin`)

### `ask_checkin_001`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Cek kondisi
- **body:** Bagaimana perasaanmu hari ini?

### `ask_checkin_002`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Heally penasaran
- **body:** Ada keluhan yang perlu dibahas?

### `ask_checkin_003`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Check-in singkat
- **body:** Skala 1–5, energimu hari ini berapa?

### `ask_checkin_004`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Kabarin Heally
- **body:** Sudah lebih baik dibanding kemarin?

### `ask_checkin_005`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Satu pertanyaan
- **body:** Tidurmu semalam cukup?

### `ask_checkin_006`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Halo {{name}}
- **body:** Mau cerita singkat soal kondisi hari ini?

### `ask_checkin_007`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Heally di sini
- **body:** Kalau ada gejala baru, bilang saja.

### `ask_checkin_008`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Update cepat
- **body:** Nyeri / pusing / lelah — ada yang muncul?

### `ask_checkin_009`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Jaga-jaga
- **body:** Ada yang terasa tidak biasa hari ini?

### `ask_checkin_010`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Obrolan singkat
- **body:** Heally siap dengarkan 1 menit saja.

### `ask_checkin_011`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Kondisi malam
- **body:** Sebelum istirahat, ada yang ingin dicatat?

### `ask_checkin_012`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Kondisi pagi
- **body:** Mulai hari: badan terasa oke?

### `ask_checkin_013`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Follow-up
- **body:** Kemarin kamu bilang {{topic}}. Sekarang bagaimana?

### `ask_checkin_014`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Cek kepatuhan
- **body:** Obat kemarin semua diminum?

### `ask_checkin_015`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Catatan kesehatan
- **body:** Mau Heally catat gejala hari ini?

### `ask_checkin_016`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Tanya kecil
- **body:** Nafsu makanmu hari ini bagaimana?

### `ask_checkin_017`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Tanya kecil
- **body:** Tekanan / detak — sudah diukur?

### `ask_checkin_018`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Tanya kecil
- **body:** Sudah minum air cukup hari ini?

### `ask_checkin_019`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Dampingi
- **body:** Kalau bingung soal jadwal, tanya Heally.

### `ask_checkin_020`

- **channels:** chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{name}}`, `{{topic}}`
- **title:** Akurasi saran
- **body:** Update kondisi biar saran Heally lebih pas.

### `ask_checkin_021`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Heally mau pastikan: ada gejala yang mengkhawatirkan?

### `ask_checkin_022`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Balas singkat saja — baik / biasa / kurang fit.

### `ask_checkin_023`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Kalau lagi oke, cukup bilang “baik”.

### `ask_checkin_024`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Kalau kurang fit, ceritakan gejalanya.

### `ask_checkin_025`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Satu kata pun membantu Heally memahami harimu.

### `ask_checkin_026`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Ada yang ingin diverifikasi dokter lewat Heally?

### `ask_checkin_027`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Mau review singkat rekam medis terakhir?

### `ask_checkin_028`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Perlu Heally cek interaksi obat?

### `ask_checkin_029`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Mau dibuatkan jadwal olahraga ringan?

### `ask_checkin_030`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Mau tips diet sesuai kondisimu?

### `ask_checkin_031`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Bagaimana stres / beban pikiran hari ini?

### `ask_checkin_032`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Apakah obat terasa efek samping?

### `ask_checkin_033`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Sudah ukur tekanan darah / gula hari ini?

### `ask_checkin_034`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Ada janji dokter yang perlu diingat?

### `ask_checkin_035`

- **channels:** chat, whatsapp
- **tone:** curious
- **title:** Heally nanya
- **body:** Mau Heally ringkas progress minggu ini?

## Re-engagement (`ask.reengage`)

### `ask_reengage_001`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Kami kangen
- **body:** Heally belum dengar kabarmu. Ada yang bisa dibantu?

### `ask_reengage_002`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Masih di sini
- **body:** Kapan saja siap saat kamu butuh.

### `ask_reengage_003`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Lanjut lagi?
- **body:** Jadwal kesehatanmu menunggu di Sehatica.

### `ask_reengage_004`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Satu menit saja
- **body:** Buka Heally sebentar untuk update kondisi.

### `ask_reengage_005`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Jangan hilang
- **body:** Konsistensi kecil lebih baik daripada berhenti.

### `ask_reengage_006`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Halo lagi
- **body:** {{name}}, yuk cek progress kesehatanmu.

### `ask_reengage_007`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Heally menunggu
- **body:** Ada pertanyaan tertunda untukmu.

### `ask_reengage_008`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Kembali ke ritme
- **body:** Mulai dari satu centang jadwal hari ini.

### `ask_reengage_009`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Pengingat lembut
- **body:** Sudah beberapa hari. Mau check-in singkat?

### `ask_reengage_010`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** WA atau app
- **body:** Balas di sini atau buka Sehatica — sama saja.

### `ask_reengage_011`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Streak putus?
- **body:** Tidak masalah. Mulai lagi dari sekarang.

### `ask_reengage_012`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Kami jaga datamu
- **body:** Rekam medis tetap aman. Tinggal lanjut chat.

### `ask_reengage_013`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Sore yang tenang
- **body:** Waktu bagus untuk update singkat ke Heally.

### `ask_reengage_014`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Malam tenang
- **body:** Sebelum tidur, kabari Heally kabarmu.

### `ask_reengage_015`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Pagi baru
- **body:** Mulai hari dengan satu pertanyaan sehat.

### `ask_reengage_016`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Heally punya pertanyaan singkat untukmu.

### `ask_reengage_017`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Ada follow-up kesehatan yang tertunda.

### `ask_reengage_018`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Balas kapan saja — Heally tidak menghakimi.

### `ask_reengage_019`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Satu balasan membantu saran jadi lebih akurat.

### `ask_reengage_020`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Sehatica siap saat kamu siap.

### `ask_reengage_021`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Jadwal dan Heally menunggu di app.

### `ask_reengage_022`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Kalau sibuk, balas nanti juga boleh.

### `ask_reengage_023`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Pengingat: kesehatan butuh ritme, bukan sempurna.

### `ask_reengage_024`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Kamu tidak sendirian — Heally dampingi.

### `ask_reengage_025`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **title:** Heally mengingatmu
- **body:** Yuk lanjut perjalanan sehatmu.

## Apresiasi / sukses (`celebration`)

### `celeb_001`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Mantap!
- **body:** Jadwal hari ini 100% selesai.

### `celeb_002`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Bagus!
- **body:** Obat ditandai tepat waktu. Heally bangga.

### `celeb_003`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Progres bagus
- **body:** {{done}} aktivitas selesai hari ini.

### `celeb_004`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Konsisten
- **body:** Kamu menjaga ritme — itu yang penting.

### `celeb_005`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Streak hidup
- **body:** Hari berturut terisi. Lanjut besok!

### `celeb_006`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Satu kemenangan
- **body:** Centang kecil, dampak besar.

### `celeb_007`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Heally apresiasi
- **body:** Terima kasih sudah update kondisimu.

### `celeb_008`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Rekam tersimpan
- **body:** Catatan medis berhasil ditambahkan.

### `celeb_009`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Partner terhubung
- **body:** Dokter berhasil ditambahkan.

### `celeb_010`

- **channels:** push, chat, whatsapp
- **tone:** positive
- **placeholders:** `{{done}}`
- **title:** Balasan diterima
- **body:** Heally sudah membaca pesanmu.

## WhatsApp singkat (`channel.whatsapp_short`)

### `wa_short_001`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Heally: sudah minum obat?

### `wa_short_002`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Cek jadwal yuk 👆

### `wa_short_003`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Kabarin kondisi hari ini dong

### `wa_short_004`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Minum air dulu ya

### `wa_short_005`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Ada gejala baru?

### `wa_short_006`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Tandai jadwal di Sehatica

### `wa_short_007`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Heally tunggu balasan singkat

### `wa_short_008`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Obat malam jangan lupa

### `wa_short_009`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Upload lab kalau sudah ada

### `wa_short_010`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Scan QR dokter di app

### `wa_short_011`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Baik / kurang fit? Balas satu kata

### `wa_short_012`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Progress jadwal: buka app sebentar

### `wa_short_013`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Follow-up dari Heally 💬

### `wa_short_014`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Pertanyaan cepat dari Heally

### `wa_short_015`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Sinkron WA ↔ Sehatica aktif

### `wa_short_016`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Butuh verifikasi dokter?

### `wa_short_017`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Jadwal olahraga hari ini?

### `wa_short_018`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Makan sesuai jadwal?

### `wa_short_019`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Heally di sini 24/7 (bot)

### `wa_short_020`

- **channels:** whatsapp
- **tone:** concise
- **title:** Heally
- **body:** Balas kapan saja

## Saran chat (tap bubble) (`chat.suggestion`)

### `chat_suggest_001`

- **channels:** chat
- **tone:** neutral
- **body:** Cek interaksi obat saya
- **notes:** Shown as tappable chat bubble

### `chat_suggest_002`

- **channels:** chat
- **tone:** neutral
- **body:** Buat jadwal olahraga
- **notes:** Shown as tappable chat bubble

### `chat_suggest_003`

- **channels:** chat
- **tone:** neutral
- **body:** Tips diet untuk kondisi saya
- **notes:** Shown as tappable chat bubble

### `chat_suggest_004`

- **channels:** chat
- **tone:** neutral
- **body:** Analisis rekam medis saya
- **notes:** Shown as tappable chat bubble

### `chat_suggest_005`

- **channels:** chat
- **tone:** neutral
- **body:** Gejala yang perlu diwaspadai
- **notes:** Shown as tappable chat bubble

### `chat_suggest_006`

- **channels:** chat
- **tone:** neutral
- **body:** Ringkas hasil lab terakhir
- **notes:** Shown as tappable chat bubble

### `chat_suggest_007`

- **channels:** chat
- **tone:** neutral
- **body:** Apa arti diagnosis saya?
- **notes:** Shown as tappable chat bubble

### `chat_suggest_008`

- **channels:** chat
- **tone:** neutral
- **body:** Jadwal minum obat ideal
- **notes:** Shown as tappable chat bubble

### `chat_suggest_009`

- **channels:** chat
- **tone:** neutral
- **body:** Tips tidur lebih baik
- **notes:** Shown as tappable chat bubble

### `chat_suggest_010`

- **channels:** chat
- **tone:** neutral
- **body:** Cek kepatuhan jadwal minggu ini
- **notes:** Shown as tappable chat bubble

### `chat_suggest_011`

- **channels:** chat
- **tone:** neutral
- **body:** Kapan harus ke dokter?
- **notes:** Shown as tappable chat bubble

### `chat_suggest_012`

- **channels:** chat
- **tone:** neutral
- **body:** Saran olahraga ringan di rumah
- **notes:** Shown as tappable chat bubble

### `chat_suggest_013`

- **channels:** chat
- **tone:** neutral
- **body:** Makanan yang sebaiknya dihindari
- **notes:** Shown as tappable chat bubble

### `chat_suggest_014`

- **channels:** chat
- **tone:** neutral
- **body:** Cara catat gejala harian
- **notes:** Shown as tappable chat bubble

### `chat_suggest_015`

- **channels:** chat
- **tone:** neutral
- **body:** Persiapan sebelum kontrol dokter
- **notes:** Shown as tappable chat bubble

### `chat_suggest_016`

- **channels:** chat
- **tone:** neutral
- **body:** Apa itu efek samping obat saya?
- **notes:** Shown as tappable chat bubble

### `chat_suggest_017`

- **channels:** chat
- **tone:** neutral
- **body:** Bantu buat checklist harian
- **notes:** Shown as tappable chat bubble

### `chat_suggest_018`

- **channels:** chat
- **tone:** neutral
- **body:** Tips mengelola stres
- **notes:** Shown as tappable chat bubble

### `chat_suggest_019`

- **channels:** chat
- **tone:** neutral
- **body:** Ingatkan saya minum air
- **notes:** Shown as tappable chat bubble

### `chat_suggest_020`

- **channels:** chat
- **tone:** neutral
- **body:** Review progress kesehatan bulan ini
- **notes:** Shown as tappable chat bubble

### `chat_suggest_021`

- **channels:** chat
- **tone:** neutral
- **body:** Apakah olahraga ini aman untuk saya?
- **notes:** Shown as tappable chat bubble

### `chat_suggest_022`

- **channels:** chat
- **tone:** neutral
- **body:** Bantu interpretasi tekanan darah
- **notes:** Shown as tappable chat bubble

### `chat_suggest_023`

- **channels:** chat
- **tone:** neutral
- **body:** Saran menu makan pagi sehat
- **notes:** Shown as tappable chat bubble

### `chat_suggest_024`

- **channels:** chat
- **tone:** neutral
- **body:** Apa yang harus dilakukan jika pusing?
- **notes:** Shown as tappable chat bubble

### `chat_suggest_025`

- **channels:** chat
- **tone:** neutral
- **body:** Buat pengingat obat malam
- **notes:** Shown as tappable chat bubble

## Pesan sistem Heally (`chat.system`)

### `chat_system_001`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Halo! Saya Heally. Asisten kesehatan AI Anda.

### `chat_system_002`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Silakan pilih topik di bawah atau ketik pertanyaan.

### `chat_system_003`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Saya bisa bantu pahami rekam medis, jadwal, dan gejala.

### `chat_system_004`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Saran saya bisa diminta verifikasi dokter partner.

### `chat_system_005`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Data kesehatanmu dipakai untuk personalisasi — kamu kendalikan.

### `chat_system_006`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Mau mulai dari jadwal, rekam, atau keluhan hari ini?

### `chat_system_007`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Tanya apa saja — mulai dari yang sederhana juga boleh.

### `chat_system_008`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Jika mendesak / darurat, hubungi layanan medis setempat.

### `chat_system_009`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Heally bukan pengganti dokter, tapi teman pantau harian.

### `chat_system_010`

- **channels:** chat, whatsapp
- **tone:** informative
- **title:** Heally
- **body:** Kamu bisa lanjut di WhatsApp dengan nomor yang sama terhubung.

## Tips / insight (`insight.tip`)

### `insight_tip_001`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Minum air sebelum kopi membantu hidrasi pagi.

### `insight_tip_002`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Jalan kaki 10 menit setelah makan bisa bantu metabolisme.

### `insight_tip_003`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Catat gejala di jam yang sama tiap hari biar polanya kelihatan.

### `insight_tip_004`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Obat lebih mudah diingat jika dipasangkan ke kebiasaan (mis. setelah sikat gigi).

### `insight_tip_005`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Tidur teratur sering lebih berdampak daripada “sempurna sekali”.

### `insight_tip_006`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Kalau pusing saat berdiri, duduk dulu lalu kabari Heally.

### `insight_tip_007`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Foto label obat membantu Heally mengingatkan dosis.

### `insight_tip_008`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Satu pertanyaan ke dokter di kontrol lebih baik daripada sepuluh yang terlupa.

### `insight_tip_009`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Streak kecil mengalahkan motivasi besar yang putus.

### `insight_tip_010`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Kalau ragu saran AI, minta verifikasi dokter di app.

### `insight_tip_011`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Kurangi scroll malam — tidur lebih dalam bantu pemulihan.

### `insight_tip_012`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Garam & gula: catat jika dokter meminta pantauan.

### `insight_tip_013`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Olahraga bukan harus gym — naik tangga juga dihitung.

### `insight_tip_014`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Bawa botol minum kecil di tas mengurangi lupa hidrasi.

### `insight_tip_015`

- **channels:** chat, whatsapp, push
- **tone:** helpful
- **title:** Tips Heally
- **body:** Update alergi/kondisi di profil biar saran lebih aman.

## Dokter & verifikasi (`nudge.doctor`)

### `nudge_doctor_001`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Partner dokter
- **body:** Scan QR dokter untuk menambah partner.

### `nudge_doctor_002`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Verifikasi
- **body:** Ada saran Heally yang bisa diminta verifikasi dokter.

### `nudge_doctor_003`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Dokter online
- **body:** Partner doktermu tersedia untuk konsultasi.

### `nudge_doctor_004`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Menunggu dokter
- **body:** Permintaan verifikasi masih diproses.

### `nudge_doctor_005`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Hasil verifikasi
- **body:** Dokter sudah meninjau saran Heally.

### `nudge_doctor_006`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Tambah partner
- **body:** Hubungkan dokter lewat QR di tab Dokter.

### `nudge_doctor_007`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Aman dulu
- **body:** Untuk saran kritis, minta verifikasi dokter ya.

### `nudge_doctor_008`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Update partner
- **body:** Cek status dokter partner di Sehatica.

### `nudge_doctor_009`

- **channels:** push, system, chat
- **tone:** informative
- **title:** Konsultasi
- **body:** Dokter partner siap dihubungi.

### `nudge_doctor_010`

- **channels:** push, system, chat
- **tone:** informative
- **title:** QR siap
- **body:** Minta kode QR ke dokter klinikmu.

## Jadwal terlewat (`nudge.missed`)

### `nudge_missed_001`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Terlewat
- **body:** {{label}} belum ditandai. Masih sempat sekarang.

### `nudge_missed_002`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Lewat jam
- **body:** Jadwal {{time}} terlewat — selesaikan jika masih relevan.

### `nudge_missed_003`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Perlu perhatian
- **body:** Beberapa item jadwal tertunda hari ini.

### `nudge_missed_004`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Follow-up
- **body:** Kemarin ada jadwal belum selesai. Lanjut hari ini?

### `nudge_missed_005`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jangan menumpuk
- **body:** Selesaikan satu yang tertunda dulu: {{label}}.

### `nudge_missed_006`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Heally khawatir kecil
- **body:** Sudah lama tidak ada update kepatuhan jadwal.

### `nudge_missed_007`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Cek sekarang
- **body:** Ada pengingat penting yang belum direspons.

### `nudge_missed_008`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Agar akurat
- **body:** Tanpa konfirmasi, Heally sulit menyesuaikan saran.

### `nudge_missed_009`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Prioritas
- **body:** Fokus ke {{label}} dulu hari ini.

### `nudge_missed_010`

- **channels:** push, chat, whatsapp
- **tone:** soft_urgent
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Masih relevan?
- **body:** Apakah {{label}} masih perlu dilakukan?

## Nudge rekam medis (`nudge.records`)

### `nudge_records_001`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Lengkapi rekam
- **body:** Upload hasil kunjungan biar Heally lebih akurat.

### `nudge_records_002`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Rekam medis
- **body:** Belum ada catatan baru. Mau tambah sekarang?

### `nudge_records_003`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Foto lab?
- **body:** Bisa OCR dokumen medis di tab Rekam.

### `nudge_records_004`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Catatan singkat
- **body:** Tulis keluhan hari ini di rekam medis.

### `nudge_records_005`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Agar saran pas
- **body:** Heally butuh data terbaru dari rekammu.

### `nudge_records_006`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Setelah kontrol
- **body:** Simpan hasil dokter ke Sehatica.

### `nudge_records_007`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Jangan hilang
- **body:** Simpan ringkasan konsultasi sekarang.

### `nudge_records_008`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Satu upload
- **body:** Foto resep / hasil lab cukup untuk mulai.

### `nudge_records_009`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Update data
- **body:** Rekam medis membantu verifikasi dokter.

### `nudge_records_010`

- **channels:** push, chat, whatsapp
- **tone:** helpful
- **title:** Heally sarankan
- **body:** Tambah catatan kondisi minggu ini.

## Personalisasi nama (`personal.name`)

### `pers_name_001`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, jadwalmu menunggu sebentar saja.

### `pers_name_002`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, Heally punya pertanyaan singkat.

### `pers_name_003`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, sudah minum obat hari ini?

### `pers_name_004`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, kabari kondisi biar kami bisa bantu.

### `pers_name_005`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, progress minggu ini bisa kita review.

### `pers_name_006`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, jangan lupa hidrasi.

### `pers_name_007`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, partner dokter bisa ditambah lewat QR.

### `pers_name_008`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, rekam medis terbaru bantu akurasi saran.

### `pers_name_009`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, satu centang jadwal sekarang juga boleh.

### `pers_name_010`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name}}`
- **title:** Hai {{name}}
- **body:** {{name}}, Heally siap di WA maupun app.

## Pengingat olahraga (`schedule.exercise`)

### `sched_exercise_001`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Gerak sebentar
- **body:** Jadwal olahraga: {{label}} pukul {{time}}.

### `sched_exercise_002`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Waktunya aktif
- **body:** {{label}} menunggu. Bisa singkat saja.

### `sched_exercise_003`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Badan kaku?
- **body:** Heally usul: mulai {{label}} sekarang.

### `sched_exercise_004`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Olahraga ringan
- **body:** Selesaikan {{label}} biar jadwal hari ini lengkap.

### `sched_exercise_005`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Energi naik
- **body:** Saatnya {{label}}.

### `sched_exercise_006`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Konsistensi gerak
- **body:** Jangan skip {{label}} hari ini.

### `sched_exercise_007`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat gerak
- **body:** {{time}} · {{label}}

### `sched_exercise_008`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Heally nanya
- **body:** Sudah olahraga ({{label}})?

### `sched_exercise_009`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Langkah kecil
- **body:** 5–10 menit {{label}} sudah berarti.

### `sched_exercise_010`

- **channels:** push, chat, whatsapp
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Dari jadwalmu
- **body:** Aktivitas: {{label}}.

### `sched_exercise_011`

- **channels:** push, system
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Olahraga
- **body:** Gerakan ringan lebih baik daripada tidak sama sekali: {{label}}.

### `sched_exercise_012`

- **channels:** push, system
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Olahraga
- **body:** Heally siap dampingi setelah {{label}} selesai.

### `sched_exercise_013`

- **channels:** push, system
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Olahraga
- **body:** Tandai {{label}} kalau sudah bergerak.

### `sched_exercise_014`

- **channels:** push, system
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Olahraga
- **body:** Olahraga terjadwal: {{label}}.

### `sched_exercise_015`

- **channels:** push, system
- **tone:** motivating
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Olahraga
- **body:** Yuk selesaikan {{label}} sebelum hari berakhir.

## Pengingat makan (`schedule.food`)

### `sched_food_001`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Waktunya makan
- **body:** Jadwal makan: {{label}} pukul {{time}}.

### `sched_food_002`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat makan
- **body:** Sudah makan sesuai rencana? {{label}}

### `sched_food_003`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Nutrisi dulu
- **body:** Heally ingat jadwal makanmu: {{label}}.

### `sched_food_004`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jeda sehat
- **body:** Saatnya {{label}}. Tandai jika sudah.

### `sched_food_005`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Makan teratur
- **body:** Pola makan rutin membantu. Cek {{label}}.

### `sched_food_006`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Halo lapar?
- **body:** Jadwal {{label}} sudah masuk.

### `sched_food_007`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Konsistensi
- **body:** Tandai {{label}} supaya Heally bisa bantu lebih akurat.

### `sched_food_008`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Reminder lembut
- **body:** {{time}} · jangan lewatkan {{label}}.

### `sched_food_009`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Dari jadwalmu
- **body:** Aktivitas makan: {{label}}.

### `sched_food_010`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Heally nanya
- **body:** Sudah {{label}}? Balas di chat atau WA.

### `sched_food_011`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jadwal makan
- **body:** Makan sesuai jadwal bantu energi stabil. {{label}}

### `sched_food_012`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jadwal makan
- **body:** Cek {{label}} — sudah atau belum?

### `sched_food_013`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jadwal makan
- **body:** Pengingat singkat: {{label}} jam {{time}}.

### `sched_food_014`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jadwal makan
- **body:** Satu langkah: selesaikan jadwal makan {{label}}.

### `sched_food_015`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Jadwal makan
- **body:** Heally jaga ritme makamu hari ini.

## Pengingat obat (`schedule.pill`)

### `sched_pill_001`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Waktunya obat
- **body:** Saatnya minum obat{{detail}}. Tandai selesai kalau sudah ya.

### `sched_pill_002`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Pengingat obat
- **body:** {{label}} jam {{time}} — jangan sampai terlewat.

### `sched_pill_003`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Obat menunggu
- **body:** Heally ingat: {{label}} belum ditandai selesai.

### `sched_pill_004`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Sedikit lagi
- **body:** Sekilas saja — minum obat sesuai jadwal {{time}}.

### `sched_pill_005`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Untuk konsistensi
- **body:** Rutin obat bantu pemulihan. Cek {{label}} sekarang.

### `sched_pill_006`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Halo dari Heally
- **body:** Pengingat lembut: {{label}} pukul {{time}}.

### `sched_pill_007`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Jangan lupa
- **body:** Obat {{label}} sudah waktunya.

### `sched_pill_008`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Cek jadwal
- **body:** Ada obat yang perlu diminum: {{label}}.

### `sched_pill_009`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Satu langkah sehat
- **body:** Minum obat sekarang biar streak jadwal tetap jalan.

### `sched_pill_010`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Heally nanya
- **body:** Sudah minum {{label}}? Balas atau tandai di app.

### `sched_pill_011`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Pengingat singkat
- **body:** {{time}} · {{label}}

### `sched_pill_012`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Tetap on track
- **body:** Jadwal obatmu masih menunggu konfirmasi.

### `sched_pill_013`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Sebelum sibuk
- **body:** Ambil 10 detik untuk obat {{label}}.

### `sched_pill_014`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Malam ini penting
- **body:** Obat malam: {{label}}. Sudah?

### `sched_pill_015`

- **channels:** push, system, chat
- **tone:** gentle
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Pagi dimulai
- **body:** Obat pagi {{label}} siap dikonfirmasi.

### `sched_pill_016`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Heally cek: obat {{label}} belum selesai.

### `sched_pill_017`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Kalau belum minum {{label}}, sekarang waktu yang bagus.

### `sched_pill_018`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Kesehatanmu prioritas — {{label}} jam {{time}}.

### `sched_pill_019`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Satu centang kecil: {{label}}.

### `sched_pill_020`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Pengingat dari jadwalmu: {{label}}.

### `sched_pill_021`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Masih sempat: tandai {{label}} sudah diminum.

### `sched_pill_022`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Heally di sini supaya {{label}} tidak terlupakan.

### `sched_pill_023`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Obat terjadwal menunggu balasanmu.

### `sched_pill_024`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Buka Sehatica dan selesaikan {{label}}.

### `sched_pill_025`

- **channels:** push, chat, whatsapp
- **tone:** neutral
- **placeholders:** `{{label}}`, `{{time}}`
- **title:** Pengingat obat
- **body:** Yuk selesaikan obat {{label}} sebelum lupa.

## Progress jadwal (`schedule.progress`)

### `sched_progress_001`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Jadwal menunggu
- **body:** Ada aktivitas belum selesai hari ini.

### `sched_progress_002`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Progress hari ini
- **body:** {{done}}/{{total}} selesai. Yuk lanjut.

### `sched_progress_003`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Hampir selesai
- **body:** Tinggal sedikit lagi dari jadwal hari ini.

### `sched_progress_004`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Satu item tersisa
- **body:** Selesaikan sisa jadwal supaya 100%.

### `sched_progress_005`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Ringkasan sore
- **body:** Cek sisa jadwal sebelum malam.

### `sched_progress_006`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Ringkasan malam
- **body:** Masih ada jadwal belum ditandai.

### `sched_progress_007`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Mulai hari
- **body:** Lihat jadwal pagi milikmu.

### `sched_progress_008`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Heally update
- **body:** Jadwalmu butuh sedikit perhatian.

### `sched_progress_009`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Jangan biarkan menumpuk
- **body:** Selesaikan satu item jadwal sekarang.

### `sched_progress_010`

- **channels:** push, system
- **tone:** neutral
- **placeholders:** `{{done}}`, `{{total}}`
- **title:** Kembali ke ritme
- **body:** Buka jadwal dan centang yang sudah dilakukan.

## Pengingat minum air (`schedule.water`)

### `sched_water_001`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Saatnya minum air. {{detail}}

### `sched_water_002`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Hidrasi dulu — {{label}}.

### `sched_water_003`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Segelas air untuk tubuhmu sekarang.

### `sched_water_004`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Heally: jangan lupa minum air.

### `sched_water_005`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Pengingat air: {{time}}.

### `sched_water_006`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Tubuhmu butuh cairan. Tandai {{label}}.

### `sched_water_007`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Minum air sebentar, lanjut aktivitas.

### `sched_water_008`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Streak hidrasi menunggu satu centang.

### `sched_water_009`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Air dulu, baru sibuk lagi.

### `sched_water_010`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Reminder lembut: minum air sekarang.

### `sched_water_011`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Sudah minum air belum? {{label}}

### `sched_water_012`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Heally jaga agar kamu tidak dehidrasi.

### `sched_water_013`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Satu teguk besar sekarang juga.

### `sched_water_014`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Jadwal air {{time}} sudah tiba.

### `sched_water_015`

- **channels:** push, system
- **tone:** playful
- **placeholders:** `{{label}}`, `{{time}}`, `{{detail}}`
- **title:** Minum air
- **body:** Hidrasi = fokus lebih baik. Yuk minum.

## Varian siang (`time.afternoon`)

### `tod_afternoon_001`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Siang. Sudah minum air cukup?

### `tod_afternoon_002`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Heally cek: jadwal siang sudah ditandai?

### `tod_afternoon_003`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Istirahat sebentar dan update kondisi?

### `tod_afternoon_004`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Siang produktif — jangan lupa obat siang.

### `tod_afternoon_005`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Bagaimana energimu sore menjelang?

### `tod_afternoon_006`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Ada gejala yang muncul siang ini?

### `tod_afternoon_007`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Cek sisa jadwal sebelum sore.

### `tod_afternoon_008`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Heally siap kalau mau tanya cepat.

### `tod_afternoon_009`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Makan siang sesuai rencana?

### `tod_afternoon_010`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Siang dari Heally
- **body:** Satu napas, satu teguk air.

## Varian sore (`time.evening`)

### `tod_evening_001`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Sore. Saatnya review jadwal hari ini.

### `tod_evening_002`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Bagaimana harimu secara keseluruhan?

### `tod_evening_003`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Obat malam jangan sampai lupa.

### `tod_evening_004`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Heally nanya: ada yang perlu dicatat?

### `tod_evening_005`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Sisa jadwal: selesaikan sebelum malam.

### `tod_evening_006`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Update singkat biar saran malam lebih pas.

### `tod_evening_007`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Sudah olahraga / jalan sore?

### `tod_evening_008`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Minum air terakhir sebelum malam.

### `tod_evening_009`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Cerita ke Heally kalau ada keluhan sore.

### `tod_evening_010`

- **channels:** push, chat, whatsapp
- **tone:** gentle
- **title:** Sore dari Heally
- **body:** Sore tenang — check-in 30 detik saja.

## Varian pagi (`time.morning`)

### `tod_morning_001`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Selamat pagi{{name_suffix}}. Badan terasa fit?

### `tod_morning_002`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Pagi! Cek jadwal obat / makan pagi yuk.

### `tod_morning_003`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Mulai hari dengan satu centang sehat.

### `tod_morning_004`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Heally ucapkan pagi. Ada keluhan semalam?

### `tod_morning_005`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Pagi adalah waktu bagus untuk minum air.

### `tod_morning_006`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Lihat jadwal pagi sebelum aktivitas padat.

### `tod_morning_007`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Satu pertanyaan pagi: tidurmu cukup?

### `tod_morning_008`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Heally siap dampingi harimu.

### `tod_morning_009`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Jangan skip sarapan / obat pagi ya.

### `tod_morning_010`

- **channels:** push, chat, whatsapp
- **tone:** warm
- **placeholders:** `{{name_suffix}}`
- **title:** Pagi dari Heally
- **body:** Kabarin Heally kalau kurang fit pagi ini.

## Varian malam (`time.night`)

### `tod_night_001`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Menjelang tidur: sudah minum obat malam?

### `tod_night_002`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Tidur cukup bantu pemulihan. Siap istirahat?

### `tod_night_003`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Heally: catat keluhan sebelum tidur?

### `tod_night_004`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Matikan notifikasi lain, tapi jangan skip obat malam.

### `tod_night_005`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Satu checklist malam: air, obat, istirahat.

### `tod_night_006`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Kalau insomnia / nyeri malam, kabari Heally.

### `tod_night_007`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Selamat beristirahat. Heally jaga ringkasanmu.

### `tod_night_008`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Malam ini, tubuhmu butuh istirahat.

### `tod_night_009`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Review singkat hari ini sebelum tidur?

### `tod_night_010`

- **channels:** push, chat, whatsapp
- **tone:** calm
- **title:** Malam dari Heally
- **body:** Jadwal besok sudah siap — tidur dulu.

## Catatan implementasi

1. Seed arms ke tabel `notification_arms` (lihat RDSA plan).
2. Eligibility filter by `intent` + user state (mis. hanya `schedule.pill` jika ada item pill due).
3. RDSA memilih `arm_id` di antara eligible; channel router memilih push vs WA vs chat.
4. Untuk chat suggestion, render `body` sebagai bubble biasa yang bisa di-tap (bukan chip kosong).
5. Tambah locale `en` nanti sebagai arm terpisah (`arm_id` + `_en`) agar sesuai model RDSA notification+language.
