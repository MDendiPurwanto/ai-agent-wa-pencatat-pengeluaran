const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const path = require('path');
const puppeteer = require('puppeteer');
const { access, mkdir, writeFile, readFile } = require('fs').promises;

// Path Chrome yang sudah dikonfirmasi
const CHROME_PATH = '/usr/bin/google-chrome'; // Or your Chrome path

// Fungsi validasi path
async function validateChromePath(chromePath) {
  try {
    await access(chromePath);
    console.log(`Chrome ditemukan di: ${chromePath}`);
    return true;
  } catch (error) {
    console.error(`Chrome tidak ditemukan di path: ${chromePath}`);
    console.error('Error:', error.message);
    return false;
  }
}

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'ai-agent-pencatatan',
    dataPath: path.join('/opt/ai-agent-wa/wa-session') // Adjust if needed
  }),
  puppeteer: {
    headless: true, // Set to false for debugging
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=9222' // Important for Puppeteer
    ]
  }
});

// Validasi path Chrome
(async () => {
  try {
    const isValid = await validateChromePath(CHROME_PATH);
    if (!isValid) {
      console.warn('Gunakan path default Puppeteer');
    }
  } catch (error) {
    console.error('Gagal validasi path Chrome:', error);
  }
})();


client.on('qr', async (qr) => {
  console.log('QR RECEIVED');

  const qrImagePath = path.join('/opt/ai-agent-wa/qr-code.png'); // Adjust path as needed

  try {
    await qrcode.toFile(qrImagePath, qr, { type: 'png' });
    console.log(`QR Code disimpan di: ${qrImagePath}`);
    console.log('Gunakan aplikasi WhatsApp untuk scan QR Code');

    qrcodeTerminal.generate(qr, { small: true }); // Display in terminal
  } catch (error) {
    console.error('Gagal membuat QR Code:', error);
  }
});

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


async function kirimPesan(nomorPenerima, pesan) {
  try {
    if (!pesan || pesan.trim() === '') {
      console.warn('Pesan kosong, tidak dikirim');
      return false;
    }

    const nomorFormated = nomorPenerima.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const nomorWhatsApp = `${nomorFormated}@c.us`;

    if (!client.isReady) {
      console.warn('WhatsApp client belum siap');
      await simpanPesanTertunda(pesan, nomorPenerima);
      return false;
    }

    await client.sendMessage(nomorWhatsApp, pesan);
    console.log(`Pesan terkirim ke ${nomorPenerima}`);
    return true;
  } catch (error) {
    console.error(`Gagal kirim pesan ke ${nomorPenerima}:`, error);
    await simpanPesanTertunda(pesan, nomorPenerima);
    return false;
  }
}

async function simpanPesanTertunda(pesan, nomorPenerima) {
  try {
    const filePath = path.join(__dirname, '..', '..', 'pesan_tertunda.json'); // Corrected path
    await mkdir(path.dirname(filePath), { recursive: true });

    let pesanTertundaList = [];
    try {
      const fileContent = await readFile(filePath, 'utf8');
      pesanTertundaList = JSON.parse(fileContent || '[]');
    } catch (readError) {
      console.warn('File pesan tertunda belum ada, membuat file baru');
    }

    pesanTertundaList.push({
      pesan,
      nomorPenerima,
      timestamp: new Date().toISOString(),
      status: 'tertunda',
      percobaan: 0
    });

    if (pesanTertundaList.length > 100) {
      pesanTertundaList = pesanTertundaList.slice(-100);
    }

    await writeFile(filePath, JSON.stringify(pesanTertundaList, null, 2));
  } catch (error) {
    console.error('Gagal simpan pesan tertunda:', error);
  }
}

client.initialize();


module.exports = {
  client,
  kirimPesan
};
