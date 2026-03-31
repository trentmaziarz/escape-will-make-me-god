import { describe, it, expect } from "vitest";
import { reportHtml, reportText } from "@/lib/email/templates/report-email";
import type { ReportData } from "@/lib/pdf/report";

const BASE: ReportData = {
  email: "test@example.com",
  detonatedAt: "2026-03-29T12:00:00.000Z",
  services: [],
  totalRequestsSent: 0,
  totalGuidesGenerated: 0,
};

describe("reportHtml", () => {
  it("renders user-draft section with draft email details", () => {
    const html = reportHtml({
      ...BASE,
      services: [
        {
          name: "Spokeo",
          category: "data-broker",
          action: "user-draft",
          status: "pending-user",
          draftEmail: {
            to: "privacy@spokeo.com",
            subject: "Delete my data",
            body: "Please erase all records.",
          },
        },
      ],
      totalGuidesGenerated: 1,
    });
    expect(html).toContain("Emails You Need to Send");
    expect(html).toContain("Spokeo");
    expect(html).toContain("privacy@spokeo.com");
    expect(html).toContain("Delete my data");
    expect(html).toContain("Please erase all records.");
  });

  it("renders user-draft section when draftEmail is missing (fallback branches)", () => {
    const html = reportHtml({
      ...BASE,
      services: [
        {
          name: "UnknownService",
          category: "other",
          action: "user-draft",
          status: "pending-user",
          // no draftEmail — exercises draft?.to ?? "" fallback
        },
      ],
      totalGuidesGenerated: 1,
    });
    expect(html).toContain("Emails You Need to Send");
    expect(html).toContain("UnknownService");
  });

  it("renders both user-draft variants in a single report", () => {
    const html = reportHtml({
      ...BASE,
      services: [
        {
          name: "WithDraft",
          category: "data-broker",
          action: "user-draft",
          status: "pending-user",
          draftEmail: { to: "a@b.com", subject: "Subj", body: "Body" },
        },
        {
          name: "NoDraft",
          category: "other",
          action: "user-draft",
          status: "pending-user",
        },
      ],
      totalGuidesGenerated: 2,
    });
    expect(html).toContain("WithDraft");
    expect(html).toContain("NoDraft");
    expect(html).toContain("a@b.com");
  });

  it("redacts email without @ to ***@***", () => {
    const html = reportHtml({ ...BASE, email: "invalidemail" });
    expect(html).toContain("***@***");
  });
});

describe("reportText", () => {
  it("includes user-draft section with draft details", () => {
    const text = reportText({
      ...BASE,
      services: [
        {
          name: "Spokeo",
          category: "data-broker",
          action: "user-draft",
          status: "pending-user",
          draftEmail: {
            to: "privacy@spokeo.com",
            subject: "Delete request",
            body: "Please delete my data.",
          },
        },
      ],
      totalGuidesGenerated: 1,
    });
    expect(text).toContain("EMAILS YOU NEED TO SEND");
    expect(text).toContain("--- Spokeo ---");
    expect(text).toContain("To: privacy@spokeo.com");
    expect(text).toContain("Subject: Delete request");
    expect(text).toContain("Please delete my data.");
  });

  it("handles user-draft without draftEmail (fallback branches)", () => {
    const text = reportText({
      ...BASE,
      services: [
        {
          name: "UnknownService",
          category: "other",
          action: "user-draft",
          status: "pending-user",
        },
      ],
      totalGuidesGenerated: 1,
    });
    expect(text).toContain("EMAILS YOU NEED TO SEND");
    expect(text).toContain("--- UnknownService ---");
    expect(text).toContain("To: ");
    expect(text).toContain("Subject: ");
  });

  it("renders both draft variants in one report", () => {
    const text = reportText({
      ...BASE,
      services: [
        {
          name: "WithDraft",
          category: "data-broker",
          action: "user-draft",
          status: "pending-user",
          draftEmail: { to: "a@b.com", subject: "Subj", body: "Body text" },
        },
        {
          name: "NoDraft",
          category: "other",
          action: "user-draft",
          status: "pending-user",
        },
      ],
      totalGuidesGenerated: 2,
    });
    expect(text).toContain("WithDraft");
    expect(text).toContain("NoDraft");
    expect(text).toContain("Body text");
  });

  it("includes manual-guide section with steps", () => {
    const text = reportText({
      ...BASE,
      services: [
        {
          name: "Instagram",
          category: "social-media",
          action: "manual-guide",
          status: "pending-user",
          manualSteps: ["Open app", "Go to settings", "Delete account"],
        },
      ],
      totalGuidesGenerated: 1,
    });
    expect(text).toContain("MANUAL DELETION GUIDES");
    expect(text).toContain("--- Instagram ---");
    expect(text).toContain("1. Open app");
    expect(text).toContain("3. Delete account");
  });

  it("handles manual-guide without manualSteps", () => {
    const text = reportText({
      ...BASE,
      services: [
        {
          name: "SomeService",
          category: "other",
          action: "manual-guide",
          status: "pending-user",
        },
      ],
      totalGuidesGenerated: 1,
    });
    expect(text).toContain("MANUAL DELETION GUIDES");
    expect(text).toContain("--- SomeService ---");
  });

  it("redacts email without @ to ***@***", () => {
    const text = reportText({ ...BASE, email: "noemail" });
    expect(text).toContain("***@***");
  });
});
