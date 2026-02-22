export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json();

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify([
      {
        "parts": [body]
      }
    ]),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
};

export const config = { path: "/api/gemini" };
