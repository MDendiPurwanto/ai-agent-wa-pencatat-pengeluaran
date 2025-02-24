const { initializeSheets } = require('../config/sheets');

async function simpanKeSpreadsheet(data) {
  try {
    // Inisialisasi spreadsheet
    const doc = await initializeSheets();
    
    // Pilih sheet pertama
    const sheet = doc.sheetsByIndex[0];

    // Cek apakah header sudah ada
    try {
      await sheet.loadHeaderRow();
    } catch (headerError) {
      // Jika header belum ada, tambahkan header
      await sheet.setHeaderRow([
        'Tanggal', 
        'Total', 
        'Kategori', 
        'Merchant', 
        'Timestamp'
      ]);
    }

    // Konversi total ke angka murni
    const totalNilai = typeof data.total === 'string' 
      ? parseFloat(data.total.replace(/[^0-9.-]+/g, '')) 
      : data.total;

    // Tambahkan baris baru
    await sheet.addRow({
      'Tanggal': data.tanggal || new Date().toLocaleDateString(),
      'Total': totalNilai || 0, // Simpan sebagai angka
      'Kategori': data.kategori || 'Lainnya',
      'Merchant': data.merchant || 'Tidak Diketahui',
      'Timestamp': new Date().toISOString()
    });

    return doc;
  } catch (error) {
    console.error('Gagal menyimpan ke spreadsheet:', error);
    throw error;
  }
}

module.exports = { simpanKeSpreadsheet };
