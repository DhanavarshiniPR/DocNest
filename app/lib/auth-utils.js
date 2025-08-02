import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

// Fallback storage for production environments
let inMemoryUsers = [];

export function readUsers() {
  try {
    // In production, use in-memory storage if available
    if (process.env.NODE_ENV === 'production') {
      if (inMemoryUsers.length > 0) {
        return inMemoryUsers;
      }
      // Try to read from file first, then fall back to empty array
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(data);
        inMemoryUsers = users;
        return users;
      }
      return [];
    }
    
    // In development, try to read from file
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const users = JSON.parse(data);
      return users;
    }
  } catch (error) {
    console.error('Error reading users file:', error);
    // In production, return in-memory data or empty array
    if (process.env.NODE_ENV === 'production') {
      return inMemoryUsers;
    }
  }
  return [];
}

export function writeUsers(users) {
  try {
    // Always update in-memory storage in production
    if (process.env.NODE_ENV === 'production') {
      inMemoryUsers = users;
    }
    
    // Try to write to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    // In production, consider it successful if in-memory is updated
    if (process.env.NODE_ENV === 'production') {
      return true;
    }
    return false;
  }
}

export function debugUsers() {
  try {
    const users = readUsers();
    console.log('Current users in auth-utils:', users.map(u => ({ username: u.username, hasPassword: !!u.password })));
    return users;
  } catch (error) {
    console.error('Error in debugUsers:', error);
    return [];
  }
}

export function findUser(username) {
  try {
    const users = readUsers();
    return users.find(u => u.username === username);
  } catch (error) {
    console.error('Error in findUser:', error);
    return null;
  }
}

export function addUser(userData) {
  try {
    const users = readUsers();
    users.push(userData);
    return writeUsers(users);
  } catch (error) {
    console.error('Error in addUser:', error);
    return false;
  }
} 