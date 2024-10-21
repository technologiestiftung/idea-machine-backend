import { getLabels, setLabels } from "../../../state/state.js";

const port = process.env.API_PORT;

/**
 * Handles the labels endpoint
 * @param request
 * @param body
 * @param response
 */
export function handleLabels({ request, body, response }) {
	switch (request.method) {
		case "GET":
			handleGetLabels(response);
			break;
		case "PUT":
			handlePutLabels({ body, response });
			break;
		default:
			response.statusCode = 405;
			response.end();
	}
}

/**
 * Returns the labels from state
 * @param response
 */
function handleGetLabels(response) {
	response.end(JSON.stringify({ labels: getLabels() }));
}

/**
 * Updates the labels in state
 * @param body
 * @param response
 */
function handlePutLabels({ body, response }) {
	const requestBody = Buffer.concat(body).toString();
	const newLabels = JSON.parse(requestBody).labels;

	setLabels(newLabels);

	response.end(JSON.stringify({ message: "success" }));

	/**
	 * start pregeneration in the background
	 */
	fetch(`http://localhost:${port}/pregenerate`).catch(console.error);
}
