import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_WS_URL = "wss://s.altnet.rippletest.net:51233";
const DEFAULT_PORT = 3000;
const DEFAULT_FUNDING_XRP = "1.3";

loadEnvFile(path.join(ROOT_DIR, ".env"));

export const config = {
  rootDir: ROOT_DIR,
  dataDir: path.join(ROOT_DIR, "data"),
  dbPath: path.join(ROOT_DIR, "data", "workers.json"),
  port: Number(process.env.PORT || DEFAULT_PORT),
  xrplWsUrl: process.env.XRPL_WS_URL || DEFAULT_WS_URL,
  treasurySeed: process.env.TREASURY_WALLET_SEED || "",
  fundingAmountXrp: process.env.TREASURY_FUNDING_AMOUNT_XRP || DEFAULT_FUNDING_XRP,
  encryptionKey: process.env.WALLET_ENCRYPTION_KEY || "",
};

validateConfig(config);

function validateConfig(appConfig: typeof config): void {
  const missing: string[] = [];

  if (!appConfig.treasurySeed) {
    missing.push("TREASURY_WALLET_SEED");
  }

  if (!appConfig.encryptionKey) {
    missing.push("WALLET_ENCRYPTION_KEY");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function loadEnvFile(envFilePath: string): void {
  try {
    const raw = readFileSync(envFilePath, "utf8");
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!process.env[key]) {
        process.env[key] = stripWrappingQuotes(value);
      }
    }
  } catch {
    // Optional .env file.
  }
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
