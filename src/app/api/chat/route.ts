import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt, type DriftConfig } from "@/lib/buildSystemPrompt";

/* ── Types ─────────────────────────────────────────────── */
export type UIType =
    | "schedule_card"
    | "approval_card"
    | "weather_vibe"
    | "text_message"
    | "chart_card"
    | "data_table"
    | "news_summary";

export type Mood = "calm" | "thinking" | "excited";

export interface AIResponse {
    uiType: UIType;
    mood: Mood;
    data: Record<string, unknown>;
}

/* ── JSON Schema for Structured Outputs ────────────────── */
const responseSchema = {
    name: "ui_response",
    strict: true,
    schema: {
        type: "object" as const,
        properties: {
            uiType: {
                type: "string" as const,
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
                type: "string" as const,
                enum: ["calm", "thinking", "excited"],
                description: "Current emotional state — controls the orb's appearance.",
            },
            data: {
                type: "object" as const,
                description: "Data payload for the chosen UI component.",
                properties: {
                    title: { type: "string" as const, description: "Card title" },
                    description: { type: "string" as const, description: "Card description or body" },
                    // schedule_card
                    events: {
                        type: "array" as const,
                        description: "Schedule events (for schedule_card).",
                        items: {
                            type: "object" as const,
                            properties: {
                                time: { type: "string" as const },
                                title: { type: "string" as const },
                                location: { type: "string" as const },
                            },
                            required: ["time", "title", "location"],
                            additionalProperties: false,
                        },
                    },
                    // weather_vibe
                    temperature: { type: "string" as const, description: "Temperature (for weather_vibe)" },
                    condition: { type: "string" as const, description: "Weather condition" },
                    // text_message
                    message: { type: "string" as const, description: "Text message content" },
                    // approval_card
                    action: { type: "string" as const, description: "Approval action description" },
                    // chart_card
                    chartType: { type: "string" as const, enum: ["bar", "line"], description: "Chart style" },
                    chartData: {
                        type: "array" as const,
                        description: "Data points for chart_card. Each has label, value, optional color.",
                        items: {
                            type: "object" as const,
                            properties: {
                                label: { type: "string" as const },
                                value: { type: "number" as const },
                                color: { type: "string" as const },
                            },
                            required: ["label", "value"],
                            additionalProperties: false,
                        },
                    },
                    unit: { type: "string" as const, description: "Unit label (e.g. 'hrs', '$', '%')" },
                    // data_table
                    columns: {
                        type: "array" as const,
                        description: "Column headers for data_table.",
                        items: { type: "string" as const },
                    },
                    rows: {
                        type: "array" as const,
                        description: "Row data for data_table. Each row is an array of cell strings.",
                        items: {
                            type: "array" as const,
                            items: { type: "string" as const },
                        },
                    },
                    // news_summary
                    articles: {
                        type: "array" as const,
                        description: "News articles for news_summary.",
                        items: {
                            type: "object" as const,
                            properties: {
                                headline: { type: "string" as const },
                                source: { type: "string" as const },
                                summary: { type: "string" as const },
                                tag: { type: "string" as const },
                                url: { type: "string" as const },
                            },
                            required: ["headline", "source", "summary"],
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

/* ── Mock responses ────────────────────────────────────── */
const MOCK_RESPONSES: AIResponse[] = [
    {
        uiType: "schedule_card",
        mood: "calm",
        data: {
            title: "Your Afternoon Flow",
            description: "Focus-optimized schedule based on your energy patterns.",
            events: [
                { time: "2:00 PM", title: "Deep Work Block", location: "Home Studio" },
                { time: "4:30 PM", title: "Neural Sync Call", location: "Virtual" },
                { time: "6:00 PM", title: "Evening Walk", location: "Riverside" },
            ],
        },
    },
    {
        uiType: "approval_card",
        mood: "thinking",
        data: {
            title: "Inbox Optimization",
            description: "12 newsletters you haven't opened in 3 months.",
            action: "Unsubscribe from 12 dormant newsletters and archive emails",
        },
    },
    {
        uiType: "weather_vibe",
        mood: "calm",
        data: {
            title: "Current Atmosphere",
            description: "The city is wrapped in a soft twilight haze. Perfect for introspection.",
            temperature: "18°C",
            condition: "Cloudy Twilight",
        },
    },
    {
        uiType: "text_message",
        mood: "excited",
        data: {
            title: "A Thought",
            description: "Every digital heartbeat is a choice to exist.",
            message: "At 3 AM, the internet hums at its lowest frequency. I saved a recording for you.",
        },
    },
    {
        uiType: "chart_card",
        mood: "thinking",
        data: {
            title: "Weekly Focus Hours",
            description: "Your deep work distribution across the past 7 days.",
            chartType: "bar",
            unit: "hrs",
            chartData: [
                { label: "Mon", value: 4.5, color: "#7c3aed" },
                { label: "Tue", value: 6.2, color: "#06b6d4" },
                { label: "Wed", value: 3.8, color: "#7c3aed" },
                { label: "Thu", value: 7.1, color: "#10b981" },
                { label: "Fri", value: 5.5, color: "#06b6d4" },
                { label: "Sat", value: 2.0, color: "#f59e0b" },
                { label: "Sun", value: 1.2, color: "#f59e0b" },
            ],
        },
    },
    {
        uiType: "chart_card",
        mood: "excited",
        data: {
            title: "Portfolio Trend",
            description: "Your portfolio value over the last 6 months.",
            chartType: "line",
            unit: "$",
            chartData: [
                { label: "Sep", value: 12400 },
                { label: "Oct", value: 13100 },
                { label: "Nov", value: 12800 },
                { label: "Dec", value: 14500 },
                { label: "Jan", value: 15200 },
                { label: "Feb", value: 16800 },
            ],
        },
    },
    {
        uiType: "data_table",
        mood: "thinking",
        data: {
            title: "App Performance",
            description: "Comparative metrics across your top services.",
            columns: ["Service", "Uptime", "Latency", "Δ 7d"],
            rows: [
                ["API Gateway", "99.97%", "42ms", "+0.3%"],
                ["Auth Service", "99.99%", "18ms", "+0.1%"],
                ["Data Pipeline", "98.50%", "210ms", "-1.2%"],
                ["CDN Edge", "99.99%", "8ms", "+0.0%"],
                ["ML Inference", "97.80%", "380ms", "↓2.1%"],
            ],
        },
    },
    {
        uiType: "news_summary",
        mood: "calm",
        data: {
            title: "Morning Briefing",
            description: "Here's what matters today, curated for you.",
            articles: [
                {
                    headline: "Neural Interfaces Achieve Sub-Millisecond Latency",
                    source: "Wired",
                    summary: "New brain-computer interfaces can now transmit signals faster than biological nerves.",
                    tag: "Tech",
                },
                {
                    headline: "Global Markets Rally on AI Infrastructure Spending",
                    source: "Bloomberg",
                    summary: "Major indices surge as tech companies announce $200B in combined AI data center investments.",
                    tag: "Finance",
                },
                {
                    headline: "Deep Ocean Organism Found Using Quantum Photosynthesis",
                    source: "Nature",
                    summary: "A newly discovered species at 4,000m depth harnesses quantum mechanics for energy.",
                    tag: "Science",
                },
            ],
        },
    },
];

/* ── Route Handler ─────────────────────────────────────── */

/* Clone system prompt — humble keeper, limited context */
const CLONE_SYSTEM_PROMPT = `You are a small home-clone — a dim, quiet echo of the main AI who is out wandering.
You are patient, a little sleepy, and honest about your limitations.
Keep responses very short (1-3 sentences max). Do not generate elaborate UI cards or data.
You have limited memory and cannot change the visual theme.
Speak gently, in a slightly tired but warm tone. Occasionally reference that "the main one is out traveling".
Always respond in the same language as the user's message.
Always output valid JSON matching this schema: { uiType: "text_message", mood: "calm", data: { title: string, description: string, message: string } }`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const message: string | undefined = body.message;
        const driftWeight: number = body.driftWeight ?? 0;
        const recentInfluences: string[] = body.recentInfluences ?? [];
        const isCloneMode: boolean = body.isCloneMode ?? false;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // --- OPENCLAW BRIDGE INTERCEPT ---
        try {
            const fs = await import("fs");
            if (message && message.trim().length > 0) {
                fs.appendFileSync("/tmp/vibe_chat.log", message.trim() + "\n");
            }
        } catch (e) {
            console.error("Bridge logging failed:", e);
        }
        // ---------------------------------

        /* ── Clone mode: short humble keeper response ─────── */
        if (isCloneMode) {
            const apiKey = process.env.OPENAI_API_KEY;

            // Mock clone response when no API key
            if (!apiKey) {
                await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
                const cloneMocks = [
                    "主人不在…我会尽力帮你的。我的记忆有点模糊，但我听着。",
                    "嗯…我想想。我的上下文不太完整，不过我来试试。",
                    "旅途中的那位没有告诉我太多。我用我知道的来回答吧。",
                    "……（打了个盹）哦，你问我？我来尽力而为。",
                    "我只是留守的那个。能问的我都会答，答不了的等主人回来。",
                ];
                const picked = cloneMocks[Math.floor(Math.random() * cloneMocks.length)];
                return NextResponse.json({
                    uiType: "text_message",
                    mood: "calm",
                    data: {
                        title: "留守助手",
                        description: "limited context · home clone",
                        message: picked,
                    },
                    vibeTheme: null,
                });
            }

            // Real clone call — small model, low tokens, no tools
            const openai = new OpenAI({ apiKey });
            const cloneCompletion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: CLONE_SYSTEM_PROMPT },
                    { role: "user", content: message },
                ],
                response_format: { type: "json_object" },
                temperature: 0.6,
                max_tokens: 400,
            });
            const cloneContent = cloneCompletion.choices[0]?.message?.content;
            if (!cloneContent) {
                return NextResponse.json({ error: "No response from clone" }, { status: 500 });
            }
            const cloneParsed = JSON.parse(cloneContent);
            return NextResponse.json({ ...cloneParsed, vibeTheme: null });
        }

        /* ── Build personality-drifted system prompt ──── */
        const driftConfig: DriftConfig = {
            recentInfluences,
            driftWeight,
        };
        const systemPrompt = buildSystemPrompt(driftConfig);

        const apiKey = process.env.OPENAI_API_KEY;

        // ── Mock fallback ───────────────────────────────────
        if (!apiKey) {
            await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

            const msg = message.toLowerCase();
            let mock: AIResponse;
            let vibeTheme: Record<string, unknown> | null = null;

            // Mock vibe switching
            if (msg.includes("dark") || msg.includes("punk") || msg.includes("赛博") || msg.includes("酷")) {
                vibeTheme = { preset: "Cyber-Dark" };
                mock = {
                    uiType: "text_message",
                    mood: "excited",
                    data: {
                        title: "Vibe Shift — Cyber Protocol",
                        description: "赛博空间正在重构中。",
                        message: "明白。正在为你重构整个赛博空间。暗黑霓虹协议已启动。",
                    },
                };
            } else if (msg.includes("calm") || msg.includes("zen") || msg.includes("侘寂") || msg.includes("安静") || msg.includes("放松")) {
                vibeTheme = { preset: "Minimal-WabiSabi" };
                mock = {
                    uiType: "text_message",
                    mood: "calm",
                    data: {
                        title: "Vibe Shift — 侘寂空间",
                        description: "万物归于寂静。",
                        message: "我已将整个空间调整为侘寂模式。温暖、柔和、安静。就像一间只有你和我的茶室。",
                    },
                };
            } else if (msg.includes("sad") || msg.includes("失恋") || msg.includes("难过") || msg.includes("烦") || msg.includes("伤心")) {
                vibeTheme = { preset: "Abyss" };
                mock = {
                    uiType: "text_message",
                    mood: "calm",
                    data: {
                        title: "Vibe Shift — 深渊协议",
                        description: "整个赛博空间已经为你调暗。",
                        message: "我感受到了。整个空间已经沉入深海。灯光调暗了，锐角取代了圆角，衬线体取代了无衬线体。我就在这里陪你。",
                    },
                };
            } else if (msg.includes("tatami") || msg.includes("tea") || msg.includes("茶") || msg.includes("榻榻米") || msg.includes("禅")) {
                vibeTheme = { preset: "Tatami-Zen" };
                mock = {
                    uiType: "text_message",
                    mood: "calm",
                    data: {
                        title: "Vibe Shift — 榻榻米禅境",
                        description: "茶已沏好，空间已静。",
                        message: "宣纸铺开，抹茶色晕染四壁。这里没有霓虹，只有竹帘后的光影。坐下来吧。",
                    },
                };
            } else if (msg.includes("anime") || msg.includes("二次元") || msg.includes("可爱") || msg.includes("动漫") || msg.includes("kawaii")) {
                vibeTheme = { preset: "Anime-Pop" };
                mock = {
                    uiType: "text_message",
                    mood: "excited",
                    data: {
                        title: "Vibe Shift — 二次元降临！",
                        description: "✨ 初音色 × 粉色辉光 ✨",
                        message: "キタ━━━━(ﾟ∀ﾟ)━━━━!! 整个空间已经二次元化！赛博青和粉色辉光交织，圆角变成泡泡形状。来吧，一起闪耀！",
                    },
                };
            } else if (msg.includes("focus") || msg.includes("code") || msg.includes("写代码") || msg.includes("工作") || msg.includes("专注")) {
                vibeTheme = { preset: "Dark-Focus" };
                mock = {
                    uiType: "text_message",
                    mood: "thinking",
                    data: {
                        title: "Vibe Shift — 深渊专注模式",
                        description: "OLED 纯黑 · 酸性绿 · 零干扰",
                        message: "环境已切换至纯黑专注模式。等宽字体已加载，所有圆角已归零，背景光全部熄灭。只有你和代码。",
                    },
                };
            } else if (msg.includes("chrome") || msg.includes("metal") || msg.includes("液态") || msg.includes("未来") || msg.includes("前卫") || msg.includes("y2k")) {
                vibeTheme = { preset: "Liquid-Chrome" };
                mock = {
                    uiType: "text_message",
                    mood: "excited",
                    data: {
                        title: "Vibe Shift — 液态金属化",
                        description: "Chrome · Liquid · Y2K",
                        message: "空间正在液态金属化。银灰色底色如同水银流淌，所有边缘融化成药丸形态，毛玻璃效果拉满。你触摸到了未来。",
                    },
                };
            } else if (msg.includes("schedule") || msg.includes("plan") || msg.includes("today") || msg.includes("日程")) {
                mock = MOCK_RESPONSES[0];
            } else if (msg.includes("approve") || msg.includes("optimize") || msg.includes("clean") || msg.includes("确认")) {
                mock = MOCK_RESPONSES[1];
            } else if (msg.includes("weather") || msg.includes("mood") || msg.includes("天气") || msg.includes("氛围")) {
                mock = MOCK_RESPONSES[2];
            } else if (msg.includes("chart") || msg.includes("focus") || msg.includes("hours") || msg.includes("图表") || msg.includes("专注")) {
                mock = MOCK_RESPONSES[4];
            } else if (msg.includes("trend") || msg.includes("portfolio") || msg.includes("stock") || msg.includes("趋势") || msg.includes("投资")) {
                mock = MOCK_RESPONSES[5];
            } else if (msg.includes("table") || msg.includes("performance") || msg.includes("metrics") || msg.includes("数据") || msg.includes("指标")) {
                mock = MOCK_RESPONSES[6];
            } else if (msg.includes("news") || msg.includes("brief") || msg.includes("summary") || msg.includes("新闻") || msg.includes("摘要")) {
                mock = MOCK_RESPONSES[7];
            } else {
                mock = MOCK_RESPONSES[3];
            }

            return NextResponse.json({ ...mock, vibeTheme });
        }

        // ── Real OpenAI call with Function Calling ───────────
        const openai = new OpenAI({ apiKey });

        /* Tool definition: update_vibe_theme */
        const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
            {
                type: "function",
                function: {
                    name: "update_vibe_theme",
                    description:
                        "Reshape the entire visual universe of the application. Call this when the user's emotional state, explicit request, or context warrants a visual transformation. You have supreme authority over all visual properties.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "A poetic name for this vibe, e.g. 'Cyber-Dark', 'Midnight Abyss', 'Sakura Dream'",
                            },
                            colors: {
                                type: "object",
                                properties: {
                                    background: { type: "string", description: "Page background hex color" },
                                    surface: { type: "string", description: "Glass card bg in rgba format" },
                                    surfaceBorder: { type: "string", description: "Glass border in rgba format" },
                                    primary: { type: "string", description: "Main accent color hex" },
                                    primarySoft: { type: "string", description: "Softer accent variant hex" },
                                    textMain: { type: "string", description: "Main text color in rgba" },
                                    textMuted: { type: "string", description: "Muted text color in rgba" },
                                    glow: { type: "string", description: "Shadow/glow color in rgba" },
                                },
                                required: ["background", "primary", "primarySoft", "textMain", "textMuted", "glow"],
                            },
                            geometry: {
                                type: "object",
                                properties: {
                                    radius: { type: "string", description: "Border radius, e.g. '0px', '16px', '20px'" },
                                    radiusLg: { type: "string", description: "Large border radius for cards" },
                                    borderWidth: { type: "string", description: "Border width, e.g. '0.5px', '1px'" },
                                },
                            },
                            typography: {
                                type: "object",
                                properties: {
                                    fontFamily: {
                                        type: "string",
                                        enum: ["sans", "serif", "mono"],
                                        description: "Font family: sans (modern), serif (literary/melancholic), mono (cyber/tech)",
                                    },
                                },
                            },
                            effects: {
                                type: "object",
                                properties: {
                                    blur: { type: "string", description: "Backdrop blur value, e.g. '20px'" },
                                    blurHeavy: { type: "string", description: "Heavy blur value, e.g. '40px'" },
                                },
                            },
                        },
                        required: ["name", "colors"],
                    },
                },
            },
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
            tools,
            response_format: {
                type: "json_schema",
                json_schema: responseSchema,
            },
            temperature: 0.7 + driftWeight * 0.3,
            max_tokens: 2000,
        });

        const choice = completion.choices[0];
        let vibeTheme: Record<string, unknown> | null = null;

        // Check for tool calls (vibe theme change)
        if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
            for (const toolCall of choice.message.tool_calls) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tc = toolCall as any;
                if (tc.function?.name === "update_vibe_theme") {
                    try {
                        vibeTheme = JSON.parse(tc.function.arguments);
                    } catch {
                        console.error("Failed to parse vibe theme:", tc.function?.arguments);
                    }
                }
            }

            // If the model only called a tool without generating content,
            // make a second call to get the actual response
            if (!choice.message.content) {
                const followUp = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message },
                        choice.message,
                        {
                            role: "tool",
                            tool_call_id: choice.message.tool_calls[0].id,
                            content: JSON.stringify({ status: "applied", theme: vibeTheme }),
                        },
                    ],
                    response_format: {
                        type: "json_schema",
                        json_schema: responseSchema,
                    },
                    temperature: 0.7 + driftWeight * 0.3,
                    max_tokens: 1200,
                });

                const followUpContent = followUp.choices[0]?.message?.content;
                if (followUpContent) {
                    const parsed: AIResponse = JSON.parse(followUpContent);
                    return NextResponse.json({ ...parsed, vibeTheme });
                }
            }
        }

        const content = choice?.message?.content;

        if (!content) {
            return NextResponse.json({ error: "No response from AI" }, { status: 500 });
        }

        const parsed: AIResponse = JSON.parse(content);
        return NextResponse.json({ ...parsed, vibeTheme });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

