const openai = require('../config/openai');

async function ekstrakStruk(imageUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Ekstrak detail transaksi dari struk dalam format JSON VALID dengan kunci: tanggal, total, merchant, kategori. Pastikan total adalah angka, tanggal dalam format DD-MM-YYYY" 
            },
            { 
              type: "image_url", 
              image_url: { url: imageUrl } 
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content;
    
    // Parse dengan validasi
    const hasilEkstraksi = JSON.parse(responseContent);
    
    // Validasi dan normalisasi data
    return {
      tanggal: hasilEkstraksi.tanggal || new Date().toLocaleDateString('id-ID'),
      total: hasilEkstraksi.total || 0,
      merchant: hasilEkstraksi.merchant || 'Tidak Diketahui',
      kategori: hasilEkstraksi.kategori || 'Lainnya'
    };
  } catch (error) {
    console.error("Gagal ekstrak struk:", error);
    
    // Fallback dengan data minimal
    return {
      tanggal: new Date().toLocaleDateString('id-ID'),
      total: 0,
      merchant: 'Tidak Diketahui',
      kategori: 'Lainnya'
    };
  }
}

module.exports = { ekstrakStruk };
