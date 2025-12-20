window.exerciseData = {
    'html-1': {
        title: 'Struktur HTML Dasar',
        language: 'html',
        difficulty: 'beginner',
        time: 10,
        description: 'Membuat struktur HTML dasar dengan elemen-elemen penting.',
        requirements: [
            'Gunakan DOCTYPE html',
            'Tambahkan elemen html dengan atribut lang',
            'Buat head dengan title',
            'Buat body dengan minimal satu elemen'
        ],
        starterCode: {
            html: `<!DOCTYPE html>
<html>
<head>
    <title>Dokumen Saya</title>
</head>
<body>
    <!-- Kode Anda di sini -->
</body>
</html>`,
            css: '',
            js: ''
        }
    },
    'html-3': {
        title: 'Membuat List di HTML',
        language: 'html',
        difficulty: 'beginner',
        time: 20,
        description: 'Membuat tiga jenis list di HTML: unordered, ordered, dan description list.',
        requirements: [
            'Buat unordered list dengan minimal 3 item',
            'Buat ordered list dengan minimal 3 item',
            'Buat description list dengan 2 term dan deskripsi',
            'Gunakan proper class untuk setiap list'
        ],
        starterCode: {
            html: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latihan List HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Latihan Membuat List HTML</h1>
    
    <div class="list-section">
        <h2>Unordered List (Bulleted)</h2>
        
        
    </div>
    
    <div class="list-section">
        <h2>Ordered List (Numbered)</h2>
        
        
    </div>
    
    <div class="list-section">
        <h2>Description List</h2>
        
        
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,
            css: `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    color: #333;
}

h1 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}

h2 {
    color: #34495e;
    margin-top: 30px;
}

.list-section {
    background-color: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}`,
            js: `document.addEventListener('DOMContentLoaded', function() {
    console.log('Halaman latihan list telah dimuat');
});`
        }
    }
};