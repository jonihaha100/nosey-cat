# Product Requirements Document (PRD): Website Meme Coin 16-Bit Retro Arcade ("Anti-Slop" Edition)

## 1. Ikhtisar Proyek
Membangun Single-Page Application (SPA) untuk proyek Meme Coin dengan tingkat konversi tinggi, waktu muat instan, dan estetika **16-Bit Retro Arcade / Raw Pixel Brutalism (100% Anti-Slop)**. Website ini menggunakan karakter utama berupa kucing tuxedo hitam-putih bergaya pixel art dengan pose kepala miring yang menyelidik ke kamera, mata hijau, hidung merah muda, janggut hitam kecil, kumis putih panjang, dan latar belakang rumput hijau (`/public/mascot-pixel.png`).

Tujuan utama aplikasi web ini adalah:
1. Menciptakan daya tarik instan (hook) melalui interaksi karakter yang konyol, bersuara 8-bit, dan tidak membosankan.
2. Membangun kepercayaan trader melalui bukti keamanan on-chain (Anti-Rug Proof) dan metrik harga real-time dari API publik DexScreener.
3. Memfasilitasi pemasaran organik komunitas melalui fitur pembuat avatar/meme berbasis HTML5 Canvas (Client-Side Meme Studio).

---

## 2. Tech Stack & Aturan Ketat Desain ("Anti-Slop" Rules)

### 2.1 Tech Stack
- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React + Ikon/Elemen SVG bergaya Pixel Art
- **Audio Engine:** Native Browser `Web Audio API` (`AudioContext` & `OscillatorNode`) — tanpa ketergantungan file MP3 eksternal
- **Canvas Engine:** Native HTML5 `<canvas>` API
- **Data Fetching:** Native `fetch` ke endpoint publik DexScreener REST API

### 2.2 Aturan Visual "Anti-Slop" (WAJIB DIIKUTI OLEH AI AGENT)
- **DILARANG KERAS** menggunakan gaya template AI generik seperti: gradasi ungu/biru lembut, efek *glassmorphism* (`backdrop-blur`), sudut membulat halus (`rounded-lg`, `rounded-xl`, `rounded-full`), atau animasi melayang yang mulus (`ease-in-out`).
- **WAJIB MENGGUNAKAN:**
  1. **Sudut Tajam & Border Piksel:** Semua kartu, tombol, dan kontainer wajib menggunakan `rounded-none`, garis tepi hitam tebal (`border-4 border-black`), dan bayangan kotak keras tanpa blur (`shadow-[6px_6px_0px_0px_#000000]`).
  2. **Pixel Crispness:** Terapkan `image-rendering: pixelated;` pada seluruh elemen `<img>` dan `<canvas>`.
  3. **Tipografi Retro:** Muat Google Fonts `'Press Start 2P'` (untuk judul, tombol, dan angka penting) serta `'VT323'` atau `'Space Mono'` (untuk teks deskripsi dan alamat kontrak).
  4. **Animasi Patah-Patah (Stepped Frame Rate):** Semua transisi dan keyframe animasi wajib menggunakan fungsi waktu diskrit seperti `steps(3, end)` atau `steps(4, end)` agar terasa seperti game konsol 16-bit tahun 90-an.
  5. **Palet Warna:** Hijau Rumput Arcade (`#4ADE80` / `#22C55E`), Kuning Peringatan (`#FACC15`), Merah Muda Hidung Kucing (`#F472B6`), Putih Kapur (`#FAFAFA`), dan Hitam Pekat (`#09090B`).
  6. **Efek Layar Tabung (CRT Scanline Overlay):** Buat komponen overlay tetap (`fixed inset-0 pointer-events-none z-50`) dengan garis horizontal tipis transparan ala layar monitor CRT klasik.

---

## 3. Struktur Direktori yang Diharapkan
```text
src/
├── config/
│   └── tokenConfig.ts          # Konfigurasi terpusat (CA, link, teks meme, pengaturan)
├── utils/
│   └── soundEffects.ts         # Synthesizer suara 8-bit menggunakan Web Audio API
├── components/
│   ├── TopMarquee.tsx          # Teks berjalan tanpa henti di bagian paling atas
│   ├── Navbar.tsx              # Navigasi sticky + sakelar "CHAOS MODE"
│   ├── HeroSection.tsx         # Maskot interaktif, balon bicara, & kotak Copy CA
│   ├── MascotInteractive.tsx   # Logika klik hidung (Boop), rotasi kursor, & laser mata
│   ├── LiveMetricsBar.tsx      # Integrasi API DexScreener + fallback Tokenomics
│   ├── SecurityProof.tsx       # 3 kartu bukti keamanan Anti-Rug
│   ├── MemeStudio.tsx          # Generator PFP/Meme berbasis HTML5 Canvas
│   ├── HowToBuyAndChart.tsx    # Panduan 3 langkah & iframe grafik DexScreener
│   └── ChaosOverlay.tsx        # Efek hujan kucing piksel & getaran layar saat Chaos Mode aktif
├── App.tsx
└── main.tsx
```

