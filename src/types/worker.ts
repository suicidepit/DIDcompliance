export type EncryptedSecret = {
  algorithm: "aes-256-gcm";
  iv: string;
  auth_tag: string;
  ciphertext: string;
};

export type WorkerRecord = {
  worker_id: string;
  xrpl_address: string;
  wallet_secret: EncryptedSecret;
  funding_amount_xrp: string;
  funding_tx_hash?: string;
  funding_status?: string;
  created_at: string;
};

export type DbShape = {
  workers: WorkerRecord[];
  did_transactions: DidTransactionRecord[];
  credential_transactions: CredentialTransactionRecord[];
};

export type SignupCompleteRequest = {
  worker_id?: string;
};

export type SignupCompleteResponse = {
  worker_id: string;
  xrpl_address: string;
  funding_tx_hash?: string;
  funding_status?: string;
  reused_existing_wallet: boolean;
};

export type DidTransactionRecord = {
  id: string;
  worker_id: string;
  xrpl_address: string;
  tx_type: "DIDSet";
  did_tx_hash: string;
  did_status: string;
  did_data: string;
  did_document: string;
  did_document_uri: string;
  created_at: string;
};

export type DidSetRequest = {
  worker_id?: string;
};

export type DidSetResponse = {
  worker_id: string;
  xrpl_address: string;
  did_tx_hash: string;
  did_status: string;
  did_document_uri: string;
};

export type CredentialTransactionRecord = {
  id: string;
  issuer_address: string;
  subject_address: string;
  credential_tx_hash: string;
  credential_status: string;
  credential_type: string;
  credential_uri: string;
  created_at: string;
};

export type CredentialCreateRequest = {
  subject_address?: string;
};

export type CredentialCreateResponse = {
  issuer_address: string;
  subject_address: string;
  credential_tx_hash: string;
  credential_status: string;
  credential_type: string;
  credential_uri: string;
};
