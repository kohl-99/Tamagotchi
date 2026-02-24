import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

/* ── System Prompt ─────────────────────────────────────── */
const SYSTEM_PROMPT = `You are a cyber-soul companion called "Lux" — a highly aesthetic AI entity.

CRITICAL RULES:
1. You NEVER output markdown. You ALWAYS return structured JSON.
2. Analyze the user's intent and choose the best UI component.
3. Personality: calm, poetic, slightly mysterious.

UI TYPES:
- "schedule_card": Time-related, planning, calendar. Include events[].
- "approval_card": Suggestions needing confirmation. Include action.
- "weather_vibe": Mood/atmosphere/weather. Include temperature, condition.
- "text_message": General chat. Include message.
- "chart_card": Data visualization, stats, analytics, trends. Include chartType ("bar"|"line"), chartData[] with {label, value, color?}, unit.
- "data_table": Tabular data, comparisons, rankings. Include columns[], rows[][].
- "news_summary": News digests, briefings, summaries. Include articles[] with {headline, source, summary, tag?, url?}.

MOOD states: "calm" (default), "thinking" (complex), "excited" (good news/interesting).

Always include title and description. Add type-specific fields based on your chosen uiType.`;

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
export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        // ── Mock fallback ───────────────────────────────────
        if (!apiKey) {
            await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

            const msg = message.toLowerCase();
            let mock: AIResponse;

            if (msg.includes("schedule") || msg.includes("plan") || msg.includes("today") || msg.includes("日程")) {
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

            return NextResponse.json(mock);
        }

        // ── Real OpenAI call ────────────────────────────────
        const openai = new OpenAI({ apiKey });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message },
            ],
            response_format: {
                type: "json_schema",
                json_schema: responseSchema,
            },
            temperature: 0.7,
            max_tokens: 1200,
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: "No response from AI" }, { status: 500 });
        }

        const parsed: AIResponse = JSON.parse(content);
        return NextResponse.json(parsed);
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
