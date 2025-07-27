import { NextResponse } from 'next/server';
import { readFile, mkdir } from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DATA_FILE = path.join(DATA_DIR, 'users_data.json');

export async function POST(req) {
  try {
    const { username } = await req.json();
    
    // Ensure data directory exists
    await mkdir(DATA_DIR, { recursive: true });
    
    // Read user's data
    try {
      const fileContent = await readFile(USERS_DATA_FILE, 'utf8');
      const allUsersData = JSON.parse(fileContent);
      const userData = allUsersData[username] || {
        docs: {
          'My Drive': [],
          'Shared with me': []
        },
        starredItems: [],
        trashItems: [],
        recentItems: []
      };
      
      return NextResponse.json({ success: true, data: userData });
    } catch (error) {
      // File doesn't exist or is empty, return default data
      return NextResponse.json({
        success: true,
        data: {
          docs: {
            'My Drive': [],
            'Shared with me': []
          },
          starredItems: [],
          trashItems: [],
          recentItems: []
        }
      });
    }
  } catch (error) {
    console.error('Load data error:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
} 