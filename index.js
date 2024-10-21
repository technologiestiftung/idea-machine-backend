setTimeout(async () => {
	const { bluetoothSerialMonitors } = await import(
		"./services/bluetooth/bluetooth.js"
	);
	const { server } = await import("./services/rest/rest.js");
	const { webSocketServer } = await import("./services/socket/socket.js");
	const { gpioProcess } = await import("./services/gpio/gpio.js");
	// await import("./services/print/print.js");
	await import("./services/browser/browser.js");

	process.on("SIGINT", () => closeEverything(1));

	process.on("SIGTERM", () => closeEverything(0));

	function closeEverything(eventId) {
		server.close();
		webSocketServer.clients.forEach((client) => client.close());
		webSocketServer.close();
		gpioProcess.kill();
		bluetoothSerialMonitors.forEach((monitor) => monitor.kill());

		process.exit(eventId);
	}
}, 10_000);
