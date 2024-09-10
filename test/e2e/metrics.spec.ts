import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { execSync } from "node:child_process";
import fs from "node:fs";

const logSuccess = (message: string) => {
	console.log(`\x1b[32m\x1b[1m${message}\x1b[0m`); // Green and bold
};

describe("Metric routes tests", () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		if (fs.existsSync("../../db/test.db")) {
			fs.unlinkSync("../../db/test.db");
		}
		execSync("npm run knex migrate:rollback --all");
		execSync("npm run knex migrate:latest");
	});

	it("Should be able to get metrics for meals by session_id", async () => {
		// Create a user
		await request(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		// Log in the user to get a session_id
		const logInResponse = await request(app.server).post("/users/login").send({
			email: "johndoe@example.com",
		});

        const cookies = logInResponse.headers["set-cookie"];

		const meals = [
			{ name: "Meal 1", description: "Testing meal 1", made_at: new Date().toISOString(), in_diet: true },
			{ name: "Meal 2", description: "Testing meal 2", made_at: new Date().toISOString(), in_diet: false },
			{ name: "Meal 3", description: "Testing meal 3", made_at: new Date().toISOString(), in_diet: true },
			{ name: "Meal 4", description: "Testing meal 4", made_at: new Date().toISOString(), in_diet: true },
			{ name: "Meal 5", description: "Testing meal 5", made_at: new Date().toISOString(), in_diet: false },
			{ name: "Meal 6", description: "Testing meal 6", made_at: new Date().toISOString(), in_diet: true },
			{ name: "Meal 7", description: "Testing meal 7", made_at: new Date().toISOString(), in_diet: true },
			{ name: "Meal 8", description: "Testing meal 8", made_at: new Date().toISOString(), in_diet: false },
			{ name: "Meal 9", description: "Testing meal 9", made_at: new Date().toISOString(), in_diet: true },
			{ name: "Meal 10", description: "Testing meal 10", made_at: new Date().toISOString(), in_diet: true },
		];

		for (const meal of meals) {
			await request(app.server)
				.post("/meals")
				.set("Cookie", cookies)
				.send(meal);
		}

		// Get metrics
		const metricsResponse = await request(app.server)
			.get("/metrics")
			.set("Cookie", cookies);

		const expectedMetrics = {
			totalMeals: 10,
			totalMealsInDiet: 7, // Meals 1, 3, 4, 6, 7, 9, 10
			totalMealsOutDiet: 3, // Meals 2, 5, 8
			bestInDietSequence: 3, // Longest sequence of in_diet is 3 (Meals 4, 6, 7)
		};

		expect(metricsResponse.status).toEqual(200);
		expect(metricsResponse.body).toEqual(expectedMetrics);

		logSuccess("Metrics fetched successfully with accurate values");
	});
});

