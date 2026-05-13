import http from "node:http";
import { config } from "./config.js";
import { handleCredentialCreate } from "./services/credentialService.js";
import { handleDidSet } from "./services/didService.js";
import { handleSignupComplete } from "./services/workerSignupService.js";
// endpoint , signup
export function createServer(client) {
    return http.createServer(async (req, res) => {
        try {
            if (req.method === "POST" && req.url === "/workers/signup-complete") {
                const body = await readJsonBody(req);
                const response = await handleSignupComplete(client, body);
                sendJson(res, response.statusCode, response.payload);
                return;
            }
            // endpoint , did transaction demand 
            if (req.method === "POST" && req.url === "/workers/did-set") {
                const body = await readJsonBody(req);
                const response = await handleDidSet(client, body);
                sendJson(res, response.statusCode, response.payload);
                return;
            }
            if (req.method === "POST" && req.url === "/credentials/create") {
                const body = await readJsonBody(req);
                const response = await handleCredentialCreate(client, body);
                sendJson(res, response.statusCode, response.payload);
                return;
            }
            if (req.method === "GET" && req.url === "/health") {
                sendJson(res, 200, {
                    ok: true,
                    service: "xrpldid-backend-mvp",
                    xrplWsUrl: config.xrplWsUrl,
                });
                return;
            }
            sendJson(res, 404, { error: "Not found" });
        }
        catch (error) {
            console.error("Request failed", error);
            sendJson(res, 500, { error: getErrorMessage(error) });
        }
    });
}
async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    if (chunks.length === 0) {
        return {};
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(rawBody);
}
function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return "Internal server error";
}
