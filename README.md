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

## Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

## API Response Format

Aplikasi mengharapkan response API dalam format:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Judul Post",
      "published_at": "2022-09-05T00:00:00.000000Z",
      "medium_image": "https://example.com/image.jpg",
      "small_image": "https://example.com/small-image.jpg"
    }
  ],
  "meta": {
    "total": 100,
    "last_page": 10,
    "current_page": 1
  }
}
