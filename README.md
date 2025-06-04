# 🏆 LCC IC25 Apps - Lomba Cerdas Cermat Informatika Cup II 2025

<div align="center">
  <img src="https://i.ibb.co/4w2wrfDc/Logo-Hima.png" alt="Logo Hima" width="150" height="150">
  
  **Aplikasi Web Terintegrasi untuk Lomba Cerdas Cermat**
  
  [![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
</div>

---

## 📋 Deskripsi

LCC IC25 Apps adalah kumpulan aplikasi berbasis web yang dirancang khusus untuk mendukung pelaksanaan **Lomba Cerdas Cermat** dalam acara **Informatika Cup II 2025**. Aplikasi ini menyediakan solusi lengkap mulai dari manajemen waktu, tampilan soal interaktif, hingga sistem penilaian otomatis untuk babak semifinal dan final.

## ✨ Fitur Unggulan

### 🎯 **Sistem Multi-Mode**
- **Timer Penyisihan** - Timer hitung mundur 120 menit dengan kontrol lengkap
- **Tampilan Soal Semifinal** - Manajemen 30 soal dalam 3 sesi
- **Tampilan Soal Final** - Sistem kartu interaktif dengan 5 babak kategoris
- **Papan Skor Semifinal** - Manajemen 8 tim dengan sistem poin dinamis
- **Papan Skor Final** - Sistem penilaian lanjutan untuk 5 tim finalis

### 🎨 **Antarmuka Modern**
- Desain responsif dengan skema warna **#08636F** dan **#FAD800**
- Typography menggunakan font **Poppins** untuk konsistensi visual
- Mode gelap/terang untuk kenyamanan mata
- Animasi dan transisi yang smooth

### 🔊 **Sistem Audio Terintegrasi**
- Efek suara *tick* untuk 10 detik terakhir
- Suara *timeout* saat waktu habis
- Audio ranking untuk pengumuman hasil
- Kontrol volume dan mute

## 🚀 Quick Start

### Prasyarat
- Node.js v16 atau lebih baru
- npm atau yarn package manager

### Instalasi

```bash
# Clone repository
git clone https://github.com/miftakhulrahman/lcc-ic25-apps.git
cd lcc-ic25-apps

# Install dependencies
npm install

# Jalankan aplikasi
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Proyek

```
lcc-ic25-apps/
├── 📂 public/
│   ├── 📂 data/
│   │   ├── questions.csv           # Soal semifinal
│   │   └── questions_final.csv     # Soal final
│   ├── 📂 sounds/
│   │   ├── tick.wav
│   │   ├── timeout.wav
│   │   └── ranking.mp3
│   └── index.html
├── 📂 src/
│   ├── App.js                      # Router utama
│   ├── App.css                     # Styling dasar
│   ├── timer.jsx                   # Timer penyisihan
│   ├── QuestionDisplay.jsx         # Soal semifinal
│   ├── QuestionDisplayFinal.jsx    # Soal final
│   ├── ScoreboardSemifinal.jsx     # Papan skor semifinal
│   ├── ScoreboardFinal.jsx         # Papan skor final
│   └── Logo_Hima.png              # Logo aplikasi
└── package.json
```

## 🎮 Panduan Penggunaan

### 1. Timer Penyisihan
- **Durasi**: 120 menit (7200 detik)
- **Kontrol**: Start, Pause, Reset
- **Fitur**: Auto-save status, progress bar, notifikasi

### 2. Tampilan Soal Semifinal
- **Format**: 10 soal per sesi × 3 sesi = 30 soal
- **Timer**: 15 detik per soal
- **Jawaban**: True/False dengan penjelasan
- **Navigasi**: Antar soal dan antar sesi

### 3. Tampilan Soal Final
- **Sistem**: 5 babak dengan kategori berbeda
  1. 🏛️ Sejarah
  2. 🔬 IPA
  3. ⚽ Penjaskes
  4. 💻 Informatika
  5. 🌟 Campuran
- **Pemilihan**: Kartu interaktif (5 kartu per babak)
- **Timer**: Durasi dapat disesuaikan (default 10 detik)

### 4. Papan Skor Semifinal
- **Tim**: 8 peserta
- **Sistem Poin**: ±10 per jawaban, max 50 per sesi
- **Fitur Admin**: Edit tim, undo/redo, export Excel
- **Kualifikasi**: Top 5 lolos ke final

### 5. Papan Skor Final
- **Tim**: 5 finalis
- **Sistem Poin**:
  - Wajib: +100
  - Lemparan: +50 (benar), -25 (salah)
  - Rebutan: +100 (benar), -50 (salah)
  - Penalti: -25
- **Fitur Lanjutan**: Import tim CSV, keyboard shortcuts, audience view

## 📊 Format Data

### Soal Semifinal (`questions.csv`)
```csv
session,question,answer,explanation
1,"Pertanyaan contoh?","True","Penjelasan jawaban"
```

### Soal Final (`questions_final.csv`)
```csv
category,round,question,answer,explanation
Informatika,1,"Pertanyaan informatika?","Jawaban","Penjelasan"
```

### Import Tim (`teams.csv`)
```csv
Tim,Sekolah,Warna
"Tim Alpha","SMA 1","#FF5733"
"Tim Beta","SMA 2","#33A1FF"
```

## 🛠️ Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|---------|
| **React.js** | 18+ | Frontend framework |
| **Tailwind CSS** | 3+ | Styling |
| **Lucide Icons** | Latest | Icon library |
| **PapaParse** | Latest | CSV parsing |
| **SheetJS** | Latest | Excel export |
| **Howler.js** | Latest | Audio management |

## ⌨️ Keyboard Shortcuts

### Papan Skor Final
- `Space` - Start/Pause timer
- `R` - Reset timer
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `1-5` - Quick score (Wajib: +100)
- `Shift+1-5` - Quick score (Lemparan: +50)

## 🎯 Fitur Lanjutan

### 💾 **Persistensi Data**
- Auto-save ke localStorage
- Restore otomatis saat reload
- Export/import data

### 🎵 **Kontrol Audio**
- Volume control
- Mute/unmute individual sounds
- Audio feedback untuk setiap aksi

### 👥 **Mode Tampilan**
- **Admin Mode**: Kontrol penuh
- **Audience View**: Tampilan untuk penonton
- **Fullscreen Mode**: Presentasi optimal

### 📱 **Responsif**
- Desktop optimized
- Tablet friendly
- Mobile compatible

## 🤝 Kontribusi

Kami menerima kontribusi! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Lisensi

Project ini dilisensikan under MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 👨‍💻 Tim Pengembang

<div align="center">

**Miftakhul Rahman**  
*Lead Developer*

📧 [Email](mailto:miftakhulr@student.unuha.ac.id) | 🐙 [GitHub](https://github.com/miftakhulrahman)

</div>

## 🙏 Acknowledgments

- 🎓 **Panitia Informatika Cup II 2025**
- 🏫 **Himpunan Mahasiswa Informatika**
- 👥 **Seluruh peserta dan kontributor**

---

<div align="center">
  
**🏆 Selamat Bertanding! 🏆**

*Semoga Lomba Cerdas Cermat Informatika Cup II 2025 berjalan lancar dan sukses!*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red.svg)](https://github.com/miftakhulrahman/lcc-ic25-apps)

</div>