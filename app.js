require('dotenv').config();
const express = require('express');
const { client } = require('./config/whatsapp');
const { handleWhatsAppWebhook } = require('./controllers/webhook.controller');
const { cekReminderPencatatanKeuangan } = require('./services/insight.service');
const logger = require('./utils/logger');
const cron = require('node-cron');
const qrServer = require('./qr-server');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/qr', qrServer); // Gunakan router di sini

client.on('message', async (msg) => {
  try {
    await handleWhatsAppWebhook(msg);
  } catch (error) {
    logger.error('Gagal memproses pesan:', error);
  }
});

// client.initialize() dipindahkan ke config/whatsapp.js

cron.schedule('0 7 * * *', async () => {
  try {
    await cekReminderPencatatanKeuangan();
  } catch (error) {
    logger.error('Gagal menjalankan reminder:', error);
  }
});

client.on('ready', () => {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    logger.info(`Server berjalan di port ${PORT}`);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

console.log('Starting application with environment:', process.env.NODE_ENV);

module.exports = app;
