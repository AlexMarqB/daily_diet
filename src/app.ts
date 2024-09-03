import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";


export const app = fastify()

app.register(fastifyCookie)