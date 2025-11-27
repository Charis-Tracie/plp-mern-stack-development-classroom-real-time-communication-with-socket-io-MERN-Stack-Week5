// server/utils/fileUpload.js
const fs = require('fs');
const path = require('path');

exports.saveBase64File = (base64, filename) => {
  try {
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid base64 data');
    const ext = matches[1].split('/')[1] || 'bin';
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filepath = path.join(uploadsDir, `${Date.now()}-${filename}.${ext}`);
    fs.writeFileSync(filepath, buffer);
    // In dev serve static /uploads
    return { url: `/uploads/${path.basename(filepath)}`, path: filepath };
  } catch (err) {
    console.error('file save error', err);
    return null;
  }
};
