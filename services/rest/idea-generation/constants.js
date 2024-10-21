export const ILLUSTRATION_FILE_PATH =
	"./services/rest/idea-generation/postcard/img/illustration.png";
export const HTML_FILE_PATH =
	"./services/rest/idea-generation/postcard/postcard.html";
export const PDF_FILE_PATH =
	"./services/rest/idea-generation/postcard/postcard.pdf";

/**
 * @enum {string}
 */
export const strategies = {
	realtime: "realtime",
	pregenerate: "pregenerate",
};

/**
 * The amount of pregenerated ideas that need to be generated in advance.
 * @type {number}
 */
export const MIN_AMOUNT_OF_PREGENERATED_IDEAS = 1;
