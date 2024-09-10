import { FastifyInstance } from "fastify";
import { z } from "zod";

import { _knex } from "../database";
import { randomUUID } from "node:crypto";

export async function usersRoutes(app: FastifyInstance) {
	//Criar um usuário
	app.post("/", async (req, rep) => {
		const userSchema = z.object({
			name: z.string(),
			email: z.string().email(),
		});

		const newUser = userSchema.safeParse(req.body);

		if (!newUser.success) {
			return rep.status(400).send(`Invalid data! ${newUser.error.format}`);
		}

		const { name, email } = newUser.data;

		await _knex("tb_users").insert({
			name,
			email,
		});

		return rep.status(201).send();
	});

	//Buscar um usuário pelo email
	app.get("/:email", async (req, rep) => {
		const getUserParamsSchema = z.object({
			email: z.string().email()
		});

		const { email } = getUserParamsSchema.parse(req.params);

		const foundUser = await _knex("tb_users").where({ email }).first();

		if (!foundUser) {
			return rep.status(400).send("User not found!");
		}

		return rep.status(200).send(foundUser);
	});

	app.post("/login", async (req, rep) => {
		const loginUserSchema = z.object({
			email: z.string().email(),
		});

		const { email } = loginUserSchema.parse(req.body);

		const { session_id } = req.cookies;

		const foundUser = await _knex("tb_users").where({ email }).first();

		if (!foundUser) {
			return rep.status(400).send("User not found!");
		}

		if (!session_id) {

			const newSessionId = randomUUID();
			rep.cookie("session_id", newSessionId, {
				path: "/",
				maxAge: 60 * 60 * 24 * 7 //7 dias
			});

			await _knex("tb_users")
			.where(foundUser)
			.update({session_id:newSessionId})


			const userResponse = {
				name: foundUser.name,
				email: foundUser.email,
			};

			return rep.status(200).send(userResponse);
		}

		rep.cookie("session_id", session_id, {
			path: "/",
			maxAge: 60 * 60 * 24 * 7 // 7 dias
		});

		const userResponse = {
			name: foundUser.name,
			email: foundUser.email,
		};

		return rep.status(200).send(userResponse);
	});
}
