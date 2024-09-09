import { FastifyReply, FastifyRequest } from "fastify";

//Será utilizado em diversas rotas então geramos um middleware
export async function checkSessionIdExists(req: FastifyRequest, rep: FastifyReply) {
	const session_id = req.cookies.session_id;

	if (!session_id) {
		return rep.status(401).send({ success: false, message: "Unauthorized" });
	}
}