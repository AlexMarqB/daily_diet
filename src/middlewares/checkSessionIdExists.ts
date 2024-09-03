import { FastifyReply, FastifyRequest } from "fastify";

//Será utilizado em diversas rotas então geramos um middleware
export async function checkSessionIdExists(req: FastifyRequest, rep: FastifyReply) {
	const sessionId = req.cookies.sessionId;

	if (!sessionId) {
		return rep.status(401).send({ success: false, message: "Unauthorized" });
	}
}