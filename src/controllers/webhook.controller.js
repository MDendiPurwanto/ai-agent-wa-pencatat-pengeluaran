const { ekstrakStruk } = require('../services/ocr.service');
const { simpanKeSpreadsheet } = require('../services/spreadsheet.service');
const { generateInsight } = require('../services/insight.service');
const { kirimPesan } = require('../config/whatsapp');

async function handleWhatsAppWebhook(msg) {
  try {
    // Cek apakah pesan memiliki media
    if (msg.hasMedia) {
      // Download media
      const media = await msg.downloadMedia();
      
      // Konversi media ke base64
      const imageBase64 = `data:${media.mimetype};base64,${media.data}`;

      try {
        // Ekstrak informasi dari struk
        const dataStruk = await ekstrakStruk(imageBase64);

        // Simpan ke spreadsheet
        await simpanKeSpreadsheet(dataStruk);

        // Generate insight
        const insight = await generateInsight(dataStruk);

        // Kirim balasan
        await msg.reply(`Transaksi berhasil dicatat:

Merchant: ${dataStruk.merchant}
Total: Rp ${(dataStruk.total || 0).toLocaleString()}
Kategori: ${dataStruk.kategori}

Insight:
${insight}`);

      } catch (error) {
        console.error('Gagal memproses struk:', error);
        await msg.reply('Maaf, gagal membaca struk. Pastikan gambar jelas.');
      }
    } else if (msg.body) {
      // Tangani pesan teks biasa
      await handlePesanTeks(msg);
    }
  } catch (error) {
    console.error('Error di webhook:', error);
  }
}

// Fungsi tambahan untuk pesan teks
async function handlePesanTeks(msg) {
  const pesanLower = msg.body.toLowerCase();

  // Contoh respons interaktif
  const responMap = {
    'hai': 'Halo! Kirim foto struk untuk mencatat pengeluaran.',
    'help': 'Kirim foto struk untuk mencatat pengeluaran otomatis.',
    'ping': 'Pong!',
    'reminder': 'Kami akan mengirimkan reminder jika Anda belum mencatat pengeluaran selama beberapa hari.'
  };

  const respon = responMap[pesanLower] || 'Kirim foto struk untuk mencatat pengeluaran.';
  await msg.reply(respon);
}

// Update export
module.exports = { 
  handleWhatsAppWebhook 
};
