import { Knex } from "knex";

declare module 'knex/types/tables' {
    export interface Tables {
        tb_users: {
            name: string;
            email: string;
            session_id: string;
        },
        tb_meals: {
            id: number;
            session_id: string;
            name: string;
            user_id: number;
            description: string;
            made_at: string;
            in_diet: boolean;
        }
    }
}