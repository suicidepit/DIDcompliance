import { randomUUID } from "node:crypto";
import type xrpl from "xrpl";
import { config } from "../config.js";
import { createCredentialTransaction } from "../repositories/workerRepository.js";
import { submitCredentialCreate } from "./xrplWalletService.js";
import type {
  CredentialCreateRequest,
  CredentialCreateResponse,
  CredentialTransactionRecord,
} from "../types/worker.js";

export async function handleCredentialCreate(
  client: xrpl.Client,
  body: CredentialCreateRequest,
): Promise<{
  statusCode: number;
  payload: { error: string } | CredentialCreateResponse;
}> {
  const subjectAddress =
    typeof body.subject_address === "string" ? body.subject_address.trim() : "";

  if (!subjectAddress) {
    return {
      statusCode: 400,
      payload: { error: "subject_address is required" },
    };
  }

  const mockCredential = buildMockCredentialPayload(subjectAddress);
  const credentialResult = await submitCredentialCreate(
    client,
    config.treasurySeed,
    subjectAddress,
    mockCredential.credentialType,
    mockCredential.uri,
  );

  const credentialTransaction: CredentialTransactionRecord = {
    id: randomUUID(),
    issuer_address: credentialResult.issuerAddress,
    subject_address: subjectAddress,
    credential_tx_hash: credentialResult.hash,
    credential_status: credentialResult.status,
    credential_type: mockCredential.credentialType,
    credential_uri: mockCredential.uri,
    created_at: new Date().toISOString(),
  };

  await createCredentialTransaction(credentialTransaction);

  return {
    statusCode: 201,
    payload: {
      issuer_address: credentialTransaction.issuer_address,
      subject_address: credentialTransaction.subject_address,
      credential_tx_hash: credentialTransaction.credential_tx_hash,
      credential_status: credentialTransaction.credential_status,
      credential_type: credentialTransaction.credential_type,
      credential_uri: credentialTransaction.credential_uri,
    },
  };
}

function buildMockCredentialPayload(subjectAddress: string): {
  credentialType: string;
  uri: string;
} {
  return {
    credentialType: "worker-id-v1",
    uri: `https://mock.example.com/c/${subjectAddress.slice(0, 12)}`,
  };
}
