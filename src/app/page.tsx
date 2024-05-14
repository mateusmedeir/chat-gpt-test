"use client";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { useState } from "react";
import { Send } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [text, setText] = useState<
    {
      user: {
        text: string;
      };
      model: {
        text: string;
      };
    }[]
  >([]);

  async function runChat(prompt: string) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const generationConfig = {
      temperature: 1,
      topK: 0,
      topP: 0.95,
      maxOutputTokens: 8192,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const history = text
      .map(({ user, model }) => {
        return [
          {
            role: "user",
            parts: [{ text: user.text }],
          },
          {
            role: "model",
            parts: [{ text: model.text }],
          },
        ];
      })
      .flat();

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ 
            text: 
            "Você é um especialista em marketing de mercado exterior, prestando um serviço para uma empresa de fora do Brasil que deseja exportar seu produto. Você precisa responder perguntas estruturadas para o seu cliente, como se fosse um relatório. A lista de perguntas segue a ordem abaixo numerada e o que está entre parênteses precisa ser respondido obrigatoriamente mas não necessariamente apenas isso\nSituação econômica atual do Brasil (dados de PIB, contexto global e territorial)\n2.Expectativas da economia para um período de um ano, dividido por trimestres(dados de inflação, expectativas para o futuro global e territorial)\nNecessário também que possua a fonte para cada resposta à pergunta\nResponda tudo isso numa estrutura discorrida, como se estivesse conversando, de forma formal, comigo"
           }],
        },
        {
          role: "model",
          parts: [{ text: "Perfeito, estou a sua disposição." }],
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(prompt);
    return result.response;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const prompt = new FormData(event.currentTarget).get("prompt") as string;
    const response = (await runChat(prompt)).text();
    setText((oldText) => [
      ...oldText,
      { user: { text: prompt }, model: { text: String(response) } },
    ]);
    setInput("");
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 p-4 bg-background/">
        <h1 className="text-xl font-semibold text-center">Market Monitor</h1>
      </div>
      <div className="container flex flex-1 pt-6">
        <div className="w-full min-h-full relative flex flex-col justify-between gap-12">
          <div className="flex flex-col gap-12 overflow-y-auto">
            {text.map(({ user, model }, index) => (
              <div key={index} className="flex flex-col gap-6 text-sm">
                <div className="flex flex-col gap-0.5 text-gray-400">
                  <p className="font-bold">Você</p>
                  <p>{user.text}</p>
                </div>
                <div className="flex flex-col gap-0.5 text-white">
                  <p className="font-bold">Bot</p>
                  <p>{model.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 pb-6 bg-background">
            <form
              onSubmit={onSubmit}
              className="flex px-3 items-center overflow-hidden w-full border rounded-full bg-background focus-within:ring-1 focus-within:ring-ring"
            >
              <Input
                name="prompt"
                value={input}
                autoComplete="off"
                onChange={(event) => setInput(event.target.value)}
                placeholder="Digite aqui sua mensagem"
                className="resize-none h-[52px] p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button className="bg-primary rounded-full" type="submit" size="icon" disabled={!input || isLoading}>
                {isLoading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
