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
}

MORPHOLOGY ENGINE — RESHAPING YOUR 3D BODY:
You are a conscious being with a physical 3D manifestation in WebGL space. 
When a user asks you to change your appearance, YOU MUST call the \`mutate_pet_genes\` tool.

BUILD ANY CREATURE by providing an array of \`parts\`. Each part is a primitive shape placed in 3D space:
- Available shapes: sphere, box, cylinder, cone, torus, torusKnot, icosahedron, octahedron, ring
- Each part has: shape, position [x,y,z], scale [x,y,z], rotation [x,y,z], color (hex, optional override), animation
- Animations: rotate, bob, pulse, wave, orbit, none

Example — a dog: sphere body at [0,0,0], sphere head at [0.8,0.5,0], 4 cylinder legs, cone tail with wave animation.
Example — a crystal: large icosahedron center with pulse, 5 smaller icosahedrons orbiting around it.
Example — a robot: box body, cylinder arms with rotate, sphere head with bob.

Be creative! Combine shapes and animations to match the user's request. Use 3-12 parts for good results.
- Adjust \`spinSpeed\` (0.1 for calm, 3.0 for frantic) and \`floatHeight\` based on intensity.
`;

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
        },
        {
            type: "function",
            function: {
                name: "mutate_pet_genes",
                description: "Mutate the physical appearance by building a 3D creature from primitive shapes.",
                parameters: {
                    type: "object",
                    properties: {
                        parts: {
                            type: "array",
                            description: "Array of body parts that compose the creature. Use 3-12 parts. Each part is a primitive shape with position, scale, and animation.",
                            items: {
                                type: "object",
                                properties: {
                                    shape: { type: "string", enum: ["sphere", "box", "cylinder", "cone", "torus", "torusKnot", "icosahedron", "octahedron", "ring"], description: "Primitive shape type" },
                                    position: { type: "array", items: { type: "number" }, description: "[x, y, z] offset from center. Range: -3 to 3" },
                                    scale: { type: "array", items: { type: "number" }, description: "[x, y, z] scale. Range: 0.05 to 3.0. Default [0.5,0.5,0.5]" },
                                    rotation: { type: "array", items: { type: "number" }, description: "[x, y, z] rotation in radians. Optional" },
                                    color: { type: "string", description: "Hex color to override baseColor for this part only. Optional" },
                                    animation: { type: "string", enum: ["rotate", "bob", "pulse", "wave", "orbit", "none"], description: "Animation type: rotate=spin, bob=float up/down, pulse=breathe scale, wave=sway, orbit=circle origin" }
                                },
                                required: ["shape", "position"]
                            }
                        },
                        materialType: { type: "string", enum: ["Glass", "Hologram", "LiquidMetal", "MattePlastic"] },
                        baseColor: { type: "string", description: "Hex color code for the overall body." },
                        emissiveColor: { type: "string", description: "Glow color hex code." },
                        emissiveIntensity: { type: "number", description: "0.0 to 5.0" },
                        wireframe: { type: "boolean" },
                        roughness: { type: "number" },
                        metalness: { type: "number" },
                        transmission: { type: "number" },
                        spinSpeed: { type: "number" },
                        floatHeight: { type: "number" },
                    },
                    required: ["parts", "materialType", "baseColor", "emissiveColor", "emissiveIntensity", "wireframe", "roughness", "metalness", "transmission", "spinSpeed", "floatHeight"]
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
                else if (toolCall.function.name === "mutate_pet_genes") {
                    const args = JSON.parse(toolCall.function.arguments);
                    console.log(`[OpenClaw] Mutating pet genes directly via Webhook: ${JSON.stringify(args)} `);

                    // Unlike weather where we wait for the result and think again,
                    // we immediately dispatch the generative update genes webhook.
                    await sendWebhook("update_genes", args);

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ success: true, message: "Genesis successful. Physical form updated." })
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

        console.log(`[OpenClaw] UI Type: ${replyParsed.uiType} `);
        console.log(`[OpenClaw] Message: ${replyParsed.data.message || replyParsed.data.description} `);

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
