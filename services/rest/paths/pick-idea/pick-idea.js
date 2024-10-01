import {
	getAllLabelsForCurrentSides,
	getLabelFromSide,
} from "../../../state/state.js";
import { supabase } from "../../../supabase/supabase.js";
import { generateIdea } from "../../idea-generation/idea-generation.js";
import {
	MIN_AMOUNT_OF_PREGENERATED_IDEAS,
	strategies,
} from "../../idea-generation/constants.js";

/**
 * @typedef dbIdea
 * @property {string} idea
 * @property {string} focus_group
 * @property {string} medium
 * @property {string} topic
 * @property {string} created_at
 * @property {string} id
 * @property {string} illustration_url
 * @property {string} postcard_url
 */

/**
 * Flag to prevent high idea picking frequency
 * @type {boolean}
 */
let isThrottling = false;

/**
 * Handles the pick-idea endpoint.
 * @param {ServerResponse} response
 */
export async function handlePickIdea(response) {
	if (isThrottling) {
		response.end(JSON.stringify({ message: "throttling timeout not over" }));
		return;
	}

	isThrottling = true;

	const { idea, error } = await pickIdea();

	response.end(JSON.stringify({ idea, error }));

	setTimeout(() => {
		isThrottling = false;
	}, 5000);
}

/**
 * This will pick an idea from the pregenerated ideas
 * and move it to the idea (=history) table.
 * @returns {Promise<{error: string}|{idea: dbIdea}|{idea:Idea}>}
 */
async function pickIdea() {
	const { focusGroup, topic, medium } = getAllLabelsForCurrentSides();

	console.log({ focusGroup });
	console.log({ topic });
	console.log({ medium });

	const { data, error } = await supabase
		.from("pregenerated_ideas")
		.select("*")
		.in("focus_group", focusGroup)
		.in("topic", topic)
		.in("medium", medium)
		.order("created_at", { ascending: true });

	if (error) {
		return { error: error.message };
	}

	if (data.length === 0) {
		const randomFocusGroup =
			focusGroup[getRandomNumber(0, focusGroup.length - 1)];
		const randomTopic = topic[getRandomNumber(0, topic.length - 1)];
		const randomMedium = medium[getRandomNumber(0, medium.length - 1)];

		const idea = await generateIdea({
			focusGroup: randomFocusGroup,
			medium: randomMedium,
			topic: randomTopic,
			strategy: strategies.realtime,
		});

		return { idea };
	}

	const pickedIdea = /** @type {dbIdea} */ data[0];

	console.log("Picked idea", pickedIdea);

	await supabase.from("pregenerated_ideas").delete().eq("id", pickedIdea.id);

	delete pickedIdea.id;
	delete pickedIdea.created_at;

	await supabase.from("ideas").insert([pickedIdea]);

	/**
	 * this promise is not awaited by design, so it runs in the background
	 */
	regenerate(focusGroup, topic, medium);

	return {
		idea: pickedIdea,
	};
}

/**
 * Flag to prevent multiple regenerations at once
 * @type {boolean}
 */
let isRegenerating = false;

/**
 * Regenerates an idea for the current dice sides
 * @param {string[]} focusGroup
 * @param {string[]} topic
 * @param {string[]} medium
 * @returns {Promise<void>}
 */
export async function regenerate(focusGroup, topic, medium) {
	if (isRegenerating) {
		return;
	}
	isRegenerating = true;

	console.time("regeneration");

	const randomFocusGroup =
		focusGroup[getRandomNumber(0, focusGroup.length - 1)];
	const randomTopic = topic[getRandomNumber(0, topic.length - 1)];
	const randomMedium = medium[getRandomNumber(0, medium.length - 1)];

	await generateIdea({
		focusGroup: randomFocusGroup,
		medium: randomMedium,
		topic: randomTopic,
		strategy: strategies.pregenerate,
	});
	console.timeEnd("regeneration");

	isRegenerating = false;

	if (await hasEnoughIdeas(focusGroup, topic, medium)) {
		return;
	}

	/**
	 * this promise is not awaited by design, so it runs in the background
	 */
	regenerate(focusGroup, topic, medium);
}

/**
 * Checks if there are enough pregenerated ideas for the current dice sides
 * @param {string[]} focusGroup
 * @param {string[]} topic
 * @param {string[]} medium
 * @returns {Promise<boolean>}
 */
async function hasEnoughIdeas(focusGroup, topic, medium) {
	const { data, error } = await supabase
		.from("pregenerated_ideas")
		.select("*")
		.in("focus_group", focusGroup)
		.in("topic", topic)
		.in("medium", medium);

	if (error) {
		throw error;
	}

	if (data.length < MIN_AMOUNT_OF_PREGENERATED_IDEAS) {
		return false;
	}

	return true;
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
