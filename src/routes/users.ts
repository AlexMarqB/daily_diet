import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";
import { _knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {

    //Criar um usuário
    app.post("/",
        async (req, rep) => {
            
            const userSchema = z.object({
                name: z.string(),
                email: z.string()
            })

            const newUser = userSchema.safeParse(req.body)

            if(!newUser.success)  {
                return rep.status(400).send(`Invalid data! ${newUser.error.format}`)
            }

            const {name, email} = newUser.data

            await _knex("tb_users").insert({
                name,
                email
            })

            return rep.status(201).send();
        }
    )

    //Buscar um usuário pelo ID

    app.get("/:id",
        async (req, rep) => {

            const getUserParamsSchema = z.object({
                id: z.coerce.number()
            })

            const { id } = getUserParamsSchema.parse(req.params)

            const foundUser = await _knex("tb_users")
            .where({id})
            .first()

            if(!foundUser) {
                return rep.status(400).send("User not found!")
            }

            return rep.status(200).send(foundUser)
        }
    )
}