const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

async function diagnoseWhatsApp() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false,
      devtools: true
    }
  });

  client.on('qr', (qr) => {
    console.log('QR Code:');
    qrcode.generate(qr, {small: true});
  });

  client.on('ready', () => {
    console.log('Client siap');
  });

  client.on('error', (err) => {
    console.error('Error:', err);
  });

  try {
    await client.initialize();
  } catch (error) {
    console.error('Inisialisasi gagal:', error);
  }
}

diagnoseWhatsApp();
