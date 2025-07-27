import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DATA_FILE = path.join(DATA_DIR, 'users_data.json');

export async function POST(req) {
  try {
    const { username, data } = await req.json();
    
    // Ensure data directory exists
    await mkdir(DATA_DIR, { recursive: true });
    
    // Read existing data
    let allUsersData = {};
    try {
      const existingData = await readFile(USERS_DATA_FILE, 'utf8');
      allUsersData = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist yet, start with empty object
      console.log('No existing data file, starting fresh');
    }
    
    // Update user's data
    allUsersData[username] = data;
    
    // Write back to file
    await writeFile(USERS_DATA_FILE, JSON.stringify(allUsersData, null, 2));
    console.log(`Data saved for user: ${username}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save data error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
} 