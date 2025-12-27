import { format, parseISO } from "date-fns";
import { loadLatestSnapshots } from "../lib/dataLoader";
import { generateDailyReport } from "../lib/reportGenerator";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default async function Home() {
  const [previousSnapshot, currentSnapshot] = await loadLatestSnapshots();
  const report = generateDailyReport(currentSnapshot, previousSnapshot);

  const reportDate = format(parseISO(report.aggregate.reportDate), "MMMM d, yyyy");
  const comparisonDate = report.aggregate.comparisonToDate
    ? format(parseISO(report.aggregate.comparisonToDate), "MMMM d, yyyy")
    : null;

  return (
    <main className="container">
      <div className="card">
        <div className="title">
          <div className="pill">Autonomous Daily Reporting</div>
          <h1>Classroom Intelligence Briefing</h1>
          <p>
            Comprehensive diff of your learning platform activity, synthesized into a human-ready
            daily report.
          </p>
        </div>

        <div className="report-section">
          <div className="report-meta">
            <div className="metric">
              <div className="metric-label">Report Date</div>
              <div className="metric-value">{reportDate}</div>
              {comparisonDate ? (
                <div className="neutral">Compared with {comparisonDate}</div>
              ) : null}
            </div>
            <div className="metric">
              <div className="metric-label">New Sessions Logged</div>
              <div className="metric-value">{numberFormatter.format(report.aggregate.newSessions)}</div>
              <div className="neutral">
                {numberFormatter.format(report.aggregate.totalSessions)} total lifetime sessions
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Puzzle Throughput</div>
              <div className="metric-value">
                {numberFormatter.format(report.aggregate.totalPuzzlesAttempted)}
              </div>
              <div className="neutral">
                {numberFormatter.format(report.aggregate.totalPuzzlesCorrect)} solved &bull;{" "}
                {numberFormatter.format(report.aggregate.totalPuzzlesIncorrect)} missed
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Active Students</div>
              <div className="metric-value">
                {numberFormatter.format(report.aggregate.uniqueStudentsActive)}
              </div>
              <div className="neutral">
                {report.aggregate.totalNewBooks > 0
                  ? `${report.aggregate.totalNewBooks} new resources`
                  : "No new resources onboarded"}
              </div>
            </div>
          </div>

          <section>
            <h2 className="section-heading">Narrative Summary</h2>
            <p className="section-description">
              Generated autonomously from the delta between platform snapshots.
            </p>
            <div className="report-output">{report.narrative}</div>
          </section>

          <section>
            <h2 className="section-heading">New Study Resources</h2>
            <p className="section-description">
              Books and references added to the learning catalog since the prior snapshot.
            </p>
            <div className="books-list">
              {report.newBooks.length === 0 ? (
                <div className="neutral">No new resources today.</div>
              ) : (
                report.newBooks.map((book) => (
                  <div key={book.id} className="book">
                    <strong>{book.title}</strong>
                    <span className="neutral">
                      {book.author} &middot; {book.level.charAt(0).toUpperCase() + book.level.slice(1)}
                    </span>
                    <span className="neutral">
                      Added {format(parseISO(book.addedAt), "MMMM d, yyyy")}
                    </span>
                    {book.notes ? <span className="neutral">{book.notes}</span> : null}
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="section-heading">Student Performance Movements</h2>
            <p className="section-description">
              Breakdown of daily momentum across sessions, puzzle work, and leaderboard shifts.
            </p>
            <div className="students-grid">
              {report.students.map((student) => (
                <div key={student.id} className="student-card">
                  <div>
                    <h3>{student.name}</h3>
                    <div className="student-meta">
                      <span className="pill">{student.level}</span>
                      <span>+{numberFormatter.format(student.newPoints)} pts</span>
                      {student.currentRank !== null ? (
                        <span>
                          Rank {student.currentRank}
                          {typeof student.rankDelta === "number" && student.rankDelta !== 0 ? (
                            <span
                              className={`delta ${student.rankDelta < 0 ? "negative" : ""}`}
                            >
                              {student.rankDelta > 0 ? `+${student.rankDelta}` : student.rankDelta}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span>No leaderboard entry</span>
                      )}
                      {student.streak ? <span>Streak {student.streak}</span> : null}
                    </div>
                  </div>

                  <div className="sessions-list">
                    <strong>Sessions</strong>
                    {student.newSessions.length === 0 ? (
                      <span className="neutral">No sessions logged today.</span>
                    ) : (
                      student.newSessions.map((session) => (
                        <div key={session.id} className="session">
                          <span>{session.topic}</span>
                          <span className="neutral">
                            {format(parseISO(session.start), "HH:mm")} &middot; {session.durationMinutes}{" "}
                            min &middot; {session.format.replace("-", " ")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="topic-list">
                    <strong>Puzzle Topics</strong>
                    {student.puzzleTopics.length === 0 ? (
                      <span className="neutral">No puzzle delta captured.</span>
                    ) : (
                      student.puzzleTopics.map((topic) => (
                        <div key={topic.topic} className="topic">
                          <strong>{topic.topic}</strong>
                          <span>
                            +{topic.correctDelta}/{topic.attemptedDelta} correct{" "}
                            <span className={topic.incorrectDelta > 0 ? "delta negative" : "delta"}>
                              {topic.attemptedDelta > 0
                                ? formatPercent(topic.accuracy)
                                : formatPercent(0)}
                            </span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {student.netAccuracyChange !== 0 ? (
                    <span className={`delta ${student.netAccuracyChange < 0 ? "negative" : ""}`}>
                      Accuracy shift:{" "}
                      {student.netAccuracyChange > 0
                        ? `+${student.netAccuracyChange.toFixed(2)}`
                        : student.netAccuracyChange.toFixed(2)}{" "}
                      pts
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-heading">Leaderboard Signals</h2>
            <p className="section-description">
              Spotlight on climbs, drops, and notable streaks from the chess puzzle leaderboard.
            </p>
            <div className="sessions-list">
              {report.leaderboardHighlights.length === 0 ? (
                <span className="neutral">No leaderboard shifts beyond the noise floor today.</span>
              ) : (
                report.leaderboardHighlights.map((entry) => (
                  <div key={entry.studentId} className="session">
                    <strong>
                      #{entry.rank} &middot; {entry.studentId}
                    </strong>
                    <span className="neutral">
                      {numberFormatter.format(entry.points)} pts &middot; streak {entry.streak} &middot;{" "}
                      {entry.deltaRank === 0
                        ? "held position"
                        : entry.deltaRank > 0
                          ? `rose ${entry.deltaRank}`
                          : `dropped ${Math.abs(entry.deltaRank)}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="actions">
            <a className="button" href="/api/report?format=markdown" target="_blank" rel="noreferrer">
              Download Markdown
            </a>
            <a className="button secondary" href="/api/report" target="_blank" rel="noreferrer">
              View JSON
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
