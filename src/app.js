require('dotenv').config();
const express = require('express');
const { client } = require('./config/whatsapp');
const { handleWhatsAppWebhook } = require('./controllers/webhook.controller');
const { cekReminderPencatatanKeuangan } = require('./services/insight.service');
const logger = require('./utils/logger');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook WhatsApp
client.on('message', async (msg) => {
  try {
    await handleWhatsAppWebhook(msg);
  } catch (error) {
    logger.error('Gagal memproses pesan:', error);
  }
});

// Inisialisasi client
client.initialize();

// Jadwalkan reminder
cron.schedule('0 7 * * *', async () => { // Setiap hari jam 9 pagi
  try {
    await cekReminderPencatatanKeuangan();
  } catch (error) {
    logger.error('Gagal menjalankan reminder:', error);
  }
});

// Tunggu client siap sebelum start server
client.on('ready', () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server berjalan di port ${PORT}`);
  });
});

// Tangani error global
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

console.log('Starting application with environment:', process.env.NODE_ENV);

module.exports = app;
