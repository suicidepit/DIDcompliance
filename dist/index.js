import { config } from "./config.js";
import { ensureWorkerDb } from "./repositories/workerRepository.js";
import { createServer } from "./server.js";
import { createXrplClient } from "./services/xrplWalletService.js";
const client = createXrplClient(config.xrplWsUrl);
const server = createServer(client);
async function main() {
    await ensureWorkerDb();
    await client.connect();
    server.listen(config.port, () => {
        console.log(`Backend listening on http://localhost:${config.port}`);
    });
}
main().catch((error) => {
    console.error("Failed to start backend", error);
    process.exit(1);
});
