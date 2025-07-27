import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const USERS_FILE = path.join(process.cwd(), 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function writeUsers(users) 
{
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash });
  writeUsers(users);
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
  const res = NextResponse.json({ success: true });
  res.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return res;
} 