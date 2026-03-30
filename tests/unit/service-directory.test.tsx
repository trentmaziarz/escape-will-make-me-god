import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServiceDirectory from "@/components/database/ServiceDirectory";
import type { ServiceEntry } from "@/data/services/schema";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      role,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} role={role} {...rest}>
        {children}
      </div>
    ),
  },
}));

const MOCK_SERVICES: ServiceEntry[] = [
  {
    id: "facebook",
    name: "Facebook",
    domain: "facebook.com",
    category: "social-media",
    icon: "FB",
    hibpBreachNames: ["Facebook"],
    deletionMethod: "manual-guide",
    deletionDifficulty: "hard",
    dpoEmail: "dpo@fb.com",
    deletionUrl: "https://www.facebook.com/help/delete_account",
    manualSteps: ["Step 1"],
    gdprApplicable: true,
    ccpaApplicable: true,
    expectedResponseDays: 30,
    resistsRequests: true,
    relistsAfterRemoval: false,
    requiresIdentityVerification: false,
    lastVerified: "2026-03-29",
  },
  {
    id: "x-twitter",
    name: "X / Twitter",
    domain: "x.com",
    category: "social-media",
    icon: "X",
    hibpBreachNames: ["Twitter200M"],
    deletionMethod: "manual-guide",
    deletionDifficulty: "medium",
    dpoEmail: "dpo@x.com",
    deletionUrl: "https://x.com/settings/deactivate",
    manualSteps: ["Step 1"],
    gdprApplicable: true,
    ccpaApplicable: true,
    expectedResponseDays: 30,
    resistsRequests: false,
    relistsAfterRemoval: false,
    requiresIdentityVerification: false,
    lastVerified: "2026-03-29",
  },
  {
    id: "spokeo",
    name: "Spokeo",
    domain: "spokeo.com",
    category: "data-broker",
    icon: "SP",
    hibpBreachNames: [],
    deletionMethod: "auto-email",
    deletionDifficulty: "auto",
    deletionEmail: "customercare@spokeo.com",
    deletionUrl: "https://www.spokeo.com/optout",
    manualSteps: ["Step 1"],
    gdprApplicable: false,
    ccpaApplicable: true,
    expectedResponseDays: 3,
    resistsRequests: false,
    relistsAfterRemoval: true,
    requiresIdentityVerification: false,
    lastVerified: "2026-03-29",
  },
  {
    id: "acxiom",
    name: "Acxiom",
    domain: "acxiom.com",
    category: "data-broker",
    icon: "AX",
    hibpBreachNames: [],
    deletionMethod: "auto-email",
    deletionDifficulty: "auto",
    deletionEmail: "consumeradvo@acxiom.com",
    deletionUrl: "https://isapps.acxiom.com/optout/optout.aspx",
    manualSteps: ["Step 1"],
    gdprApplicable: true,
    ccpaApplicable: true,
    expectedResponseDays: 10,
    resistsRequests: false,
    relistsAfterRemoval: true,
    requiresIdentityVerification: false,
    lastVerified: "2026-03-29",
  },
];

describe("ServiceDirectory", () => {
  it("renders all services", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("X / Twitter")).toBeInTheDocument();
    expect(screen.getByText("Spokeo")).toBeInTheDocument();
    expect(screen.getByText("Acxiom")).toBeInTheDocument();
  });

  it("shows total count", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getByText("4 services found")).toBeInTheDocument();
  });

  it("displays service domains", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getByText("facebook.com")).toBeInTheDocument();
    expect(screen.getByText("spokeo.com")).toBeInTheDocument();
  });

  it("displays difficulty badges", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getByText("HARD")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getAllByText("AUTO")).toHaveLength(
      // 2 data brokers with auto + the ALL filter tab count
      // Actually just the badges — filter tab says "AUTO" is not used
      2
    );
  });

  it("displays response times", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getAllByText("30d")).toHaveLength(2);
    expect(screen.getByText("3d")).toBeInTheDocument();
    expect(screen.getByText("10d")).toBeInTheDocument();
  });

  it("groups services by category", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getByText("SOCIAL MEDIA")).toBeInTheDocument();
    expect(screen.getByText("DATA BROKERS")).toBeInTheDocument();
  });

  it("shows category filter tabs", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(screen.getByRole("tab", { name: /ALL \(4\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /DATA BROKERS \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /SOCIAL MEDIA \(2\)/i })).toBeInTheDocument();
  });

  it("filters by category when tab is clicked", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.click(screen.getByRole("tab", { name: /DATA BROKERS/i }));

    expect(screen.getByText("Spokeo")).toBeInTheDocument();
    expect(screen.getByText("Acxiom")).toBeInTheDocument();
    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();
    expect(screen.queryByText("X / Twitter")).not.toBeInTheDocument();
    expect(screen.getByText("2 services found")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.type(screen.getByLabelText("Search services"), "facebook");

    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.queryByText("Spokeo")).not.toBeInTheDocument();
    expect(screen.queryByText("X / Twitter")).not.toBeInTheDocument();
    expect(screen.getByText("1 service found")).toBeInTheDocument();
  });

  it("search filters by domain", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.type(screen.getByLabelText("Search services"), "x.com");

    expect(screen.getByText("X / Twitter")).toBeInTheDocument();
    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();
  });

  it("search is case-insensitive", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.type(screen.getByLabelText("Search services"), "SPOKEO");

    expect(screen.getByText("Spokeo")).toBeInTheDocument();
  });

  it("shows empty state when no results match", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.type(screen.getByLabelText("Search services"), "nonexistent");

    expect(screen.getByText("No services match your search.")).toBeInTheDocument();
    expect(screen.getByText("0 services found")).toBeInTheDocument();
  });

  it("combines search and category filter", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.click(screen.getByRole("tab", { name: /SOCIAL MEDIA/i }));
    await user.type(screen.getByLabelText("Search services"), "twitter");

    expect(screen.getByText("X / Twitter")).toBeInTheDocument();
    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();
    expect(screen.getByText("1 service found")).toBeInTheDocument();
  });

  it("ALL tab resets category filter", async () => {
    const user = userEvent.setup();
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    await user.click(screen.getByRole("tab", { name: /DATA BROKERS/i }));
    expect(screen.queryByText("Facebook")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /ALL/i }));
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Spokeo")).toBeInTheDocument();
    expect(screen.getByText("4 services found")).toBeInTheDocument();
  });

  it("renders with empty services array", () => {
    render(<ServiceDirectory services={[]} />);

    expect(screen.getByText("0 services found")).toBeInTheDocument();
    expect(screen.getByText("No services match your search.")).toBeInTheDocument();
  });

  it("has accessible search input", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    const input = screen.getByLabelText("Search services");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Search services...");
  });

  it("has accessible service lists", () => {
    render(<ServiceDirectory services={MOCK_SERVICES} />);

    expect(
      screen.getByRole("list", { name: "SOCIAL MEDIA services" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "DATA BROKERS services" })
    ).toBeInTheDocument();
  });
});
