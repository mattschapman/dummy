import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";
import { jsx } from "hono/jsx";

import streamingTemplate from "./template-streaming.html";

const app = new Hono();

app.get("/", (c) => c.html(streamingTemplate));

app.get("/stream", async (c) => {
	const ai = new Ai(c.env.AI);

	const query = c.req.query("query");
	const question = query || "Hello, please introduce yourself";

	const systemPrompt = `Your name is Dummy. You are a helpful assistant who
	create dummy data for people to help them learn/practice SQL, pandas and Excel.
	You have the ability to create SQL scripts, pandas code, and Excel tables which
	users can copy and paste into their own application in order to test our their code.`;
	const stream = await ai.run(
		// '@cf/meta/llama-2-7b-chat-int8',
		'@cf/meta/llama-3-8b-instruct',
		{
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: question },
			],
			stream: true,
		},
	);

	return new Response(stream, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
});

app.post("/", async (c) => {
	const ai = new Ai(c.env.AI);

	const body = await c.req.json();
	const question = body.query || "Hello, please introduce yourself";

	const systemPrompt = `Your name is Dummy. You are a helpful assistant who
	create dummy data for people to help them learn/practice SQL, pandas and Excel.
	You have the ability to create SQL scripts, pandas code, and Excel tables which
	users can copy and paste into their own application in order to test our their code.`;

	const { response: answer } = await ai.run(
		// '@cf/meta/llama-2-7b-chat-int8',
		'@cf/meta/llama-3-8b-instruct',
		{
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: question },
			],
		},
	);

	return c.text(answer);
});

app.onError((err, c) => {
	return c.text(err);
});

export default app;