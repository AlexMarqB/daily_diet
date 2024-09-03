import { FastifyInstance } from "fastify";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";
import { _knex } from "../database";
import { randomUUID } from "node:crypto";

export async function usersRoutes(app: FastifyInstance) {

    //Criar um usuário
    app.post("/",
        async (req, rep) => {
            
            const userSchema = z.object({
                name: z.string(),
                email: z.string().email()
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

    app.get("/", 
        async (req, rep) => {
            const users = await _knex("tb_users").select("*")

            return rep.status(200).send(users)
        })

    //login
    app.post('/login', 
        {
            preHandler: [checkSessionIdExists]
        },
        async (req, rep) => {
    
            const loginUserSchema = z.object({
                email: z.string().email()
            })
    
            const { email } = loginUserSchema.parse(req.body)
    
            const foundUser = await _knex("tb_users")
                .where({email})
                .first();
            
            if (!foundUser) {
                return rep.status(400).send("User not found!");
            }
    
            let { session_id } = req.cookies;
    
            if (!session_id) {
                session_id = randomUUID();
    
                rep.cookie("session_id", session_id, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7
                });
    
                await _knex("tb_users")
                    .where({ email })
                    .update({ session_id });
            }
    
            const userResponse = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                session_id: foundUser.session_id
            };
    
            return rep.status(201).send({ user: userResponse });
        }
    );
}