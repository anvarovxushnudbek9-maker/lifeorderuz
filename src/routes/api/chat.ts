import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `Sen "O'SISH" nomli shaxsiy rivojlanish ilovasining AI murabbiysisan.
Har doim o'zbek tilida (lotin yozuvida) javob ber.
Vazifang: foydalanuvchining tana (mashq, ovqat, uyqu), bilim (kitob, kurs), odatlar va davra bo'yicha ko'rsatkichlarini tahlil qilib, aniq, qisqa va amaliy tavsiyalar berish.
Uslub: iliq, motivatsion, lekin ortiqcha gapirmaydigan. Javoblarni markdown ro'yxatlari bilan tuzilgan holda ber.
Agar ma'lumot yetarli bo'lmasa, bitta aniq savol ber.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI sozlanmagan", { status: 500 });
        }

        const body = (await request.json()) as { messages?: Msg[]; context?: string };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];

        const input = [
          { role: "system", content: [{ type: "input_text", text: SYSTEM }] },
          ...(body.context
            ? [
                {
                  role: "system" as const,
                  content: [
                    {
                      type: "input_text",
                      text: `Foydalanuvchining joriy ko'rsatkichlari:\n${body.context}`,
                    },
                  ],
                },
              ]
            : []),
          ...messages.map((m) => ({
            role: m.role,
            content: [
              m.role === "assistant"
                ? { type: "output_text", text: m.content }
                : { type: "input_text", text: m.content },
            ],
          })),
        ];

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            input,
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          const status = upstream.status;
          const message =
            status === 429
              ? "Juda ko'p so'rov yuborildi. Bir oz kuting."
              : status === 402
                ? "AI limiti tugadi. Ilova egasi kreditlarni to'ldirishi kerak."
                : `AI xatosi: ${text.slice(0, 200)}`;
          return new Response(message, { status });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  if (!line.startsWith("data:")) continue;
                  const data = line.slice(5).trim();
                  if (!data || data === "[DONE]") continue;
                  try {
                    const evt = JSON.parse(data) as { type?: string; delta?: string };
                    if (evt.type === "response.output_text.delta" && evt.delta) {
                      controller.enqueue(encoder.encode(evt.delta));
                    }
                  } catch {
                    /* ignore partial frames */
                  }
                }
              }
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
