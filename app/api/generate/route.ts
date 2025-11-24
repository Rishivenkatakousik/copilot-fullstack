import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GenerateRequest, GenerateResponse } from "@/shared/schema";
import { db } from "@/lib/db";
import { codeGenerations, languages } from "@/shared/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Code Copilot",
  },
});

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, language } = body;

    if (!prompt || !language) {
      return NextResponse.json(
        { error: "Prompt and language are required" },
        { status: 400 }
      );
    }

    const languageMap: Record<string, string> = {
      python: "Python",
      javascript: "JavaScript",
      cpp: "C++",
      java: "Java",
      typescript: "TypeScript",
      go: "Go",
      csharp: "C#",
    };

    const systemPrompt = `You are a code generation assistant. Generate clean, well-commented code in ${languageMap[language]}. Only return the code without explanations, markdown formatting, or backticks.`;

    console.log("Generating code for:", { prompt, language });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const code = completion.choices[0]?.message?.content || "";

    console.log("Generated code:", code);

    // Get language ID from database
    const [languageRecord] = await db
      .select()
      .from(languages)
      .where(eq(languages.code, language))
      .limit(1);

    if (!languageRecord) {
      return NextResponse.json(
        { error: `Language '${language}' not found in database` },
        { status: 400 }
      );
    }

    // Save to database
    const [savedGeneration] = await db
      .insert(codeGenerations)
      .values({
        prompt: prompt,
        languageId: languageRecord.id,
        code: code.trim(),
      })
      .returning();

    const response: GenerateResponse = {
      code: code.trim(),
      id: savedGeneration.id,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error generating code:", error);
    console.error("Error details:", error.message);
    console.error("Error response:", error.response?.data);

    return NextResponse.json(
      {
        error: "Failed to generate code",
        details: error.message,
      },
      { status: 500 }
    );
  }
}