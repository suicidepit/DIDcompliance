import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { config } from "./config.js";
import { handleCredentialCreate } from "./services/credentialService.js";
import { handleDidSet } from "./services/didService.js";
import { handleSignupComplete } from "./services/workerSignupService.js";
import type {
  CredentialCreateRequest,
  DidSetRequest,
  SignupCompleteRequest,
} from "./types/worker.js";
import type xrpl from "xrpl";


// endpoint , signup
export function createServer(client: xrpl.Client): http.Server {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/workers/signup-complete") {
        const body = await readJsonBody<SignupCompleteRequest>(req);
        const response = await handleSignupComplete(client, body);
        sendJson(res, response.statusCode, response.payload);
        return;
      }


      // endpoint , did transaction demand 
      if (req.method === "POST" && req.url === "/workers/did-set") {
        const body = await readJsonBody<DidSetRequest>(req);
        const response = await handleDidSet(client, body);
        sendJson(res, response.statusCode, response.payload);
        return;
      }

      if (req.method === "POST" && req.url === "/credentials/create") {
        const body = await readJsonBody<CredentialCreateRequest>(req);
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
    } catch (error) {
      console.error("Request failed", error);
      sendJson(res, 500, { error: getErrorMessage(error) });
    }
  });
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(rawBody) as T;
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Internal server error";
}
