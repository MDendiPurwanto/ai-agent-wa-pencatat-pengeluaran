const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

// Fungsi untuk mendapatkan path browser Chrome
function getBrowserPath() {
  const possiblePaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];

  for (const browserPath of possiblePaths) {
    try {
      if (fs.existsSync(browserPath)) {
        return browserPath;
      }
    } catch (error) {
      console.warn(`Gagal memeriksa path browser: ${browserPath}`);
    }
  }

  return null;
}

// Konfigurasi client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'ai-agent-pencatatan',
    dataPath: path.join('/tmp', 'wa-session')
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=9222'
    ],
    executablePath: '/usr/bin/google-chrome-stable' // Sesuaikan path Chrome
  }
});

// Generate QR Code
client.on('qr', (qr) => {
  qrcode.generate(qr, {small: true});
  console.log('Scan QR Code dengan WhatsApp');
});

// Kirim Pesan dengan Penanganan Error Komprehensif
async function kirimPesan(nomorPenerima, pesan) {
  try {
    // Validasi input
    if (!pesan || pesan.trim() === '') {
      console.warn('Pesan kosong, tidak dikirim');
      return false;
    }

    // Normalisasi nomor
    const nomorFormated = nomorPenerima.replace(/^0/, '62')
      .replace(/[^0-9]/g, '');
    const nomorWhatsApp = `${nomorFormated}@c.us`;

    // Cek koneksi client
    if (!client.isReady) {
      console.warn('WhatsApp client belum siap');
      await simpanPesanTertunda(pesan, nomorPenerima);
      return false;
    }

    // Kirim pesan
    await client.sendMessage(nomorWhatsApp, pesan);
    console.log(`Pesan terkirim ke ${nomorPenerima}`);
    return true;
  } catch (error) {
    console.error(`Gagal kirim pesan ke ${nomorPenerima}:`, error);
    
    // Simpan pesan tertunda
    await simpanPesanTertunda(pesan, nomorPenerima);
    return false;
  }
}

// Simpan Pesan Tertunda dengan Manajemen File yang Lebih Baik
async function simpanPesanTertunda(pesan, nomorPenerima) {
  try {
    const filePath = path.join(__dirname, '..', '..', 'pesan_tertunda.json');
    
    // Pastikan direktori ada
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Baca file atau inisialisasi array kosong
    let pesanTertundaList = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      pesanTertundaList = JSON.parse(fileContent || '[]');
    } catch (readError) {
      console.warn('File pesan tertunda belum ada, membuat file baru');
    }

    // Tambahkan pesan baru
    pesanTertundaList.push({
      pesan,
      nomorPenerima,
      timestamp: new Date().toISOString(),
      status: 'tertunda',
      percobaan: 0
    });

    // Batasi jumlah pesan tertunda
    if (pesanTertundaList.length > 100) {
      pesanTertundaList = pesanTertundaList.slice(-100);
    }

    // Tulis ulang file
    await fs.writeFile(
      filePath, 
      JSON.stringify(pesanTertundaList, null, 2)
    );
  } catch (error) {
    console.error('Gagal simpan pesan tertunda:', error);
  }
}

// Event Listener Komprehensif
client.on('ready', () => {
  console.log('WhatsApp Client Terhubung');
});

client.on('authenticated', () => {
  console.log('Autentikasi Berhasil');
});

client.on('auth_failure', (msg) => {
  console.error('Autentikasi Gagal:', msg);
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp Client Terputus:', reason);
});

client.on('message', async (msg) => {
  try {
    console.log('Pesan masuk:', msg.body);
    
    // Contoh: Balas pesan otomatis
    if (msg.body.toLowerCase() === 'ping') {
      await msg.reply('Pong!');
    }
  } catch (error) {
    console.error('Gagal memproses pesan:', error);
  }
});

client.on('error', (error) => {
  console.error('Error WhatsApp Client:', error);
});

module.exports = { 
  client, 
  kirimPesan 
};
