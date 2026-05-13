import { randomUUID } from "node:crypto";
import type xrpl from "xrpl";
import { config } from "../config.js";
import { decryptSecret } from "../lib/crypto.js";
import {
  createDidTransaction,
  findDidTransactionsByWorkerId,
  findWorkerById,
} from "../repositories/workerRepository.js";
import { submitDidSet } from "./xrplWalletService.js";
import type { DidSetRequest, DidSetResponse, DidTransactionRecord } from "../types/worker.js";

export async function handleDidSet(
  client: xrpl.Client,
  body: DidSetRequest,
): Promise<{
  statusCode: number;
  payload: { error: string } | DidSetResponse;
}> {
  const workerId = typeof body.worker_id === "string" ? body.worker_id.trim() : "";

  if (!workerId) {
    return {
      statusCode: 400,
      payload: { error: "worker_id is required" },
    };
  }

  const worker = await findWorkerById(workerId);
  if (!worker) {
    return {
      statusCode: 404,
      payload: { error: "worker not found" },
    };
  }

  const existingDidTransactions = await findDidTransactionsByWorkerId(workerId);
  const existingDidSet = existingDidTransactions.find((transaction) => transaction.tx_type === "DIDSet");
  if (existingDidSet) {
    return {
      statusCode: 200,
      payload: {
        worker_id: existingDidSet.worker_id,
        xrpl_address: existingDidSet.xrpl_address,
        did_tx_hash: existingDidSet.did_tx_hash,
        did_status: existingDidSet.did_status,
        did_document_uri: existingDidSet.did_document_uri,
      },
    };
  }

  const walletSeed = decryptSecret(worker.wallet_secret, config.encryptionKey);
  const mockDid = buildMockDidPayload(worker.worker_id, worker.xrpl_address);
  const didResult = await submitDidSet(
    client,
    walletSeed,
    mockDid.data,
    mockDid.document,
    mockDid.uri,
  );

  const didTransaction: DidTransactionRecord = {
    id: randomUUID(),
    worker_id: worker.worker_id,
    xrpl_address: worker.xrpl_address,
    tx_type: "DIDSet",
    did_tx_hash: didResult.hash,
    did_status: didResult.status,
    did_data: mockDid.data,
    did_document: mockDid.document,
    did_document_uri: mockDid.uri,
    created_at: new Date().toISOString(),
  };

  await createDidTransaction(didTransaction);

  return {
    statusCode: 201,
    payload: {
      worker_id: didTransaction.worker_id,
      xrpl_address: didTransaction.xrpl_address,
      did_tx_hash: didTransaction.did_tx_hash,
      did_status: didTransaction.did_status,
      did_document_uri: didTransaction.did_document_uri,
    },
  };
}

function buildMockDidPayload(workerId: string, xrplAddress: string): {
  data: string;
  document: string;
  uri: string;
} {
  const uri = `https://mock.example.com/d/${workerId}`;
  const document = `did:xrpl:${xrplAddress}`;
  const data = workerId;

  return { data, document, uri };
}


//look up worker_id, decrypt that worker’s stored seed, reconstruct the wallet,
// build mock DID payloads, submit a DIDSet, and persist the result as a separate record.
