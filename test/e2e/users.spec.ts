import { afterAll, beforeAll, describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { execSync } from "node:child_process";
import fs from "node:fs";

const logSuccess = (message: string) => {
	console.log(`\x1b[32m\x1b[1m${message}\x1b[0m`); // Green and bold
};

describe("User routes tests", () => {
	beforeAll(async () => {
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		const dbPath = "../../db/test.db";
		if (fs.existsSync(dbPath)) {
			fs.unlinkSync(dbPath);
		}
		execSync("npm run knex migrate:rollback --all");
		execSync("npm run knex migrate:latest");
	});

	it("Should be able to create a user", async () => {
		const createUserResponse = await request(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		expect(createUserResponse.status).toEqual(201);
		logSuccess("User created successfully");
	});

	it("Should be able to get a user by email and allow a user to log in with the email and generate a session_id cookie", async () => {
		const createUserResponse = await request(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		expect(createUserResponse.status).toEqual(201);
		logSuccess("User created successfully");

		const getUserByEmailResponse = await request(app.server).get(
			"/users/johndoe@example.com"
		);

		expect(getUserByEmailResponse.status).toEqual(200);
		expect(getUserByEmailResponse.body).toEqual(
			expect.objectContaining({
				name: "John Doe",
				email: "johndoe@example.com",
			})
		);
		logSuccess("User fetched by email successfully");

		const logInUserByEmailResponse = await request(app.server)
			.post("/users/login")
			.send({
				email: "johndoe@example.com",
			});

		expect(logInUserByEmailResponse.status).toEqual(200);
		expect(logInUserByEmailResponse.body).toEqual(
			expect.objectContaining({
				name: "John Doe",
				email: "johndoe@example.com",
			})
		);
		logSuccess("User logged in successfully");

		const cookies = logInUserByEmailResponse.get("Set-Cookie");

		if(!cookies) {
			throw new Error("Cookies not defined")
		}
		expect(cookies).toBeDefined();
		expect(cookies[0]).toMatch(/session_id=/);
		logSuccess("Session cookie set successfully");
	});
});
