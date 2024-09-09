import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import { usersRoutes } from "./routes/users";
import { mealsRoutes } from "./routes/meals";
import { metricRoutes } from "./routes/metrics";


export const app = fastify()

app.register(fastifyCookie)

app.register(usersRoutes, {
    prefix: "/users"
})

app.register(mealsRoutes, {
    prefix: "/meals"
})

app.register(metricRoutes, {
    prefix: "/metrics"
})