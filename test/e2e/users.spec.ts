import { afterAll, beforeAll, describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { execSync } from "node:child_process";
import fs from "node:fs";

describe("User routes tests", () => {
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

	it("Should be able to create an user", async () => {
		const createUserResponse = await request(app.server).post("/users").send({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		expect(createUserResponse.status).toEqual(201);
	});

	it("Should be able to get an User by email and allow a user to log in with the email and generate a session_id cookie", async () => {
		const createUserResponse = await request(app.server).post("/users").send({
            name: "John Doe",
            email: "johndoe@example.com",
        });
    
        expect(createUserResponse.status).toEqual(201);

        const getUserByEmailResponse = await request(app.server) 
        .get("/users/johndoe@example.com")

        expect(getUserByEmailResponse.status).toEqual(200)

        expect(getUserByEmailResponse.body).toEqual(
            expect.objectContaining({
                name: "John Doe",
                email: "johndoe@example.com",
            })
        );
    
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
    
        const cookies = logInUserByEmailResponse.get("Set-Cookie");

        expect(cookies).toBeDefined()
	});
});
