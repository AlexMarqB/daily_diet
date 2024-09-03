import { config } from "dotenv"
import { z } from "zod"

if(process.env.NODE_ENV === 'test') {
    config({path: '.env.test'})
} else {
    config()
}

const envSchema = z.object({
    NODE_ENV: z.enum(["dev", " test", "production"]).default("production"),
    DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
    DATABASE_URL: z.string()
})

export const _env = envSchema.safeParse(process.env)

if(_env.success == false) {
    console.log("Invalid environment variable", _env.error.format)

    throw new Error("Invalid enviroment variable")
}

export const env = _env.data;