import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const form = formidable({ uploadDir, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return resolve(NextResponse.json({ error: 'Upload error' }, { status: 500 }));
      const file = files.file;
      if (!file) return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
      const filename = path.basename(file[0].filepath);
      const url = `/uploads/${filename}`;
      resolve(NextResponse.json({ url, name: file[0].originalFilename }));
    });
  });
} 