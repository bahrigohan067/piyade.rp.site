import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  roblox_username: string;
  roles: string[];
  guilds?: Array<{
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
  }>;
  sessionToken: string;
  firstLoginAt: string;
  lastLoginAt: string;
}

interface UserDatabase {
  users: Record<string, StoredUser>;              // Keyed by Discord User ID
  tokens: Record<string, string>;                 // sessionToken -> Discord User ID
}

let memoryDb: UserDatabase | null = null;

function getDataFilePath(): string {
  // Support Railway persistent volume mount path via DATA_DIR or fallback to local ./data
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
  return path.join(dataDir, 'users.json');
}

function loadDatabase(): UserDatabase {
  if (memoryDb) {
    return memoryDb;
  }
  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryDb = {
        users: parsed.users || {},
        tokens: parsed.tokens || {},
      };
      return memoryDb;
    }
  } catch (err) {
    console.error('Error reading user database from', filePath, err);
  }
  memoryDb = { users: {}, tokens: {} };
  return memoryDb;
}

function saveDatabase(db: UserDatabase): void {
  memoryDb = db;
  const filePath = getDataFilePath();
  try {
    const jsonStr = JSON.stringify(db, null, 2);
    fs.writeFileSync(filePath, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Error saving user database to', filePath, err);
  }
}

/**
 * Save or update user and return the stored record with a cryptographically secure sessionToken.
 */
export function saveOrUpdateUser(data: {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  roblox_username?: string;
  roles: string[];
  guilds?: any[];
}): StoredUser {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const existing = db.users[data.id];

  // Cryptographically secure 256-bit token (64 hex characters)
  const sessionToken = crypto.randomBytes(32).toString('hex');

  const storedUser: StoredUser = {
    id: data.id,
    username: data.username,
    discriminator: data.discriminator,
    global_name: data.global_name || null,
    avatar: data.avatar,
    roblox_username: data.roblox_username || existing?.roblox_username || data.username,
    roles: data.roles || existing?.roles || [],
    guilds: data.guilds || existing?.guilds || [],
    sessionToken,
    firstLoginAt: existing?.firstLoginAt || now,
    lastLoginAt: now,
  };

  db.users[data.id] = storedUser;
  db.tokens[sessionToken] = data.id;

  saveDatabase(db);
  return storedUser;
}

export function getUserById(id: string): StoredUser | null {
  const db = loadDatabase();
  return db.users[id] || null;
}

/**
 * STRICT lookup: Retrieves a user ONLY by their verified server-issued sessionToken.
 * Never matches by userId or unverified strings.
 */
export function getUserBySessionToken(token: string): StoredUser | null {
  if (!token || typeof token !== 'string' || token.length < 32) {
    return null;
  }
  const db = loadDatabase();
  
  const userId = db.tokens[token];
  if (userId && db.users[userId]) {
    return db.users[userId];
  }

  return null;
}

export function getAllStoredUsers(): StoredUser[] {
  const db = loadDatabase();
  return Object.values(db.users);
}

export function updateUserRoles(id: string, roles: string[], robloxUsername?: string): void {
  const db = loadDatabase();
  const user = db.users[id];
  if (user) {
    user.roles = roles;
    if (robloxUsername) user.roblox_username = robloxUsername;
    user.lastLoginAt = new Date().toISOString();
    saveDatabase(db);
  }
}

export function removeSessionToken(token: string): void {
  if (!token || typeof token !== 'string') return;
  const db = loadDatabase();
  if (db.tokens[token]) {
    delete db.tokens[token];
    saveDatabase(db);
  }
}
