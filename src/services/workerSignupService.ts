import type xrpl from "xrpl";
import { config } from "../config.js";
import { encryptSecret } from "../lib/crypto.js";
import { createWorker, findWorkerById } from "../repositories/workerRepository.js";
import { fundWallet, generateWallet } from "./xrplWalletService.js";
import type { SignupCompleteRequest, SignupCompleteResponse, WorkerRecord } from "../types/worker.js";

export async function handleSignupComplete(
  client: xrpl.Client,
  body: SignupCompleteRequest,
): Promise<{
  statusCode: number;
  payload: { error: string } | SignupCompleteResponse;
}> {
  const workerId = typeof body.worker_id === "string" ? body.worker_id.trim() : "";

  if (!workerId) {
    return {
      statusCode: 400,
      payload: { error: "worker_id is required" },
    };
  }

  const existingWorker = await findWorkerById(workerId);
  if (existingWorker) {
    return {
      statusCode: 200,
      payload: {
        worker_id: existingWorker.worker_id,
        xrpl_address: existingWorker.xrpl_address,
        funding_tx_hash: existingWorker.funding_tx_hash,
        funding_status: existingWorker.funding_status,
        reused_existing_wallet: true,
      },
    };
  }

  const newWallet = generateWallet();
  const encryptedSecret = encryptSecret(newWallet.seed!, config.encryptionKey);
  const fundingResult = await fundWallet(
    client,
    config.treasurySeed,
    config.fundingAmountXrp,
    newWallet.address,
  );

  const workerRecord: WorkerRecord = {
    worker_id: workerId,
    xrpl_address: newWallet.address,
    wallet_secret: encryptedSecret,
    funding_amount_xrp: config.fundingAmountXrp,
    funding_tx_hash: fundingResult.hash,
    funding_status: fundingResult.status,
    created_at: new Date().toISOString(),
  };

  await createWorker(workerRecord);

  return {
    statusCode: 201,
    payload: {
      worker_id: workerRecord.worker_id,
      xrpl_address: workerRecord.xrpl_address,
      funding_tx_hash: workerRecord.funding_tx_hash,
      funding_status: workerRecord.funding_status,
      reused_existing_wallet: false,
    },
  };
}
