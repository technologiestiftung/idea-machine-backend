import WebSocket, { WebSocketServer } from "ws";
import { getDicesAsJson } from "../state/state.js";

export const webSocketServer = new WebSocketServer({
	port: process.env.WS_PORT,
});

webSocketServer.on("listening", () =>
	console.log(`websocket server listening on port ${process.env.WS_PORT}`),
);

webSocketServer.on("connection", function connection(webSocket) {
	webSocket.on("error", console.error);

	webSocket.on("message", function message(data) {
		// console.log("received: %s", data);
	});

	webSocket.send(getDicesAsJson());
});

webSocketServer.on("close", () => console.log("websocket server closed"));

export function broadcast(data) {
	// console.log("broadcast", data);
	webSocketServer.clients.forEach((client) => {
		if (client.readyState !== WebSocket.OPEN) {
			return;
		}

		client.send(data);
	});
}
