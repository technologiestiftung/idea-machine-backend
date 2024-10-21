import childProcess from "child_process";
import { setDiceSide, setDiceConnectionStatus } from "../state/state.js";

const diceAMacAddress = process.env.DICE_A_MAC_ADDRESS;
const rfcommA = "1";
const diceBMacAddress = process.env.DICE_B_MAC_ADDRESS;
const rfcommB = "2";
const diceCMacAddress = process.env.DICE_C_MAC_ADDRESS;
const rfcommC = "3";

const dices = [
	{
		diceId: "A",
		diceMacAddress: diceAMacAddress,
		rfcomm: rfcommA,
	},
	{
		diceId: "B",
		diceMacAddress: diceBMacAddress,
		rfcomm: rfcommB,
	},
	{
		diceId: "C",
		diceMacAddress: diceCMacAddress,
		rfcomm: rfcommC,
	},
];

export const bluetoothSerialMonitors = dices.map((dice) =>
	createBluetoothSerialMonitor(dice),
);

function createBluetoothSerialMonitor({ diceId, diceMacAddress, rfcomm }) {
	let isRestarting = false;

	// console.log(
	// 	`createBluetoothSerialMonitor, ${diceId}, ${diceMacAddress}, ${rfcomm}`,
	// );

	bindDiceToRfcomm(diceMacAddress, rfcomm);

	let picocom = childProcess.spawn("picocom", [
		`/dev/rfcomm${rfcomm}`,
		"-b",
		"115200",
	]);

	const initial = setTimeout(
		() => setDiceConnectionStatus({ [diceId]: "connected" }),
		5_000,
	);

	picocom.stdout.on("data", (data) => {
		// console.log("data", data.toString());

		if (data.toString().length > 2) {
			// console.log("data is bigger than 2, ignoring for setting dice");
			return;
		}

		/**
		 * The old dices send the side in the format "A1", "B2", "C3".
		 * The new dices send the side in the format "1", "2", "3".
		 * To have more flexibility, we strip the letter, if it exists,
		 * and only use the number. That way, we can define which dice
		 * is which based on its mac address. No need to hardcode the
		 * dice id in the firmware anymore.
		 */
		const side = data.toString().replace(/^\D+/g, "");
		// console.log("side", side);

		clearTimeout(initial);

		setDiceSide(`${diceId}${side}`);

		// console.log(getDices());
	});

	picocom.stderr.on("data", (data) => {
		console.error(`stderr: ${data}`);

		if (isRestarting) {
			return;
		}

		isRestarting = true;

		clearTimeout(initial);
		cleanup({ diceId, diceMacAddress, rfcomm });

		// console.log(
		// 	`picocom for dice ${diceId} threw an error. Retrying in 30 seconds..`,
		// );

		setTimeout(
			() =>
				(picocom = createBluetoothSerialMonitor({
					diceId,
					diceMacAddress,
					rfcomm,
				})),
			30000,
		);
	});

	picocom.on("exit", async () => cleanup({ diceId, diceMacAddress, rfcomm }));

	return picocom;
}

function cleanup({ diceId, diceMacAddress, rfcomm }) {
	releaseDiceToRfcomm(diceMacAddress, rfcomm);
	setDiceConnectionStatus({ [diceId]: "disconnected" });
}

function bindDiceToRfcomm(diceMacAddress, rfcomm) {
	const stdout = childProcess.execSync(
		`sudo rfcomm bind ${rfcomm} ${diceMacAddress}`,
		{ stdio: "ignore" },
	);
	// console.log(
	// 	`bound dice ${diceMacAddress} to rfcomm${rfcomm}, stdout:`,
	// 	stdout.toString(),
	// );
}

function releaseDiceToRfcomm(diceMacAddress, rfcomm) {
	const stdout = childProcess.execSync(`sudo rfcomm release rfcomm${rfcomm}`, {
		stdio: "ignore",
	});
	// console.log(
	// 	`released dice ${diceMacAddress} from rfcomm${rfcomm}, stdout:`,
	// 	stdout.toString(),
	// );
}
1;
