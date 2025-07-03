export async function generateSummary(messages) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const url = "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "Ты — помощник, делающий краткое резюме чата.",
          },
          {
            role: "user",
            content: `Сделай краткое резюме следующего чата:\n${messages.join("\n")}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API Error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Нет ответа";
  } catch (error) {
    console.error("Ошибка при запросе к Groq API:", error);
    throw error;
  }
}
