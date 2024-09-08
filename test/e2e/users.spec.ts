import { afterAll, beforeAll, describe, expect, it, beforeEach } from 'vitest'
import request from "supertest";
import { app } from '../../src/app'
import { execSync } from 'node:child_process'

describe("User routes tests", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it("Should be able to create an user", async () => {
        const createUserResponse = await request(app.server)
        .post("/users")
        .send({
            name: "John Doe",
            email: "johndoe@example.com"
        })

        expect(createUserResponse.status).toEqual(201)
    })

    it("Should be able to list all users and get an user by ID", async () => {
        const createUserResponse = await request(app.server)
        .post("/users")
        .send({
            name: "John Doe",
            email: "johndoe@example.com"
        })

        expect(createUserResponse.status).toEqual(201)

        const getAllUsersResponse = await request(app.server)
        .get("users/all")

        expect(getAllUsersResponse.body).toEqual([
            expect.objectContaining({
                name: "John Doe",
                email: "johndoe@example.com"
            })
        ])

        const { id } = getAllUsersResponse.body[0]

        const getUserByIdResponse = await request(app.server)
        .get(`/users/${id}`)

        expect(getUserByIdResponse.status).toEqual(200)

        expect(getUserByIdResponse.body).toEqual(
            expect.objectContaining({
                name: "John Doe",
                email: "johndoe@example.com"
            })
        )
    })
})