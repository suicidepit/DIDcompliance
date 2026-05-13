import { mkdir, readFile, writeFile } from "node:fs/promises";
import { config } from "../config.js";
import type {
  CredentialTransactionRecord,
  DbShape,
  DidTransactionRecord,
  WorkerRecord,
} from "../types/worker.js";


// mock db inserting 
export async function ensureWorkerDb(): Promise<void> {
  await mkdir(config.dataDir, { recursive: true });

  try {
    const db = await readDb();
    let shouldRewrite = false;

    if (!Array.isArray(db.workers)) {
      db.workers = [];
      shouldRewrite = true;
    }

    if (!Array.isArray(db.did_transactions)) {
      db.did_transactions = [];
      shouldRewrite = true;
    }

    if (!Array.isArray(db.credential_transactions)) {
      db.credential_transactions = [];
      shouldRewrite = true;
    }

    if (shouldRewrite) {
      await writeDb(db);
    }
  } catch {
    await writeDb({ workers: [], did_transactions: [], credential_transactions: [] });
  }
}

export async function findWorkerById(workerId: string): Promise<WorkerRecord | undefined> {
  const db = await readDb();
  return db.workers.find((worker) => worker.worker_id === workerId);
}

export async function createWorker(worker: WorkerRecord): Promise<void> {
  const db = await readDb();
  db.workers.push(worker);
  await writeDb(db);
}

export async function createDidTransaction(didTransaction: DidTransactionRecord): Promise<void> {
  const db = await readDb();
  db.did_transactions.push(didTransaction);
  await writeDb(db);
}

export async function findDidTransactionsByWorkerId(
  workerId: string,
): Promise<DidTransactionRecord[]> {
  const db = await readDb();
  return db.did_transactions.filter((transaction) => transaction.worker_id === workerId);
}

export async function createCredentialTransaction(
  credentialTransaction: CredentialTransactionRecord,
): Promise<void> {
  const db = await readDb();
  db.credential_transactions.push(credentialTransaction);
  await writeDb(db);
}

async function readDb(): Promise<DbShape> {
  const raw = await readFile(config.dbPath, "utf8");
  return JSON.parse(raw) as DbShape;
}

async function writeDb(db: DbShape): Promise<void> {
  await writeFile(config.dbPath, JSON.stringify(db, null, 2));
}
