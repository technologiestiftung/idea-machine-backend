setTimeout(async () => {
	const bluetoothSerialMonitors = import("./services/bluetooth/bluetooth.js");
	const server = import("./services/rest/rest.js");
	const { webSocketServer } = import("./services/socket/socket.js");
	const { gpioProcess } = import("./services/gpio/gpio.js");
	await import("./services/print/print.js");
	await import("./services/browser/browser.js");

	process.on("SIGINT", () => closeEverything(1));

	process.on("SIGTERM", () => closeEverything(0));

	function closeEverything(eventId) {
		bluetoothSerialMonitors.forEach((monitor) => monitor.kill());
		server.close();
		webSocketServer.clients.forEach((client) => client.close());
		webSocketServer.close();
		gpioProcess.kill();

		process.exit(eventId);
	}
}, 30_000);
