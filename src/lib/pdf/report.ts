import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

export interface ReportService {
  name: string;
  category: string;
  action: "auto-sent" | "user-draft" | "manual-guide";
  status: "sent" | "pending-user";
  draftEmail?: { to: string; subject: string; body: string };
  manualSteps?: string[];
}

export interface ReportData {
  email: string;
  detonatedAt: string;
  services: ReportService[];
  totalRequestsSent: number;
  totalGuidesGenerated: number;
}

const BG = "#0a0a0a";
const TEXT = "#e8e4de";
const MUTED = "#888888";
const RED = "#c41e1e";
const DIVIDER = "#2a2a2a";

const s = StyleSheet.create({
  page: {
    backgroundColor: BG,
    color: TEXT,
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  logo: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  logoAccent: { color: RED },
  subtitle: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  meta: { fontSize: 9, color: MUTED, marginBottom: 2 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: TEXT,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statLabel: { fontSize: 10, color: MUTED },
  statValue: { fontSize: 10, fontWeight: "bold", color: TEXT },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  serviceName: { fontSize: 10, color: TEXT, width: "40%" },
  serviceCategory: { fontSize: 9, color: MUTED, width: "30%" },
  serviceStatus: { fontSize: 9, width: "30%", textAlign: "right" },
  statusSent: { color: "#4ade80" },
  statusPending: { color: RED },
  draftBlock: {
    backgroundColor: "#111111",
    padding: 12,
    marginBottom: 12,
  },
  draftLabel: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  draftValue: { fontSize: 9, color: TEXT, marginBottom: 8 },
  draftBody: {
    fontSize: 8,
    color: MUTED,
    fontFamily: "Courier",
    lineHeight: 1.5,
  },
  stepNumber: { fontSize: 9, color: RED, fontWeight: "bold" },
  stepText: { fontSize: 9, color: TEXT, marginBottom: 4 },
  footer: {
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    marginTop: 24,
  },
});

function Header({ data }: { data: ReportData }) {
  return React.createElement(View, null,
    React.createElement(Text, { style: s.logo },
      "DEINDEX",
      React.createElement(Text, { style: s.logoAccent }, ".ME"),
    ),
    React.createElement(Text, { style: s.subtitle }, "Detonation Report"),
    React.createElement(Text, { style: s.meta }, `Date: ${data.detonatedAt}`),
    React.createElement(Text, { style: s.meta }, `Email: ${redactEmail(data.email)}`),
    React.createElement(View, { style: s.divider }),
  );
}

function Summary({ data }: { data: ReportData }) {
  return React.createElement(View, null,
    React.createElement(Text, { style: s.sectionTitle }, "Summary"),
    React.createElement(View, { style: s.statRow },
      React.createElement(Text, { style: s.statLabel }, "Deletion requests sent"),
      React.createElement(Text, { style: s.statValue }, String(data.totalRequestsSent)),
    ),
    React.createElement(View, { style: s.statRow },
      React.createElement(Text, { style: s.statLabel }, "Guides requiring your action"),
      React.createElement(Text, { style: s.statValue }, String(data.totalGuidesGenerated)),
    ),
    React.createElement(View, { style: s.statRow },
      React.createElement(Text, { style: s.statLabel }, "Total services targeted"),
      React.createElement(Text, { style: s.statValue }, String(data.services.length)),
    ),
    React.createElement(View, { style: s.divider }),
  );
}

function AutoSentSection({ services }: { services: ReportService[] }) {
  if (services.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(Text, { style: s.sectionTitle }, "Auto-Sent Deletion Requests"),
    ...services.map((svc, i) =>
      React.createElement(View, { key: i, style: s.serviceRow },
        React.createElement(Text, { style: s.serviceName }, svc.name),
        React.createElement(Text, { style: s.serviceCategory }, svc.category),
        React.createElement(Text, { style: [s.serviceStatus, s.statusSent] }, "REQUEST SENT"),
      ),
    ),
    React.createElement(View, { style: s.divider }),
  );
}

function UserDraftSection({ services }: { services: ReportService[] }) {
  if (services.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(Text, { style: s.sectionTitle }, "Emails You Need to Send"),
    React.createElement(Text, { style: { fontSize: 9, color: MUTED, marginBottom: 12 } },
      "Copy and paste each email below. Send from the email address you used with DEINDEX.ME.",
    ),
    ...services.map((svc, i) =>
      React.createElement(View, { key: i, style: s.draftBlock },
        React.createElement(Text, { style: { fontSize: 10, fontWeight: "bold", color: TEXT, marginBottom: 8 } }, svc.name),
        React.createElement(Text, { style: s.draftLabel }, "To"),
        React.createElement(Text, { style: s.draftValue }, svc.draftEmail?.to ?? ""),
        React.createElement(Text, { style: s.draftLabel }, "Subject"),
        React.createElement(Text, { style: s.draftValue }, svc.draftEmail?.subject ?? ""),
        React.createElement(Text, { style: s.draftLabel }, "Body"),
        React.createElement(Text, { style: s.draftBody }, svc.draftEmail?.body ?? ""),
      ),
    ),
    React.createElement(View, { style: s.divider }),
  );
}

function ManualGuideSection({ services }: { services: ReportService[] }) {
  if (services.length === 0) return null;
  return React.createElement(View, null,
    React.createElement(Text, { style: s.sectionTitle }, "Manual Deletion Guides"),
    ...services.map((svc, i) =>
      React.createElement(View, { key: i, style: { marginBottom: 12 } },
        React.createElement(Text, { style: { fontSize: 10, fontWeight: "bold", color: TEXT, marginBottom: 6 } }, svc.name),
        ...(svc.manualSteps ?? []).map((step, j) =>
          React.createElement(View, { key: j, style: { flexDirection: "row", marginBottom: 3, paddingLeft: 8 } },
            React.createElement(Text, { style: s.stepNumber }, `${j + 1}. `),
            React.createElement(Text, { style: s.stepText }, step),
          ),
        ),
      ),
    ),
    React.createElement(View, { style: s.divider }),
  );
}

function LegalFooter() {
  return React.createElement(View, null,
    React.createElement(Text, { style: s.sectionTitle }, "Legal Deadlines"),
    React.createElement(Text, { style: { fontSize: 9, color: MUTED, marginBottom: 4 } },
      "GDPR (EU): Companies must respond within 30 days of receipt.",
    ),
    React.createElement(Text, { style: { fontSize: 9, color: MUTED, marginBottom: 4 } },
      "CCPA (California): Companies must respond within 45 days of receipt.",
    ),
    React.createElement(Text, { style: { fontSize: 9, color: MUTED, marginBottom: 16 } },
      "If a company does not respond within the deadline, you may file a complaint with the relevant supervisory authority (GDPR) or the California Attorney General (CCPA).",
    ),
    React.createElement(View, { style: s.divider }),
    React.createElement(Text, { style: s.footer },
      "DEINDEX.ME \u2014 We have deleted all data associated with this session.",
    ),
    React.createElement(Text, { style: s.footer },
      "Free, open-source. No accounts. No stored data.",
    ),
  );
}

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export async function generateReport(data: ReportData): Promise<Buffer> {
  const autoSent = data.services.filter((svc) => svc.action === "auto-sent");
  const userDrafts = data.services.filter((svc) => svc.action === "user-draft");
  const manualGuides = data.services.filter((svc) => svc.action === "manual-guide");

  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: s.page },
      React.createElement(Header, { data }),
      React.createElement(Summary, { data }),
      React.createElement(AutoSentSection, { services: autoSent }),
      React.createElement(UserDraftSection, { services: userDrafts }),
      React.createElement(ManualGuideSection, { services: manualGuides }),
      React.createElement(LegalFooter, null),
    ),
  );

  return renderToBuffer(doc);
}