## 4. Konfigurasi Token Terpusat (`src/config/tokenConfig.ts`)
```typescript
export const TOKEN_CONFIG = {
  name: "Kucing Kepo",
  ticker: "$KEPO",
  chain: "solana",
  contractAddress: "COMING_SOON_ON_PUMPFUN",
  buyUrl: "https://pump.fun",
  dexScreenerUrl: "https://dexscreener.com",
  telegramUrl: "https://t.me/kucingkepo_portal",
  twitterUrl: "https://x.com/kucingkepo_sol",
  tokenLockProofUrl: "https://streamflow.finance",
  defaultTokenomics: {
    totalSupply: "1,000,000,000",
    tax: "0% BUY / 0% SELL",
    liquidity: "100% BURNED",
    devSupply: "LOCKED 30 DAYS"
  },
  marqueeMessages: [
    "🐱 $KEPO SEDANG MEMANTAU ISI WALLET LU!",
    "🔥 100% FAIR LAUNCH DI PUMP.FUN — ANTI RUG CLUB",
    "🔒 DEV SUPPLY DIKUNCI TRANSPARAN — KLIK BUKTINYA DI BAWAH",
    "👉 PENCET HIDUNG KUCINGNYA KALAU BERANI!"
  ],
  catSpeechLines: [
    "Liat doang, beli kagak? 😼",
    "Dompet lu bau sangkut koin sebelah ya?",
    "Pencet hidung pink gua biar hoki! 🐾",
    "Dev gak bisa jual, kuncinya udah dibuang ke kebon!",
    "Awas jangan kertas tangan (paper hand), gua gigit lu!"
  ]
};
```

---

## 5. Spesifikasi Fitur & Mekanika Interaktif
### Fitur 1: Synthesizer Audio 8-Bit (`src/utils/soundEffects.ts`)
- `playBoopSound()`: Bunyi bleep/meow nada tinggi saat hidung kucing diklik.
- `playCoinSound()`: Bunyi koin arcade klasik (dua nada naik cepat: B5 ke E6) saat pengguna menyalin Contract Address (CA).
- `playPowerUpSound()`: Bunyi arpeggio 8-bit cepat saat pengguna menyalakan tombol CHAOS MODE.
- Sediakan tombol MUTE / UNMUTE AUDIO di Navbar.

### Fitur 2: Top Marquee, Sticky Navbar & "CHAOS MODE"
- Top Marquee: Berjalan tanpa henti dari `marqueeMessages`.
- Sticky Navbar: Logo piksel + nama $KEPO, navigasi cepat (Tentang, Bukti Aman, Meme Studio, Cara Beli), tombol Audio Mute/Unmute, tombol CHAOS MODE, dan tombol CTA BELI $KEPO.
- Chaos Mode: Getaran arcade, disko 8-bit kontras tinggi, hujan sprite `/mascot-pixel.png` jatuh dari atas layar, laser mata merah/kuning pada maskot.

### Fitur 3: Hero Section & Maskot Kucing Interaktif (`MascotInteractive.tsx`)
- Cursor tracking head tilt dalam kelipatan 10 derajat (-20deg, -10deg, 0deg, 10deg, 20deg) patah-patah.
- Pink Nose Boop clicker: klik hidung memicu squash-and-stretch (`scale-x-125 scale-y-75`), `playBoopSound()`, partikel melayang `+1 BOOP!`, dan total boop di `localStorage`.
- 8-Bit Speech Bubble: berganti kalimat setiap 5 detik atau langsung "MANTAP! CA UDAH KE-COPY, GAS SWAP SEKARANG!" saat CA disalin.
- Kotak 1-Click Copy Contract Address (CA): salin ke clipboard, bunyikan coin sound, badge "SEGERA RILIS DI PUMP.FUN" jika COMING_SOON.

### Fitur 4: Bar Metrik On-Chain Real-Time (`LiveMetricsBar.tsx`)
- Fetch https://api.dexscreener.com/latest/dex/tokens/${contractAddress} tiap 30 detik (jika bukan COMING_SOON).
- Fallback ke `defaultTokenomics` jika belum rilis.

### Fitur 5: Seksi Bukti Keamanan ("Anti-Rug Proof Badges")
- 3 kartu jendela OS retro: DEV SUPPLY LOCKED, MINT & FREEZE REVOKED, 100% FAIR LAUNCH.

### Fitur 6: Client-Side Pixel Meme & PFP Studio (`MemeStudio.tsx`)
- HTML5 Canvas 500x500 (`ctx.imageSmoothingEnabled = false`).
- Base image `/mascot-pixel.png` + input upload sendiri.
- Aksesori 8-bit: Kacamata Thug Life, Mata Laser Merah, Cangkir Kopi, Mahkota Raja Degen, Stempel "$KEPO VERIFIED".
- Top & Bottom Text dengan outline hitam tebal.
- Tombol Reset & Download PNG.

### Fitur 7: Panduan "Cara Beli" (Arcade Quest) & Live Chart
- 3 Tahap Arcade Quest: Stage 1 Phantom Wallet, Stage 2 Top up SOL, Stage 3 Swap $KEPO.
- Chart iframe atau radar CRT retro animasi jika status COMING_SOON.

