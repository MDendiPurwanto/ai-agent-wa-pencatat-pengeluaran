const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function initializeSheets() {
  try {
    // Konfigurasi kredensial
    const credentials = {
      client_email: 'ai-agent-wa@gen-lang-client-0351653818.iam.gserviceaccount.com',
      private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDCJOQ2gOIz/GfP\n03QjjkyuE7McRScJebFdF+kcrp7sB1aUo78aKw18O1pfwmEJ2jHVKrbJT9ZpIzBU\nO/0I/YYvY6vBbazabhus++4ksjTss6H5WwA4ovE0mTYsbQet9l3jJViIKXqUejyW\nddg/wc1ku6sdQmFdRx/7qyWbwXY9uEeVsw3KCU23jfvWTGB43NGP9O5j6gF26mDq\nsrCZEbK77vS+rUPfGuYTLY2JKoa7r07SlMaccvPHGoIK7So/NiGcWwKlGuTEeb7C\n4tJA6wLTJ7ZqsOE/PaahmkeyqHqlcFKiVX+Yf6OxRDKooaxi0MVIO43ihE+u8oHW\nSRisEFJ3AgMBAAECggEAVFCNRBZpJsahlyJwN9je+GLZ0Jc/wt+05Ycy2CAGKN9u\n/JK4tfaonqFwOFJErnCyX69zPq6LoZGEtbBvze28zuvsdc7Z2Osk3dVzsUArt/iz\niYW57N7m/j7jxht70FNEpxdbAZdyAvWrRnTbe6UBPJQ8VjKz8jynaTcE2EYGwfp6\nc/+EPqdKlHhWSnVbX9lMkzt+zHpcRX9EGtXeoxoUIZKlwQOEHHSOMDjhObOhUUo2\nJZ/ofab7YT2H9qSbrOkBMtmQGRZL5HHpXV84gr1jxF9Azf8b2QmajkoX8OYT1wiw\njCcJKsI4cARwPHf3rlmYYeWO4f5t1ttpHUm7ZfmOUQKBgQDlY1T0agGM9iYQKSSO\nubzBA/jOpitPwswH+0CQ/VbOR9qLfWRXj/dj8ueh28l7lFjzpbfzFvsN18qxcwdm\nGFKRRfJ5dyyfX9YnjVMUVKeoMrkUsiSVyFZjFGhGltY73pyRUHQtJIikpkyYU0OO\nwni1IbWSLMvq0qVw/VqdpdCxcwKBgQDYqtbpDi9aeQdCaWUAReRbDVMLyq+9F4Lo\nrwccvUXdECmSeHs6WGEGSJOeoCZIXJIaM2j6Ch+LoOhwlcUKowGWGGTNurC45KZY\nPI3M1gebuwvqgr53m5+nWttHHM98fJBxyInm9APrZZZe3zuTYPnCOiZY5XgRM1sm\nwGezmiUJ7QKBgDqLDWWLoHWvZKt/NJtQgAHq15c2BZvHpXbsAuB+J6dh4z7yc6d9\nULArkD5Y76UgiUs1oiriVJSF3G9JYjwGPRxic63YYoUSWn+hq/BmYpukxmOny3qG\ntLV4wdwyJt8Ew4S6ucvDpTQQVUATEAzhSRlBTyvNTwXRWPPrVTMi3I5NAoGARkGn\nbGzoF/s0ymkokh0Xvhqk+ibgM32jOlY/BSeuts8d29vrgXDVDVeNXptprn8t9QcE\nnEeaEQm9NXyrJxbSVdxVG4zU7y9dbTE9fdVNJEdTxthccKZq77Z7ciS6dxBhOjQf\n2172wmbvipXyWIjSlBONCbhm5ZT0kq1DMy7hocUCgYBpSkBBUitHu2OpM+w1f+rX\nrVFW+mb4rbx66hXLE7D48oo9qcrfqmN2gVsRhN5hd5esdVrvpLfOvrhvKPCImCzU\noQ5HHUVwEnDzxZlQq3Z6/I2Ll2U8MDGo/PlioINOlkLCkaOxyLx4rAAZY7PjP6tf\nO3TH7RNs7BczVSZB6nMaqg==\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'),
    };

    // Inisialisasi dokumen
    const doc = new GoogleSpreadsheet(
      '1P9oiH5UaNJWBUrvrXdKCo66y-lM3ndmg7YxiVoCGiqE', // Ganti dengan ID spreadsheet Anda
      {
        email: credentials.client_email,
        privateKey: credentials.private_key
      }
    );

    // Autentikasi
    await doc.useServiceAccountAuth(credentials);

    // Muat informasi spreadsheet
    await doc.loadInfo();

    return doc;
  } catch (error) {
    console.error('Gagal inisialisasi Google Sheets:', error);
    throw error;
  }
}

module.exports = { initializeSheets };
