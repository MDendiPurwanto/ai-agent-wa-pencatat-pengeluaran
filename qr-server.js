const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

// Buat router Express
const router = express.Router();

const SESSION_FILE_PATH = path.join(__dirname, 'wa-session/session-ai-agent-pencatatan');

let client;
let currentQR = null;
let qrGenerated = false;
let isConnected = false;

async function initializeWhatsAppClient() {
    try {
        client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: 'client-one',
                dataPath: SESSION_FILE_PATH 
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-gpu',
                    '--disable-dev-shm-usage'
                ],
                executablePath: '/usr/bin/google-chrome'
            },
        });

        client.on('qr', async (qr) => {
            console.log('QR Code Received');
            qrGenerated = true;
            try {
                currentQR = await qrcode.toDataURL(qr);
                console.log("QR Data URL (truncated):", currentQR.slice(0, 100) + "...");
            } catch (err) {
                console.error("Error generating data URL:", err);
            }
        });

        client.on('authenticated', () => {
            console.log('Client is authenticated!');
            qrGenerated = false;
            isConnected = true;
        });

        client.on('ready', () => {
            console.log('Client is ready!');
            currentQR = null;
            qrGenerated = false;
            isConnected = true;
        });

        client.on('message', message => {
            console.log('Message received:', message.body);
            if (message.body === '!ping') {
                message.reply('pong');
            }
        });

        client.on('disconnected', async (reason) => {
            console.log('Client was disconnected:', reason);
            isConnected = false;
            
            // Reconnect strategy
            await new Promise(resolve => setTimeout(resolve, 5000));
            try {
                await client.initialize();
            } catch (error) {
                console.error('Reinitialization Failed:', error);
            }
        });

        await client.initialize();

    } catch (error) {
        console.error("Error initializing WhatsApp client:", error);
        process.exit(1);
    }
}

// Route untuk QR Code
router.get('/', (req, res) => {
    console.log("GET /qr called");

    try {
        if (client && client.isReady) {
            return res.sendFile(path.join(__dirname, 'public', 'ready.html'));
        }

        if (currentQR && qrGenerated) {
            res.sendFile(path.join(__dirname, 'public', 'qr.html'));
        } else if (qrGenerated === false) {
            res.sendFile(path.join(__dirname, 'public', 'loading.html'));
        } else {
            res.sendFile(path.join(__dirname, 'public', 'waiting.html'));
        }
    } catch (error) {
        console.error("Error handling /qr request:", error);
        res.status(500).send("<h1>Error</h1><p>An error occurred.</p>");
    }
});

// Route untuk mengirim pesan
router.post('/send-message', (req, res) => {
    const { phone, message } = req.body;

    if (!client || !client.isReady) {
        return res.status(500).send("WhatsApp client is not ready.");
    }

    const chatId = phone + "@c.us";

    client.sendMessage(chatId, message)
        .then(response => {
            res.send({ message: "Message sent!", response });
        })
        .catch(err => {
            console.error("Error sending message:", err);
            res.status(500).send({ 
                message: "Error sending message.", 
                error: err 
            });
        });
});

// Route status kesehatan
router.get('/health', (req, res) => {
    res.json({
        status: client && client.isReady ? 'online' : 'offline',
        isConnected: isConnected,
        qrGenerated: qrGenerated,
        timestamp: new Date().toISOString()
    });
});

// Inisialisasi client saat modul di-import
initializeWhatsAppClient();

// Tangani sinyal shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        if (client && client.isReady) {
            await client.logout();
        }
    } catch (err) {
        console.error('Error during logout:', err);
    } finally {
        process.exit(0);
    }
});

// Ekspor router
module.exports = router;
