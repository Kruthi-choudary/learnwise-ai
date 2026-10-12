import { describe, it, expect } from "vitest";
import {
  topicStats,
  subjectStats,
  pickQuestions,
  subjects,
} from "../src/services/academics.data.js";
import type { PerfRecord } from "../src/models/academics.model.js";

const sampleRecords: PerfRecord[] = [
  { id: 1, subject: "DSA", topic: "Arrays",       score: 18, max: 20, date: "2026-09-01", type: "Quiz", mistakes: "" },
  { id: 2, subject: "DSA", topic: "Arrays",       score: 14, max: 20, date: "2026-09-10", type: "Quiz", mistakes: "Off-by-one" },
  { id: 3, subject: "DSA", topic: "Linked Lists", score: 8,  max: 20, date: "2026-09-15", type: "Quiz", mistakes: "Pointer bug" },
];

describe("topicStats", () => {
  it("returns one entry per unique subject+topic", () => {
    const stats = topicStats(sampleRecords);
    expect(stats).toHaveLength(2);
  });

  it("marks a topic with pct < 60 as Weak", () => {
    const stats = topicStats(sampleRecords);
    const ll = stats.find((s) => s.topic === "Linked Lists");
    expect(ll?.status).toBe("Weak");
    expect(ll?.pct).toBe(40);
  });

  it("marks a topic with pct >= 75 as Strong", () => {
    const stats = topicStats(sampleRecords);
    const arr = stats.find((s) => s.topic === "Arrays");
    expect(arr?.status).toBe("Strong");
  });

  it("calculates trend as last pct minus first pct", () => {
    const stats = topicStats(sampleRecords);
    const arr = stats.find((s) => s.topic === "Arrays");
    // first 90, last 70 → trend −20
    expect(arr?.trend).toBe(-20);
  });
});

describe("subjectStats", () => {
  it("returns one entry per subject", () => {
    const stats = subjectStats(sampleRecords);
    expect(stats).toHaveLength(subjects.length);
  });

  it("returns 0 pct for subjects with no records", () => {
    const stats = subjectStats(sampleRecords);
    const os = stats.find((s) => s.subject === "Operating Systems");
    expect(os?.pct).toBe(0);
    expect(os?.count).toBe(0);
  });
});

describe("pickQuestions", () => {
  it("returns at most count questions", () => {
    const qs = pickQuestions("DSA", "Linked Lists", "Easy", 2);
    expect(qs.length).toBeLessThanOrEqual(2);
  });

  it("returns questions matching the subject and topic", () => {
    const qs = pickQuestions("DSA", "Arrays", "Mixed", 10);
    qs.forEach((q) => {
      expect(q.subject).toBe("DSA");
      expect(q.topic).toBe("Arrays");
    });
  });

  it("returns an empty array for an unknown subject", () => {
    const qs = pickQuestions("Unknown", "Any", "Mixed", 5);
    expect(qs).toHaveLength(0);
  });
});
