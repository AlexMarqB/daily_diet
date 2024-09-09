import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import fs from "node:fs";
import { execSync } from "node:child_process";

const logSuccess = (message: string) => {
    console.log(`\x1b[32m\x1b[1m${message}\x1b[0m`); // Green and bold
};

describe("Meals routes test", () => {
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

	it("Should be able to create a meal and have the cookies set", async () => {
		const createUserResponse = await request(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		const logInUserByEmailResponse = await request(app.server)
			.post("/users/login")
			.send({
				email: "johndoe@example.com",
			});

		const cookies = logInUserByEmailResponse.headers["set-cookie"];

		expect(cookies).toBeDefined(); // Verifica se os cookies foram definidos

		const createMealResponse = await request(app.server)
			.post("/meals")
			.set("Cookie", cookies) // Passa os cookies na requisição
			.send({
				name: "Test Meal",
				description: "Testing a meal",
				made_at: new Date().toISOString(),
				in_diet: true,
			});

		expect(createMealResponse.status).toEqual(200);
	});

	it("Should be able to list all meals and get a specific meal by Id and update and delete it", async () => {
		const createUserResponse = await request(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		const logInUserByEmailResponse = await request(app.server)
			.post("/users/login")
			.send({
				email: "johndoe@example.com",
			});

		const cookies = logInUserByEmailResponse.headers["set-cookie"];

		const createMealResponse1 = await request(app.server)
			.post("/meals")
			.set("Cookie", cookies) // Passa os cookies na requisição
			.send({
				name: "Test Meal",
				description: "Testing a meal",
				made_at: new Date().toISOString(),
				in_diet: true,
			});

		const createMealResponse2 = await request(app.server)
			.post("/meals")
			.set("Cookie", cookies) // Passa os cookies na requisição
			.send({
				name: "Test Meal 2",
				description: "Testing a meal 2",
				made_at: new Date().toISOString(),
				in_diet: false,
			});

		const getAllMealsResponse = await request(app.server)
			.get("/meals/all")
			.set("Cookie", cookies);

		expect(getAllMealsResponse.status).toEqual(200);

		expect(getAllMealsResponse.body).toEqual([
			expect.objectContaining({
				name: "Test Meal",
				description: "Testing a meal",
				in_diet: true,
			}),
			expect.objectContaining({
				name: "Test Meal 2",
				description: "Testing a meal 2",
				in_diet: false,
			}),
		]);
        logSuccess("✔ It was able to get all meals");

		const getMealByIdResponse = await request(app.server)
			.get(`/meals/${getAllMealsResponse.body[0].id}`)
			.set("Cookie", cookies);

		expect(getMealByIdResponse.status).toEqual(200);

		expect(getAllMealsResponse.body).toEqual(
			expect.objectContaining({
				name: "Test Meal",
				description: "Testing a meal",
				in_diet: true,
			})
		);
        logSuccess("✔ It was able to get a specific meal");

		const updateMealResponse = await request(app.server)
			.put(`/meals/${getAllMealsResponse.body[0].id}`)
			.set("Cookie", cookies)
			.send({
				name: "Updated Test Meal",
				description: "Update Testing a meal",
				in_diet: false,
			});

		expect(updateMealResponse.status).toEqual(200);

		expect(updateMealResponse.body).toEqual(
			expect.objectContaining({
				name: "Updated Test Meal",
				description: "Update Testing a meal",
				in_diet: false,
			})
		);
        logSuccess("✔ It was able to update a meal");

		const deleteMealResponse = await request(app.server)
			.delete(`/meals/${getAllMealsResponse.body[1].id}`)
			.set("Cookie", cookies);

        expect(deleteMealResponse.status).toEqual(200);

        const getAllMealsUpdatedResponse = await request(app.server)
			.get("/meals/all")
			.set("Cookie", cookies);

        expect(getAllMealsUpdatedResponse.body).toEqual([
            expect.objectContaining({
				name: "Updated Test Meal",
				description: "Update Testing a meal",
				in_diet: false,
			})
        ]);
        logSuccess("✔ It was able to delete a meal");
	});
});
