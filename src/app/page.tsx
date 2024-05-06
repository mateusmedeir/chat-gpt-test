"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const sendMessage = async () => {

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Uno 4 portas",
        }),
      });
      const result = await response.json();
      setText(result.choices[0].message.content);
    }

    sendMessage();
  }
  , []);

  return (
    <div>
      <p>{text}</p>
    </div>
  );
}
