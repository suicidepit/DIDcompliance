import xrpl from "xrpl";
export function createXrplClient(wsUrl) {
    return new xrpl.Client(wsUrl);
}
export function generateWallet() {
    return xrpl.Wallet.generate();
}
export async function fundWallet(client, treasurySeed, fundingAmountXrp, destinationAddress) {
    const treasuryWallet = xrpl.Wallet.fromSeed(treasurySeed);
    const payment = {
        TransactionType: "Payment",
        Account: treasuryWallet.classicAddress,
        Destination: destinationAddress,
        Amount: xrpl.xrpToDrops(fundingAmountXrp),
    };
    const result = await client.submitAndWait(payment, { wallet: treasuryWallet });
    const txMeta = result.result.meta;
    const txResult = txMeta && typeof txMeta !== "string" ? txMeta.TransactionResult : undefined;
    if (txResult !== "tesSUCCESS") {
        throw new Error(`Funding transaction failed with result ${txResult || "unknown"}`);
    }
    return {
        hash: result.result.hash,
        status: txResult,
    };
}
export async function submitDidSet(client, walletSeed, didData, didDocument, didDocumentUri) {
    const wallet = xrpl.Wallet.fromSeed(walletSeed);
    const transaction = {
        TransactionType: "DIDSet",
        Account: wallet.classicAddress,
        Data: xrpl.convertStringToHex(didData),
        DIDDocument: xrpl.convertStringToHex(didDocument),
        URI: xrpl.convertStringToHex(didDocumentUri),
    };
    const result = await client.submitAndWait(transaction, { wallet });
    const txMeta = result.result.meta;
    const txResult = txMeta && typeof txMeta !== "string" ? txMeta.TransactionResult : undefined;
    if (txResult !== "tesSUCCESS") {
        throw new Error(`DIDSet transaction failed with result ${txResult || "unknown"}`);
    }
    return {
        hash: result.result.hash,
        status: txResult,
    };
}
export async function submitCredentialCreate(client, issuerSeed, subjectAddress, credentialType, credentialUri) {
    const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);
    const transaction = {
        TransactionType: "CredentialCreate",
        Account: issuerWallet.classicAddress,
        Subject: subjectAddress,
        CredentialType: xrpl.convertStringToHex(credentialType),
        URI: xrpl.convertStringToHex(credentialUri),
    };
    const result = await client.submitAndWait(transaction, { wallet: issuerWallet });
    const txMeta = result.result.meta;
    const txResult = txMeta && typeof txMeta !== "string" ? txMeta.TransactionResult : undefined;
    if (txResult !== "tesSUCCESS") {
        throw new Error(`CredentialCreate transaction failed with result ${txResult || "unknown"}`);
    }
    return {
        hash: result.result.hash,
        status: txResult,
        issuerAddress: issuerWallet.classicAddress,
    };
}
