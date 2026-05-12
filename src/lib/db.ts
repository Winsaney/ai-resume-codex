import { openDB, IDBPDatabase } from 'idb';

export interface HistoryRecord {
  id: string;
  createdAt: number;
  label: string;
  resumeText: string;
  resumePreview: string;
  jdText: string;
  jdPreview: string;
  result: string;
  model: string;
  language: 'en' | 'zh';
}

const DB_NAME = 'resume-optimizer-history';
const DB_VERSION = 1;
const STORE_NAME = 'records';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('label', 'label');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllRecords(): Promise<HistoryRecord[]> {
  const db = await getDB();
  const records = await db.getAll(STORE_NAME);
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRecord(id: string): Promise<HistoryRecord | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function addRecord(record: HistoryRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, record);
}

export async function updateRecord(record: HistoryRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, record);
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function deleteAllRecords(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function importRecords(
  records: HistoryRecord[],
  mode: 'merge' | 'replace'
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  if (mode === 'replace') {
    await store.clear();
  }

  for (const record of records) {
    const toStore =
      mode === 'merge' ? { ...record, id: crypto.randomUUID() } : record;
    await store.put(toStore);
  }

  await tx.done;
}

export async function exportAllRecords(): Promise<HistoryRecord[]> {
  return getAllRecords();
}
