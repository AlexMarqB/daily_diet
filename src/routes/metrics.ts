import { FastifyInstance } from "fastify";
import { z } from "zod";
import { _knex } from "../database";
import { checkSessionIdExists } from "../middlewares/checkSessionIdExists";

export async function metricRoutes(app: FastifyInstance) {
	app.get("/", { preHandler: [checkSessionIdExists] }, async (req, rep) => {
		const { session_id } = req.cookies;

		const allCreatedMealsBySessionId = await _knex
			.select()
			.where({ session_id });

		const bestInDietSequence = () => {
			let maxSequence = 0;
			let currentSequence = 0;

			for (let i = 0; i < allCreatedMealsBySessionId.length; i++) {
				let meal = allCreatedMealsBySessionId[i];
				let nextMeal = allCreatedMealsBySessionId[i + 1];

				if (meal.in_diet) {
					currentSequence++;
					// Se o próximo item também estiver na dieta, continue contando.
					if (nextMeal && nextMeal.in_diet) {
						continue;
					}
				} else {
					currentSequence = 0;
				}

				// Atualize a maior sequência encontrada.
				if (currentSequence > maxSequence) {
					maxSequence = currentSequence;
				}
			}

			return maxSequence;
		};

		const metrics = {
			totalMeals: allCreatedMealsBySessionId.length,
			totalMealsInDiet: allCreatedMealsBySessionId.filter(
				(item) => item.in_diet
			).length,
			totalMealsOutDiet: allCreatedMealsBySessionId.filter(
				(item) => !item.in_diet
			).length,
			bestInDietSequence,
		};

		return rep.status(200).send(metrics);
	});
}
