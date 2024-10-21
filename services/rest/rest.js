import http from "node:http";
import { handleIsApiAlive } from "./paths/default.js";
import { handleLabels } from "./paths/labels/labels.js";
import { handleShutdown } from "./paths/shutdown/shutdown.js";
import { handlePregenerate } from "./paths/pregenerate/pregenerate.js";
import { handlePickIdea } from "./paths/pick-idea/pick-idea.js";
import { handleGenerate } from "./paths/generate/generate.js";
import { handleRegenerateOnlyPdfs } from "./paths/regenerate-only-pdfs/regenerate-only-pdfs.js";

const port = process.env.API_PORT;

export const server = http.createServer();

server.on("request", handleRequest);

/**
 * Handles incoming requests
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
function handleRequest(request, response) {
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Methods", "OPTIONS, PUT, GET");

	if (request.method === "OPTIONS") {
		response.statusCode = 204;
		response.end();
		return;
	}

	response.setHeader("Content-Type", "application/json");

	/**
	 * @type {Uint8Array[]}
	 */
	let body = [];

	request
		.on("data", (chunk) => {
			body.push(chunk);
		})
		.on("end", async () => {
			switch (request.url) {
				case "/generate":
					await handleGenerate(response);
					break;
				case "/labels":
					handleLabels({ request, body, response });
					break;
				case "/pick-idea":
					await handlePickIdea(response);
					break;
				case "/pregenerate":
					await handlePregenerate(response);
					break;
				case "/regenerate-only-pdfs":
					await handleRegenerateOnlyPdfs(response);
					break;
				case "/shutdown":
					handleShutdown(response);
					break;
				default:
					handleIsApiAlive(response);
			}
		});
}

server.listen(port, () => console.info("listening on port:", port));

server.on("close", () => console.log("api server closed"));
