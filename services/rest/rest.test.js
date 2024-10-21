import { describe, it, after } from "node:test";
import assert from "node:assert";
import server from "./rest.js";
import { getLabels, setLabels } from "../state/state.js";

describe("services/rest", () => {
	after(() => server.close());

	describe("OPTION *", () => {
		it("should return a 204 status code and correct headers", async () => {
			const response = await fetch("http://localhost:8000/", {
				method: "OPTIONS",
			});

			assert.strictEqual(response.status, 204);
			assert.strictEqual(
				response.headers.get("Access-Control-Allow-Origin"),
				"*",
			);
			assert.strictEqual(
				response.headers.get("Access-Control-Allow-Methods"),
				"OPTIONS, PUT, GET",
			);
		});
	});

	describe("GET /", () => {
		it("should return a 200 status code and a correct json", async () => {
			const response = await fetch("http://localhost:8000/");

			const actual = await response.json();
			const expected = { message: "ok" };

			assert.strictEqual(response.status, 200);
			assert.deepStrictEqual(actual, expected);
		});
	});

	describe("GET /labels", () => {
		it("should return the current labels", async () => {
			const response = await fetch("http://localhost:8000/labels");

			const actual = await response.json();
			const expected = { labels: getLabels() };

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe("PUT /labels", () => {
		it("should update the current labels", async (t) => {
			const currentLabels = getLabels();
			const givenLabels = { ...currentLabels, A1: "some other label" };

			const promise = fetch("http://localhost:8000/labels", {
				method: "PUT",
				body: JSON.stringify({ labels: givenLabels }),
			});

			t.mock.method(global, "fetch");
			fetch.mock.mockImplementationOnce(async () => ({
				json: () => Promise.resolve({ message: "success" }),
			}));

			const response = await promise;

			const actualResponse = await response.json();
			const expectedResponse = { message: "success" };

			const actualLabels = getLabels();
			const expectedLabels = givenLabels;
			const expectedFetchUrl = `http://localhost:${process.env.API_PORT}/pregenerate`;

			assert.deepStrictEqual(actualResponse, expectedResponse);
			assert.deepStrictEqual(actualLabels, expectedLabels);
			assert.strictEqual(fetch.mock.calls[0].arguments[0], expectedFetchUrl);

			// reset labels
			setLabels(currentLabels);
		});
	});

	describe("* /labels", () => {
		it("should return 405 status code for unsupported method", async () => {
			const response = await fetch("http://localhost:8000/labels", {
				method: "POST",
			});

			assert.strictEqual(response.status, 405);
		});
	});

	describe.todo("GET /print", () => {});

	describe.todo("GET /shutdown", () => {});
});
