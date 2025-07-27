import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    return res.status(200).json({ files: [] });
  }
  const files = fs.readdirSync(uploadDir);
  res.status(200).json({ files });
} 