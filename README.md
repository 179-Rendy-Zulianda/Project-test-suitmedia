# Ideas - Suit Media

## Fitur yang Diimplementasikan

### 1. Header Fixed dengan Efek Scroll
- Header tetap di posisi atas saat scroll
- Menghilang saat scroll ke bawah, muncul kembali saat scroll ke atas
- Active state menu sesuai halaman yang sedang dikunjungi

### 2. Banner dengan Efek Parallax
- Banner terdiri dari image
- Efek parallax saat scroll
- Area miring pada bagian bawah banner 

### 3. List Post dengan Fungsi Lengkap
- **Sorting**: Berdasarkan terbaru dan terlama
- **Show per page**: Opsi [10, 20, 50] items
- **Pagination**: Navigasi lengkap dengan first, previous, next, last
- **State Management**: Data tidak kembali ke state awal saat refresh
- **Lazy Loading**: Image loading yang optimal
- **Responsive Grid**: Layout yang menyesuaikan ukuran layar

### 4. API Integration
- Menggunakan API: `https://suitmedia-backend.suitdev.com/api/ideas`
- **Metode**: POST dengan JSON body
- **Headers**: Content-Type: application/json
- Parameter yang didukung:
  - `page[number]`: Halaman yang dikunjungi
  - `page[size]`: Jumlah item per halaman
  - `append[]`: ['small_image', 'medium_image']
  - `sort`: 'published_at' atau '-published_at'

## Struktur File

```
├── index.html          # File HTML utama
├── styles.css          # Styling CSS
├── script.js           # JavaScript functionality
└── README.md           # Dokumentasi
```
