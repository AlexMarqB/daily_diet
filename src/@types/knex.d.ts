import { Knex } from "knex";

declare module 'knex/types/tables' {
    export interface Tables {
        tb_users: {
            id: number;
            name: string;
            email: string;
            session_id: string;
        },
        tb_meals: {
            id: number;
            name: string;
            user_id: number;
            description: string;
            made_at: Date;
            in_diet: boolean;
        }
    }
}