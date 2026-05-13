import xrpl from "xrpl";

export type FundingResult = {
  hash: string;
  status: string;
};

export type DidSetResult = {
  hash: string;
  status: string;
};

export type CredentialCreateResult = {
  hash: string;
  status: string;
  issuerAddress: string;
};

export function createXrplClient(wsUrl: string): xrpl.Client {
  return new xrpl.Client(wsUrl);
}

export function generateWallet(): xrpl.Wallet {
  return xrpl.Wallet.generate();
}

export async function fundWallet(
  client: xrpl.Client,
  treasurySeed: string,
  fundingAmountXrp: string,
  destinationAddress: string,
): Promise<FundingResult> {
  const treasuryWallet = xrpl.Wallet.fromSeed(treasurySeed);
  const payment = {
    TransactionType: "Payment" as const,
    Account: treasuryWallet.classicAddress,
    Destination: destinationAddress,
    Amount: xrpl.xrpToDrops(fundingAmountXrp),
  };

  const result = await client.submitAndWait(payment, { wallet: treasuryWallet });
  const txMeta = result.result.meta;
  const txResult =
    txMeta && typeof txMeta !== "string" ? txMeta.TransactionResult : undefined;

  if (txResult !== "tesSUCCESS") {
    throw new Error(`Funding transaction failed with result ${txResult || "unknown"}`);
  }

  return {
    hash: result.result.hash,
    status: txResult,
  };
}

export async function submitDidSet(
  client: xrpl.Client,
  walletSeed: string,
  didData: string,
  didDocument: string,
  didDocumentUri: string,
): Promise<DidSetResult> {
  const wallet = xrpl.Wallet.fromSeed(walletSeed);
  const transaction = {
    TransactionType: "DIDSet" as const,
    Account: wallet.classicAddress,
    Data: xrpl.convertStringToHex(didData),
    DIDDocument: xrpl.convertStringToHex(didDocument),
    URI: xrpl.convertStringToHex(didDocumentUri),
  };

  const result = await client.submitAndWait(transaction, { wallet });
  const txMeta = result.result.meta;
  const txResult =
    txMeta && typeof txMeta !== "string" ? txMeta.TransactionResult : undefined;

  if (txResult !== "tesSUCCESS") {
    throw new Error(`DIDSet transaction failed with result ${txResult || "unknown"}`);
  }

  return {
    hash: result.result.hash,
    status: txResult,
  };
}

export async function submitCredentialCreate(
  client: xrpl.Client,
  issuerSeed: string,
  subjectAddress: string,
  credentialType: string,
  credentialUri: string,
): Promise<CredentialCreateResult> {
  const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);
  const transaction = {
    TransactionType: "CredentialCreate" as const,
    Account: issuerWallet.classicAddress,
    Subject: subjectAddress,
    CredentialType: xrpl.convertStringToHex(credentialType),
    URI: xrpl.convertStringToHex(credentialUri),
  };

  const result = await client.submitAndWait(transaction, { wallet: issuerWallet });
  const txMeta = result.result.meta;
  const txResult =
    txMeta && typeof txMeta !== "string" ? txMeta.TransactionResult : undefined;

  if (txResult !== "tesSUCCESS") {
    throw new Error(`CredentialCreate transaction failed with result ${txResult || "unknown"}`);
  }

  return {
    hash: result.result.hash,
    status: txResult,
    issuerAddress: issuerWallet.classicAddress,
  };
}
