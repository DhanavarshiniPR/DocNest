import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

// Fallback storage for production environments
let inMemoryUsers = [];

export function readUsers() {
  try {
    if (process.env.NODE_ENV === 'production' && inMemoryUsers.length > 0) {
      return inMemoryUsers;
    }
    
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      const users = JSON.parse(data);
      if (process.env.NODE_ENV === 'production') {
        inMemoryUsers = users;
      }
      return users;
    }
  } catch (error) {
    console.error('Error reading users file:', error);
    if (process.env.NODE_ENV === 'production') {
      return inMemoryUsers;
    }
  }
  return [];
}

export function writeUsers(users) {
  try {
    if (process.env.NODE_ENV === 'production') {
      inMemoryUsers = users;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users file:', error);
    if (process.env.NODE_ENV === 'production') {
      return true;
    }
    return false;
  }
}

export function debugUsers() {
  const users = readUsers();
  console.log('Current users in auth-utils:', users.map(u => ({ username: u.username, hasPassword: !!u.password })));
  return users;
}

export function findUser(username) {
  const users = readUsers();
  return users.find(u => u.username === username);
}

export function addUser(userData) {
  const users = readUsers();
  users.push(userData);
  return writeUsers(users);
} 