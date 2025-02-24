const openai = require('../config/openai');
const { initializeSheets } = require('../config/sheets');

async function generateInsight(dataStruk) {
  try {
    // Inisialisasi spreadsheet untuk membaca data sebelumnya
    const doc = await initializeSheets();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Analisis transaksi sebelumnya
    const analisis = {
      totalTransaksi: rows.length,
      transaksiKategori: {},
      transaksiTerakhir: rows.slice(-5) // 5 transaksi terakhir
    };

    // Hitung transaksi per kategori
    rows.forEach(row => {
      // Akses langsung properti, bukan method
      const kategori = row['Kategori'] || 'Lainnya';
      analisis.transaksiKategori[kategori] = 
        (analisis.transaksiKategori[kategori] || 0) + 1;
    });

    // Generate insight menggunakan OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Gunakan model terbaru
      messages: [
        {
          role: "system", 
          content: `Kamu adalah asisten keuangan yang membantu pengguna menganalisis pengeluaran. 
          Berikan insight yang memotivasi untuk menghemat uang dan memberikan perspektif positif.`
        },
        {
          role: "user", 
          content: `Analisis transaksi terbaru:
- Merchant: ${dataStruk.merchant || 'Tidak diketahui'}
- Total: Rp ${(dataStruk.total || 0).toLocaleString()}
- Kategori: ${dataStruk.kategori || 'Lainnya'}

Statistik Transaksi:
- Total Transaksi: ${analisis.totalTransaksi}
- Transaksi per Kategori: ${JSON.stringify(analisis.transaksiKategori)}

Berikan insight singkat dan memotivasi tentang pola pengeluaran, dengan tone yang ramah dan informatif.`
        }
      ]
    });

    // Ambil insight dari response
    const insight = response.choices[0].message.content;

    // Contoh insight tambahan sesuai deskripsi
    const insightTambahan = generateInsightTambahan(analisis, dataStruk);

    return `${insight}\n\n${insightTambahan}`;
  } catch (error) {
    console.error('Gagal generate insight:', error);
    return generateInsightFallback(dataStruk);
  }
}

function generateInsightTambahan(analisis, dataStruk) {
  const kategori = (dataStruk.kategori || 'lainnya').toLowerCase();
  
  // Contoh insight spesifik
  const insightMap = {
    'makanan': [
      'Reminder: Kamu sudah makan di luar 3x bulan ini, coba masak di rumah lebih sering!',
      'Tip hemat: Bawa bekal makan dari rumah bisa menghemat hingga 50% biaya makan.'
    ],
    'transportasi': [
      'Kamu sudah naik transportasi umum 5x minggu ini. Pertimbangkan berhemat dengan naik sepeda!',
      'Tip: Gunakan transportasi umum atau kendaraan bersama untuk menghemat biaya.'
    ],
    'belanja': [
      'Perhatian: Transaksi belanja kamu cukup tinggi bulan ini. Pertimbangkan untuk membuat budget bulanan.',
      'Tip: Gunakan diskon dan promo untuk belanja lebih hemat.'
    ]
  };

  // Pilih insight acak sesuai kategori
  const insightKategori = insightMap[kategori] || [
    'Tetap bijak dalam setiap pengeluaran!',
    'Selalu rencanakan keuangan dengan baik.'
  ];

  return insightKategori[Math.floor(Math.random() * insightKategori.length)];
}

function generateInsightFallback(dataStruk) {
  return `Transaksi berhasil dicatat di ${dataStruk.merchant || 'Merchant'}. 
Tetap semangat mengatur keuangan!`;
}


// Fungsi untuk mengecek dan mengirim reminder
async function cekReminderPencatatanKeuangan() {
  try {
    // Inisialisasi spreadsheet
    const doc = await initializeSheets();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Analisis transaksi terakhir
    const hariIni = new Date();
    const transaksiTerakhir = rows[rows.length - 1];
    const tanggalTerakhir = new Date(transaksiTerakhir.Tanggal);

    // Hitung selisih hari
    const selisihHari = Math.floor((hariIni - tanggalTerakhir) / (1000 * 60 * 60 * 24));

    // Daftar nomor yang akan dikirimi reminder
    const nomorPenerima = [
      'whatsapp:+6281324308823' // Ganti dengan nomor Anda
    ];

    // Logika reminder
    const pesanReminder = [
      `🔔 Reminder Keuangan 🔔
Anda belum mencatat pengeluaran selama ${selisihHari} hari.
Yuk, segera catat transaksi terakhir Anda!`,

      `💰 Ingat Catat Keuangan 💰
Sudah ${selisihHari} hari tidak ada catatan pengeluaran.
Jangan lupa rekam transaksi Anda!`,

      `📊 Update Keuangan 📊
Terakhir mencatat pengeluaran ${selisihHari} hari yang lalu.
Tetap konsisten mencatat untuk kontrol keuangan yang lebih baik!`
    ];

    // Kirim reminder jika sudah lebih dari 3 hari
    if (selisihHari > 3) {
      const reminderDipilih = pesanReminder[Math.floor(Math.random() * pesanReminder.length)];
      
      // Kirim ke setiap nomor
      for (const nomor of nomorPenerima) {
        await kirimPesan(nomor, reminderDipilih);
      }
    }
  } catch (error) {
    console.error('Gagal cek reminder:', error);
  }
}

// Fungsi untuk menghasilkan insight tambahan
async function generateInsightTambahan(dataStruk) {
  try {
    // Contoh insight tambahan
    const insightTambahan = [
      `💡 Tips Hemat: Setiap transaksi di ${dataStruk.merchant} bisa dihemat dengan mencari promo atau diskon.`,
      `🎯 Target Keuangan: Coba kurangi pengeluaran di kategori ${dataStruk.kategori} bulan ini.`,
      `📈 Pantau Terus: Konsisten mencatat transaksi adalah kunci kontrol keuangan yang baik.`
    ];

    return insightTambahan[Math.floor(Math.random() * insightTambahan.length)];
  
  } catch (error) {
    console.error('Gagal generate insight tambahan:', error);
    return 'Tetap semangat mengatur keuangan!';
  }
}

module.exports = { generateInsight,  cekReminderPencatatanKeuangan,
  generateInsightTambahan };
