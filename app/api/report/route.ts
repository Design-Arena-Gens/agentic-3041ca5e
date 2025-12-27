import { NextRequest, NextResponse } from "next/server";
import { loadLatestSnapshots } from "../../../lib/dataLoader";
import { generateDailyReport, toMarkdown } from "../../../lib/reportGenerator";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const format = search.get("format") ?? "json";

  const [previousSnapshot, currentSnapshot] = await loadLatestSnapshots();
  const report = generateDailyReport(currentSnapshot, previousSnapshot);

  if (format === "markdown") {
    const markdown = toMarkdown(report);
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }

  return NextResponse.json(report, {
    status: 200,
    headers: {
      "cache-control": "no-store"
    }
  });
}
