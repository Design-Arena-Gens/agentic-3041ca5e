import { promises as fs } from "fs";
import path from "path";
import { loadLatestSnapshots } from "../lib/dataLoader";
import { generateDailyReport, toMarkdown } from "../lib/reportGenerator";

async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function run(): Promise<void> {
  const reportsDir = path.join(process.cwd(), "reports");
  await ensureDirectory(reportsDir);

  const [previousSnapshot, currentSnapshot] = await loadLatestSnapshots();
  const report = generateDailyReport(currentSnapshot, previousSnapshot);
  const markdown = toMarkdown(report);

  const filename = `${report.aggregate.reportDate}.md`;
  const filePath = path.join(reportsDir, filename);
  await fs.writeFile(filePath, markdown, "utf-8");

  const summaryPath = path.join(reportsDir, "latest.md");
  await fs.writeFile(summaryPath, markdown, "utf-8");

  // eslint-disable-next-line no-console
  console.log(`Report generated: ${filePath}`);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to generate daily report", error);
  process.exit(1);
});
