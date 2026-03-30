import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock next/link to render as plain anchors
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// --- About Page ---

import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("renders the page heading", () => {
    render(<AboutPage />);
    expect(screen.getByText("The Cause")).toBeInTheDocument();
  });

  it("renders principle sections", () => {
    render(<AboutPage />);
    expect(screen.getByText("Free forever")).toBeInTheDocument();
    expect(screen.getByText("Open source")).toBeInTheDocument();
    expect(screen.getByText("Stateless")).toBeInTheDocument();
    expect(screen.getByText("No surveillance")).toBeInTheDocument();
  });

  it("renders GitHub link", () => {
    render(<AboutPage />);
    expect(screen.getByText("GitHub Repository")).toBeInTheDocument();
  });

  it("renders press contact", () => {
    render(<AboutPage />);
    expect(screen.getByText("press@deindex.me")).toBeInTheDocument();
  });

  it("links to privacy and terms pages", () => {
    render(<AboutPage />);
    expect(screen.getByText("Privacy Policy")).toHaveAttribute(
      "href",
      "/about/privacy"
    );
    expect(screen.getByText("Terms of Service")).toHaveAttribute(
      "href",
      "/about/terms"
    );
  });
});

// --- Privacy Page ---

import PrivacyPage from "@/app/about/privacy/page";

describe("PrivacyPage", () => {
  it("renders the page heading", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/Last updated March/)).toBeInTheDocument();
  });

  it("renders the short version summary", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/The short version/)).toBeInTheDocument();
  });

  it("renders all 10 sections", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("1. What we collect")).toBeInTheDocument();
    expect(screen.getByText("2. How we use it")).toBeInTheDocument();
    expect(screen.getByText("3. How long we keep it")).toBeInTheDocument();
    expect(screen.getByText("4. What we share")).toBeInTheDocument();
    expect(screen.getByText("5. Cookies")).toBeInTheDocument();
    expect(screen.getByText("6. Analytics")).toBeInTheDocument();
    expect(screen.getByText("7. Third-party services")).toBeInTheDocument();
    expect(screen.getByText("8. Your rights")).toBeInTheDocument();
    expect(screen.getByText("9. Contact")).toBeInTheDocument();
    expect(
      screen.getByText("10. Changes to this policy")
    ).toBeInTheDocument();
  });

  it("renders privacy contact email", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("privacy@deindex.me")).toBeInTheDocument();
  });
});

// --- Terms Page ---

import TermsPage from "@/app/about/terms/page";

describe("TermsPage", () => {
  it("renders the page heading", () => {
    render(<TermsPage />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders last updated date", () => {
    render(<TermsPage />);
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  it("renders the short version summary", () => {
    render(<TermsPage />);
    expect(screen.getByText(/The short version/)).toBeInTheDocument();
  });

  it("renders all 10 sections", () => {
    render(<TermsPage />);
    expect(screen.getByText("1. What we do")).toBeInTheDocument();
    expect(screen.getByText("2. Your authorization")).toBeInTheDocument();
    expect(screen.getByText("3. No guarantees")).toBeInTheDocument();
    expect(screen.getByText("4. Your responsibility")).toBeInTheDocument();
    expect(
      screen.getByText("5. No accounts, no stored data")
    ).toBeInTheDocument();
    expect(screen.getByText("6. Age requirement")).toBeInTheDocument();
    expect(screen.getByText("7. Open source")).toBeInTheDocument();
    expect(screen.getByText("8. Limitation of liability")).toBeInTheDocument();
    expect(
      screen.getByText("9. Changes to these terms")
    ).toBeInTheDocument();
    expect(screen.getByText("10. Contact")).toBeInTheDocument();
  });

  it("renders legal contact email", () => {
    render(<TermsPage />);
    expect(screen.getByText("legal@deindex.me")).toBeInTheDocument();
  });

  it("links to privacy policy", () => {
    render(<TermsPage />);
    const links = screen.getAllByText("Privacy Policy");
    expect(links.some((el) => el.getAttribute("href") === "/about/privacy")).toBe(true);
  });
});

// --- Blog Placeholder Page ---

import BlogPage from "@/app/blog/page";

describe("BlogPage", () => {
  it("renders the page heading", () => {
    render(<BlogPage />);
    expect(screen.getByText("The Movement")).toBeInTheDocument();
  });

  it("renders the coming soon message", () => {
    render(<BlogPage />);
    expect(
      screen.getByText(/The movement is coming/)
    ).toBeInTheDocument();
  });

  it("renders email signup form", () => {
    render(<BlogPage />);
    expect(
      screen.getByPlaceholderText("your@email.com")
    ).toBeInTheDocument();
    expect(screen.getByText("Notify Me")).toBeInTheDocument();
  });

  it("shows confirmation after signup", () => {
    render(<BlogPage />);
    const input = screen.getByPlaceholderText("your@email.com");
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(form);

    expect(
      screen.getByText(/Noted. We will reach out/)
    ).toBeInTheDocument();
  });
});

// --- Donate Page ---

import DonatePage from "@/app/donate/page";

describe("DonatePage", () => {
  it("renders the page heading", () => {
    render(<DonatePage />);
    expect(screen.getByText("Support the Cause")).toBeInTheDocument();
  });

  it("renders suggested amounts", () => {
    render(<DonatePage />);
    expect(screen.getByText("$5")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("renders transparency section", () => {
    render(<DonatePage />);
    expect(screen.getByText(/Where your money goes/)).toBeInTheDocument();
  });

  it("donate button is disabled when no amount selected", () => {
    render(<DonatePage />);
    const btn = screen.getByText("Donate");
    expect(btn).toBeDisabled();
  });

  it("enables donate button after selecting an amount", () => {
    render(<DonatePage />);
    fireEvent.click(screen.getByText("$10"));
    const btn = screen.getByText("Donate");
    expect(btn).not.toBeDisabled();
  });

  it("shows custom input when Custom is clicked", () => {
    render(<DonatePage />);
    fireEvent.click(screen.getByText("Custom"));
    expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument();
  });
});

// --- Footer ---

import Footer from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders all nav links", () => {
    render(<Footer />);
    expect(screen.getByText("Detonate")).toHaveAttribute(
      "href",
      "/detonate"
    );
    expect(screen.getByText("Database")).toHaveAttribute(
      "href",
      "/database"
    );
    expect(screen.getByText("Blog")).toHaveAttribute("href", "/blog");
    expect(screen.getByText("About")).toHaveAttribute("href", "/about");
    expect(screen.getByText("Donate")).toHaveAttribute("href", "/donate");
  });

  it("renders legal links", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy")).toHaveAttribute(
      "href",
      "/about/privacy"
    );
    expect(screen.getByText("Terms")).toHaveAttribute(
      "href",
      "/about/terms"
    );
  });

  it("renders GitHub link", () => {
    render(<Footer />);
    expect(screen.getByText("GitHub")).toHaveAttribute(
      "href",
      "https://github.com/DEINDEX-ME/deindex.me"
    );
  });

  it("renders MIT license text", () => {
    render(<Footer />);
    expect(screen.getByText("MIT License")).toBeInTheDocument();
  });

  it("has footer navigation landmark", () => {
    render(<Footer />);
    expect(
      screen.getByRole("navigation", { name: /footer/i })
    ).toBeInTheDocument();
  });
});
