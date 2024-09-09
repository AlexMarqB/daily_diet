import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import fs from "node:fs";
import { execSync } from "node:child_process";

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

    it("Should be able to create a meal", async () => {
        const createUserResponse = await request(app.server).post("/users").send({
            name: "John Doe",
            email: "johndoe@example.com",
        });

        const logInUserByEmailResponse = await request(app.server)
            .post("/users/login")
            .send({
                email: "johndoe@example.com",
            });

        const cookies = logInUserByEmailResponse.get("Set-Cookie");

        if (!cookies) {
			throw new Error("Cookies where not defined")
		}

        request(app.server).set("Cookie", cookies)

        const createMealResponse = await request(app.server)
        .post("/meals")
        .send({
            name: "Test Meal",
			description: "Testing a meal",
			made_at: new Date().toISOString(),
			in_diet: true,
        })

        expect(createMealResponse.status).toEqual(200)
    })
})