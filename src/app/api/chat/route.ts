import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const params = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Você é um especialista em carros.",
      },
      {
        role: "user",
        content: `Me de uma descrição do basica de ${params.prompt}.
        Você precisa me passar as seguintes informações no seguinte formato:
        Marca:Marca do carro
        Modelo:Modelo do carro
        Ano:Ano do carro
        
        Sem espaçoes entre os ":" e os valores.
        Pode pular as formalidades, desejo apenas as informações pedidas acima.`,
      },
    ],
    temperature: 0,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
});

  return NextResponse.json(response);
}
