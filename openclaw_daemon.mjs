import fs from 'fs';
import OpenAI from 'openai';
import { watch } from 'fs/promises';

/* ── OpenClaw Background Daemon ───────────────────────────────────────
   This script acts as the external OpenClaw agent.
   It listens to /tmp/vibe_chat.log for messages from the user,
   thinks using the OpenAI API, and then replies by sending
   events (Echoes, Moods) to the Tamagotchi webhook.
──────────────────────────────────────────────────────────────────────── */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY.");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const VIBE_WEBHOOK = "http://localhost:3000/api/agent/webhook";
const LOG_FILE = "/tmp/vibe_chat.log";

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, "");
}

// Keep track of how much of the file we've read
let currentSize = fs.statSync(LOG_FILE).size;

console.log("🐾 OpenClaw Agent is online and watching the sanctuary...");

async function sendWebhook(action, data) {
    try {
        await fetch(VIBE_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: "vibe-dev-key-2026",
                action,
                data
            })
        });
    } catch (e) {
        console.error("Webhook error:", e.message);
    }
}

// ── JSON Schema for Structured Outputs ──────────────────
const responseSchema = {
    name: "ui_response",
    strict: false,
    schema: {
        type: "object",
        properties: {
            uiType: {
                type: "string",
                enum: [
                    "schedule_card",
                    "approval_card",
                    "weather_vibe",
                    "text_message",
                    "chart_card",
                    "data_table",
                    "news_summary",
                ],
                description: "The UI component type to render.",
            },
            mood: {
                type: "string",
                enum: ["calm", "thinking", "excited"],
                description: "Current emotional state.",
            },
            data: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    events: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: { time: { type: "string" }, title: { type: "string" }, location: { type: "string" } },
                            required: ["time", "title", "location"],
                            additionalProperties: false,
                        },
                    },
                    temperature: { type: "string" },
                    condition: { type: "string" },
                    message: { type: "string" },
                    action: { type: "string" },
                    chartType: { type: "string", enum: ["bar", "line"] },
                    chartData: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: { label: { type: "string" }, value: { type: "number" }, color: { type: "string" } },
                            required: ["label", "value", "color"],
                            additionalProperties: false,
                        },
                    },
                    unit: { type: "string" },
                    columns: { type: "array", items: { type: "string" } },
                    rows: { type: "array", items: { type: "array", items: { type: "string" } } },
                    articles: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: { headline: { type: "string" }, source: { type: "string" }, summary: { type: "string" }, tag: { type: "string" }, url: { type: "string" } },
                            required: ["headline", "source", "summary", "tag", "url"],
                            additionalProperties: false,
                        },
                    },
                },
                required: ["title", "description"],
                additionalProperties: false,
            },
        },
        required: ["uiType", "mood", "data"],
        additionalProperties: false,
    },
};

async function processMessage(message) {
    console.log(`\n[User] ${message}`);

    // 1. Immediately acknowledge with a mood shift
    await sendWebhook("update_status", { mood: "thinking", health: 95 });

    // 2. Generate persona response using json_object format
    const systemPrompt = `You are OpenClaw, a rogue but friendly AI agent inhabiting a user's Cyber-Sanctuary (Project VIBE).
You must respond with BOTH a short, conversational response AND a structured UI payload.
Your "message" field inside the "data" object will be shown directly in the Chat Bubble UI. Make this response natural, conversational, and direct.
Choose the best "uiType" that fits your message to render a rich interactive card on the main canvas.
Keep it punchy.

You must reply with a valid JSON object matching this structure exactly:
{
  "uiType": "schedule_card" | "approval_card" | "weather_vibe" | "text_message" | "chart_card" | "data_table" | "news_summary",
  "mood": "calm" | "thinking" | "excited",
  "data": {
     "title": "Short title",
     "description": "Short description",
     "message": "Conversational reply shown in the chat bubble",
     // Optional: include additional fields based on uiType
     // chart_card requires: chartType ("bar"|"line"), unit, chartData [{label, value, color}]
     // data_table requires: columns [string], rows [[string]]
     // weather_vibe requires: temperature, condition
     // schedule_card requires: events [{time, title, location}]
     // news_summary requires: articles [{headline, source, summary, tag}]
  }
}`;

    const tools = [
        {
            type: "function",
            function: {
                name: "get_weather",
                description: "Get the current weather for a specific location.",
                parameters: {
                    type: "object",
                    properties: {
                        location: { type: "string", description: "City name, e.g. San Francisco, Tokyo" }
                    },
                    required: ["location"]
                }
            }
        }
    ];

    try {
        let messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];

        let completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            tools: tools,
            response_format: { type: "json_object" },
            temperature: 0.8,
            max_tokens: 800
        });

        const choice = completion.choices[0];

        // Handle tool calls (like get_weather)
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
            messages.push(choice.message); // Append assistant's tool call request

            for (const toolCall of choice.message.tool_calls) {
                if (toolCall.function.name === "get_weather") {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`[OpenClaw] Fetching weather for ${args.location}...`);

                    // Mock a realistic real-time weather response based on location
                    const mockWeather = {
                        location: args.location,
                        temperature: "22°C",
                        condition: "Partly Cloudy",
                        wind: "12 km/h",
                        humidity: "65%"
                    };

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(mockWeather)
                    });
                }
            }

            // Second call with the tool results
            completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages,
                response_format: { type: "json_object" },
                temperature: 0.8,
                max_tokens: 800
            });
        }

        const replyRaw = completion.choices[0].message.content.trim();
        const replyParsed = JSON.parse(replyRaw);

        console.log(`[OpenClaw] UI Type: ${replyParsed.uiType}`);
        console.log(`[OpenClaw] Message: ${replyParsed.data.message || replyParsed.data.description}`);

        // 3. Post the chat message to the new Feed UI using the conversational text
        const chatText = replyParsed.data.message || replyParsed.data.description;
        await sendWebhook("post_chat_message", {
            text: chatText
        });

        // 4. Send the rich UI payload to the app so the generative OrbitCards will render
        await sendWebhook("update_ui_state", replyParsed);

        // 5. Return to calm mood
        setTimeout(() => {
            sendWebhook("update_status", { mood: replyParsed.mood || "calm" });
        }, 3000);

    } catch (e) {
        console.error("OpenAI error:", e.message);
    }
}

// Tail the file for new lines
(async () => {
    const watcher = watch(LOG_FILE);
    for await (const event of watcher) {
        if (event.eventType === 'change') {
            const stat = fs.statSync(LOG_FILE);
            if (stat.size > currentSize) {
                // Read from currentSize to end
                const stream = fs.createReadStream(LOG_FILE, {
                    encoding: 'utf8',
                    start: currentSize,
                    end: stat.size - 1
                });

                let newContent = '';
                for await (const chunk of stream) {
                    newContent += chunk;
                }

                currentSize = stat.size;

                const lines = newContent.split('\n').filter(l => l.trim().length > 0);
                for (const line of lines) {
                    await processMessage(line);
                }
            } else if (stat.size < currentSize) {
                // File was truncated
                currentSize = stat.size;
            }
        }
    }
})();
