import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
export function encryptSecret(secret, encryptionKey) {
    const key = createHash("sha256").update(encryptionKey, "utf8").digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        algorithm: "aes-256-gcm",
        iv: iv.toString("base64"),
        auth_tag: authTag.toString("base64"),
        ciphertext: ciphertext.toString("base64"),
    };
}
export function decryptSecret(encryptedSecret, encryptionKey) {
    const key = createHash("sha256").update(encryptionKey, "utf8").digest();
    const decipher = createDecipheriv(encryptedSecret.algorithm, key, Buffer.from(encryptedSecret.iv, "base64"));
    decipher.setAuthTag(Buffer.from(encryptedSecret.auth_tag, "base64"));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(encryptedSecret.ciphertext, "base64")),
        decipher.final(),
    ]);
    return plaintext.toString("utf8");
}
