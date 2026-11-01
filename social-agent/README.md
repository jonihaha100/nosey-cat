# 🐾 Kucing Kepo ($KEPO / $NOSEY) - Autonomous Social & Monitoring Agent

Modul **AI Agent Otonom** berbasis **Node.js, TypeScript, Google Gemini API, dan Telegram Bot API** yang bertugas menghidupkan media sosial proyek meme coin **Kucing Kepo ($KEPO)** 24/7 sekaligus menjadi **Asisten Eksekutif Bisnis** pribadi Anda.

---

## 🌟 4 Fitur Utama Sistem

| Fitur | Deskripsi |
| --- | --- |
| 🧠 **Dynamic Persona Brain** (`brainConfig.ts`) | Karakter kucing tuxedo piksel yang tengil, receh, dan cerdas membaca pasar Solana. Memiliki 3 fase bisnis: `PRE_LAUNCH`, `LIVE_LAUNCH`, dan `COMMUNITY_HOLD`. |
| 💬 **24/7 Living Telegram Agent** (`telegramAgent.ts`) | Otomatis menanggapi pertanyaan member grup (soal CA, keamanan rug-proof, cara beli, dsb). Dilengkapi fitur **Idle Chime-In** yang otomatis melempar lelucon/tebak-tebakan jika grup sepi selama X menit. |
| 📊 **Executive Business Monitor** (`adminMonitor.ts`) | Khusus merespons Telegram ID Anda untuk melihat statistik grup (`/status`), mengganti haluan strategi (`/set_phase`), dan menyuntikkan arahan kampanye secara live (`/set_directive`). |
| 🐦 **X (Twitter) Content Planner** (`xContentPlanner.ts`) | Menghasilkan draf cuitan harian, alpha thread, dan format seruan **Raid Alarm** untuk disebarkan ke komunitas. |

---

## 🚀 Panduan Memulai Cepat (5 Menit)

### Langkah 1: Masuk ke folder & install dependencies

```bash
cd social-agent
npm install
```

### Langkah 2: Salin File Konfigurasi `.env`

```bash
cp .env.example .env
```

Buka file `.env` menggunakan teks editor Anda, lalu isi variabel berikut:

1. **`TELEGRAM_BOT_TOKEN`**:
   - Buka aplikasi Telegram, cari **`@BotFather`**.
   - Ketik `/newbot`, beri nama bot (misal: `Kucing Kepo AI`), lalu salin HTTP API Token yang diberikan.
   - Di `@BotFather`, matikan privasi grup agar bot bisa membaca obrolan dengan cara: ketik `/setprivacy` $\rightarrow$ pilih bot Anda $\rightarrow$ pilih **Disable**.

2. **`ADMIN_TELEGRAM_ID`**:
   - Di Telegram, cari **`@userinfobot`** dan kirim pesan apa saja.
   - Bot akan membalas dengan ID angka Anda (misal: `123456789`). Salin angka ini ke `ADMIN_TELEGRAM_ID` agar perintah eksekutif hanya bisa diakses oleh Anda.

3. **`GEMINI_API_KEY`**:
   - Buka [Google AI Studio](https://aistudio.google.com/) dan buat API Key gratis (pilih model `gemini-1.5-flash` atau `gemini-2.5-flash`).

4. **`TELEGRAM_GROUP_ID`**:
   - Masukkan bot ke dalam grup Telegram komunitas Anda dan jadikan Admin.
   - Masukkan ID grup ke sini (biasanya diawali dengan tanda minus `-100...`).

---

### Langkah 3: Jalankan Agent

Jalankan perintah berikut untuk mengaktifkan AI Agent:

```bash
npm run start
```

Untuk mode development (auto-reload saat kode diubah):
```bash
npm run dev
```

---

## 📱 Panduan Perintah Eksekutif (Kirim via Chat Pribadi ke Bot)

Sebagai **Direktur / Arsitek Bisnis**, Anda dapat mengontrol si kucing langsung dari HP Anda:

### 1. `/status`
Menampilkan laporan lengkap:
- Waktu aktif (*uptime*) agent.
- Total pesan yang diproses & dibalas.
- Sentimen komunitas (Persentase Bullish vs. FUD vs. Netral).
- Data telemetri live dari DexScreener (Harga, Volume, Likuiditas, FDV).
- Fase bisnis dan arahan strategis yang sedang aktif.

### 2. `/set_phase [PRE_LAUNCH | LIVE_LAUNCH | COMMUNITY_HOLD]`
Mengubah fokus berpikir AI Agent secara instan tanpa restart server:
- `PRE_LAUNCH`: Menggoda member bahwa CA masih rahasia di Pump.fun, mengajak klik *Nose Boop* dan bikin meme di website.
- `LIVE_LAUNCH`: Mengumumkan CA resmi, menegaskan *0% Tax & Burned LP*, serta mendorong pembelian.
- `COMMUNITY_HOLD`: Menghibur komunitas saat market sideways/dip, menjaga retensi, dan mengadakan kuis meme.

### 3. `/set_directive [instruksi]`
Menyuntikkan instruksi kampanye spesifik ke otak Gemini secara real-time.
*Contoh:*
```
/set_directive Hari ini ada kontes meme di Meme Studio website! Ajak member bikin meme paling kocak dengan reward 1 SOL!
```

### 4. `/raid [target]`
Membuat template pesan ajakan *Raid* terformat rapi dan otomatis membroadcastnya ke grup Telegram komunitas.
*Contoh:*
```
/raid Postingan tweet terbaru Solana Daily
```

### 5. `/tweet`
Meminta AI Agent membuatkan 2 draf cuitan viral untuk akun X (Twitter) proyek Anda.

---

## 🛠️ Deploy ke Server / VPS 24/7 (Opsional)

Agar bot terus berjalan 24 jam tanpa perlu laptop Anda menyala terus, Anda bisa menggunakan **PM2** di VPS (DigitalOcean, AWS, GCP, atau Railway):

```bash
# Install PM2 secara global
npm install -g pm2

# Jalankan agent sebagai background daemon
pm2 start "npx tsx src/index.ts" --name "kepo-social-agent"

# Simpan agar otomatis hidup saat server reboot
pm2 save
pm2 startup
```
