// @vitest-environment node
import { describe, it, expect } from "vitest";
import { generateReport, type ReportData } from "@/lib/pdf/report";

const BASE_DATA: ReportData = {
  email: "test@example.com",
  detonatedAt: "2026-03-29T12:00:00.000Z",
  services: [],
  totalRequestsSent: 0,
  totalGuidesGenerated: 0,
};

const FULL_DATA: ReportData = {
  email: "test@example.com",
  detonatedAt: "2026-03-29T12:00:00.000Z",
  services: [
    {
      name: "Facebook",
      category: "social-media",
      action: "auto-sent",
      status: "sent",
    },
    {
      name: "LinkedIn",
      category: "social-media",
      action: "auto-sent",
      status: "sent",
    },
    {
      name: "Spokeo",
      category: "data-broker",
      action: "user-draft",
      status: "pending-user",
      draftEmail: {
        to: "privacy@spokeo.com",
        subject: "Right to Erasure Request — GDPR Article 17",
        body: "Dear Data Protection Officer,\n\nI request erasure of my data...",
      },
    },
    {
      name: "Instagram",
      category: "social-media",
      action: "manual-guide",
      status: "pending-user",
      manualSteps: [
        "Open the Instagram app",
        "Go to Settings > Account > Delete Account",
        "Select a reason and confirm deletion",
      ],
    },
  ],
  totalRequestsSent: 2,
  totalGuidesGenerated: 2,
};

describe("generateReport", () => {
  it("generates a valid PDF buffer", async () => {
    const buffer = await generateReport(FULL_DATA);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // PDF files start with %PDF
    const header = buffer.subarray(0, 5).toString("ascii");
    expect(header).toBe("%PDF-");
  }, 15000);

  it("handles empty service list gracefully", async () => {
    const buffer = await generateReport(BASE_DATA);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    const header = buffer.subarray(0, 5).toString("ascii");
    expect(header).toBe("%PDF-");
  }, 15000);

  it("handles mix of auto-sent, user-draft, and manual-guide", async () => {
    const buffer = await generateReport(FULL_DATA);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Full report with all sections should be larger than empty
    const emptyBuffer = await generateReport(BASE_DATA);
    expect(buffer.length).toBeGreaterThan(emptyBuffer.length);
  }, 15000);

  it("handles auto-sent only services", async () => {
    const data: ReportData = {
      ...BASE_DATA,
      services: [
        { name: "Facebook", category: "social-media", action: "auto-sent", status: "sent" },
      ],
      totalRequestsSent: 1,
    };
    const buffer = await generateReport(data);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  }, 15000);

  it("handles user-draft only services", async () => {
    const data: ReportData = {
      ...BASE_DATA,
      services: [
        {
          name: "Spokeo",
          category: "data-broker",
          action: "user-draft",
          status: "pending-user",
          draftEmail: {
            to: "privacy@spokeo.com",
            subject: "Deletion Request",
            body: "Please delete my data.",
          },
        },
      ],
      totalGuidesGenerated: 1,
    };
    const buffer = await generateReport(data);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  }, 15000);

  it("handles services with missing optional fields and invalid email", async () => {
    const data: ReportData = {
      ...BASE_DATA,
      email: "invalidemail", // no @ — exercises redactEmail fallback
      services: [
        {
          name: "NoDraft",
          category: "other",
          action: "user-draft",
          status: "pending-user",
          // no draftEmail — exercises ?? "" fallback branches
        },
        {
          name: "NoSteps",
          category: "other",
          action: "manual-guide",
          status: "pending-user",
          // no manualSteps — exercises ?? [] fallback
        },
      ],
      totalGuidesGenerated: 2,
    };
    const buffer = await generateReport(data);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  }, 15000);

  it("handles manual-guide only services", async () => {
    const data: ReportData = {
      ...BASE_DATA,
      services: [
        {
          name: "Reddit",
          category: "social-media",
          action: "manual-guide",
          status: "pending-user",
          manualSteps: ["Go to settings", "Delete account", "Confirm"],
        },
      ],
      totalGuidesGenerated: 1,
    };
    const buffer = await generateReport(data);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  }, 15000);
});
