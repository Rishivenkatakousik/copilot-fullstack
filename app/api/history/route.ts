import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { codeGenerations, languages } from "@/shared/schema";
import { desc, count, eq, sql } from "drizzle-orm";
import type { HistoryResponse } from "@/shared/schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const languageFilter = searchParams.get("language");

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Build base query
    let dataQuery = db
      .select({
        id: codeGenerations.id,
        prompt: codeGenerations.prompt,
        code: codeGenerations.code,
        timestamp: codeGenerations.timestamp,
        language: {
          code: languages.code,
          name: languages.name,
        },
      })
      .from(codeGenerations)
      .innerJoin(languages, eq(codeGenerations.languageId, languages.id))
      .orderBy(desc(codeGenerations.timestamp))
      .limit(limit)
      .offset(offset)
      .$dynamic();

    // Apply language filter if provided
    if (languageFilter) {
      dataQuery = dataQuery.where(eq(languages.code, languageFilter));
    }

    const data = await dataQuery;

    // Get total count for pagination
    let countQuery = db
      .select({ total: count() })
      .from(codeGenerations)
      .innerJoin(languages, eq(codeGenerations.languageId, languages.id))
      .$dynamic();

    if (languageFilter) {
      countQuery = countQuery.where(eq(languages.code, languageFilter));
    }

    const countResult = await countQuery;
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const response: HistoryResponse = {
      data: data.map((item) => ({
        id: item.id,
        prompt: item.prompt,
        code: item.code,
        timestamp: item.timestamp,
        language: item.language,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch history",
        details: error.message,
      },
      { status: 500 }
    );
  }
}