import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const form = new IncomingForm({ uploadDir, keepExtensions: true });
  form.on('fileBegin', (name, file) => {
    file.path = path.join(uploadDir, file.originalFilename);
  });
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });
    return res.status(200).json({ success: true });
  });
} 