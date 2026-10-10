import fs from 'fs';
import path from 'path';

export interface UyariEntry {
  id: string;
  madde: string;
  puan: number;
  aciklama: string;
  yetkili_id: string | number;
  tarih: string;         // "DD/MM/YYYY HH:mm"
  bitis_tarihi: string;  // "DD/MM/YYYY"
  kanit_url: string | null;
  aktif: boolean;
  log_msg_id?: string | null;
}

export interface UserUyariData {
  uyarilar: UyariEntry[];
  toplam_puan: number;
  kademe: number;
  son_uyari_tarihi: string | null;
  jail_bitis: string | null;
}

export interface SicilEntry {
  tarih: string;         // "YYYY-MM-DD HH:mm:ss"
  madde: string;
  aciklama: string;
  yetkili_id: string | number;
  sonuc: string;
}

export type UyariDatabase = Record<string, UserUyariData>;
export type SicilDatabase = Record<string, SicilEntry[]>;

let memoryUyariDb: UyariDatabase | null = null;
let memorySicilDb: SicilDatabase | null = null;

function getPrimaryDataDir(): string {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating primary data dir:', err);
  }
  return dataDir;
}

function getSecondaryBotDataDir(): string | null {
  if (process.env.BOT_DATA_DIR && fs.existsSync(process.env.BOT_DATA_DIR)) {
    return process.env.BOT_DATA_DIR;
  }
  // Local development fallback: sibling piyade.rp.bot directory
  const localBotDir = path.resolve(process.cwd(), '..', 'piyade.rp.bot', 'data');
  if (fs.existsSync(localBotDir)) {
    return localBotDir;
  }
  return null;
}

function getFilePath(filename: 'uyari_data.json' | 'sicil_data.json'): string {
  return path.join(getPrimaryDataDir(), filename);
}

export function loadUyariDatabase(): UyariDatabase {
  if (memoryUyariDb) return memoryUyariDb;

  const primaryPath = getFilePath('uyari_data.json');
  try {
    if (fs.existsSync(primaryPath)) {
      const raw = fs.readFileSync(primaryPath, 'utf-8');
      memoryUyariDb = JSON.parse(raw);
      return memoryUyariDb!;
    }
  } catch (err) {
    console.error('Error reading primary uyari_data.json:', err);
  }

  // Fallback to bot data dir if exists
  const botDir = getSecondaryBotDataDir();
  if (botDir) {
    const botPath = path.join(botDir, 'uyari_data.json');
    try {
      if (fs.existsSync(botPath)) {
        const raw = fs.readFileSync(botPath, 'utf-8');
        memoryUyariDb = JSON.parse(raw);
        return memoryUyariDb!;
      }
    } catch {}
  }

  memoryUyariDb = {};
  return memoryUyariDb;
}

export function saveUyariDatabase(db: UyariDatabase): void {
  memoryUyariDb = db;
  const jsonStr = JSON.stringify(db, null, 4);

  // 1. Save to primary data dir
  const primaryPath = getFilePath('uyari_data.json');
  try {
    fs.writeFileSync(primaryPath, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Error writing primary uyari_data.json:', err);
  }

  // 2. Synchronize to sibling bot data dir if available
  const botDir = getSecondaryBotDataDir();
  if (botDir) {
    const botPath = path.join(botDir, 'uyari_data.json');
    try {
      fs.writeFileSync(botPath, jsonStr, 'utf-8');
    } catch (err) {
      console.error('Error syncing bot uyari_data.json:', err);
    }
  }
}

export function loadSicilDatabase(): SicilDatabase {
  if (memorySicilDb) return memorySicilDb;

  const primaryPath = getFilePath('sicil_data.json');
  try {
    if (fs.existsSync(primaryPath)) {
      const raw = fs.readFileSync(primaryPath, 'utf-8');
      memorySicilDb = JSON.parse(raw);
      return memorySicilDb!;
    }
  } catch (err) {
    console.error('Error reading primary sicil_data.json:', err);
  }

  const botDir = getSecondaryBotDataDir();
  if (botDir) {
    const botPath = path.join(botDir, 'sicil_data.json');
    try {
      if (fs.existsSync(botPath)) {
        const raw = fs.readFileSync(botPath, 'utf-8');
        memorySicilDb = JSON.parse(raw);
        return memorySicilDb!;
      }
    } catch {}
  }

  memorySicilDb = {};
  return memorySicilDb;
}

export function saveSicilDatabase(db: SicilDatabase): void {
  memorySicilDb = db;
  const jsonStr = JSON.stringify(db, null, 4);

  // 1. Primary write
  const primaryPath = getFilePath('sicil_data.json');
  try {
    fs.writeFileSync(primaryPath, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Error writing primary sicil_data.json:', err);
  }

  // 2. Secondary bot dir write
  const botDir = getSecondaryBotDataDir();
  if (botDir) {
    const botPath = path.join(botDir, 'sicil_data.json');
    try {
      fs.writeFileSync(botPath, jsonStr, 'utf-8');
    } catch (err) {
      console.error('Error syncing bot sicil_data.json:', err);
    }
  }
}

export function getUserUyariData(userId: string): UserUyariData {
  const db = loadUyariDatabase();
  const uid = String(userId);
  if (!db[uid]) {
    db[uid] = {
      uyarilar: [],
      toplam_puan: 0,
      kademe: 0,
      son_uyari_tarihi: null,
      jail_bitis: null,
    };
    saveUyariDatabase(db);
  }
  return db[uid];
}

export function hesaplaKademe(toplamPuan: number): number {
  if (toplamPuan >= 15) return 5;
  if (toplamPuan >= 12) return 4;
  if (toplamPuan >= 9) return 3;
  if (toplamPuan >= 6) return 2;
  if (toplamPuan >= 3) return 1;
  return 0;
}

export function addWarning(
  userId: string,
  uyari: UyariEntry,
  newPoints: number,
  newTier: number,
  jailBitis?: string | null
): UserUyariData {
  const db = loadUyariDatabase();
  const uid = String(userId);
  const user = db[uid] || {
    uyarilar: [],
    toplam_puan: 0,
    kademe: 0,
    son_uyari_tarihi: null,
    jail_bitis: null,
  };

  user.uyarilar.push(uyari);
  user.toplam_puan = newPoints;
  user.kademe = newTier;
  user.son_uyari_tarihi = new Date().toISOString();
  if (jailBitis !== undefined) {
    user.jail_bitis = jailBitis;
  }

  db[uid] = user;
  saveUyariDatabase(db);
  return user;
}

export function addSicilRecord(userId: string, record: SicilEntry): void {
  const db = loadSicilDatabase();
  const uid = String(userId);
  if (!db[uid]) {
    db[uid] = [];
  }
  db[uid].push(record);
  saveSicilDatabase(db);
}

export function resetUserWarnings(userId: string): void {
  const db = loadUyariDatabase();
  const uid = String(userId);
  if (db[uid]) {
    db[uid].uyarilar = [];
    db[uid].toplam_puan = 0;
    db[uid].kademe = 0;
    db[uid].son_uyari_tarihi = null;
    db[uid].jail_bitis = null;
    saveUyariDatabase(db);
  }
}
