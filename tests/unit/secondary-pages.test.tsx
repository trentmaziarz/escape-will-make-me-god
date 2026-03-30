import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// --- About Page (async server component) ---

import AboutPage from "@/app/[locale]/about/page";

describe("AboutPage", () => {
  it("renders the page heading", async () => {
    const jsx = await AboutPage();
    render(jsx);
    expect(screen.getByText("The Cause")).toBeInTheDocument();
  });

  it("renders principle sections", async () => {
    const jsx = await AboutPage();
    render(jsx);
    expect(screen.getByText("Free forever")).toBeInTheDocument();
    expect(screen.getByText("Open source")).toBeInTheDocument();
    expect(screen.getByText("Stateless")).toBeInTheDocument();
    expect(screen.getByText("No surveillance")).toBeInTheDocument();
  });

  it("renders GitHub link", async () => {
    const jsx = await AboutPage();
    render(jsx);
    expect(screen.getByText("GitHub Repository")).toBeInTheDocument();
  });

  it("renders press contact", async () => {
    const jsx = await AboutPage();
    render(jsx);
    expect(screen.getByText("press@deindex.me")).toBeInTheDocument();
  });

  it("links to privacy and terms pages", async () => {
    const jsx = await AboutPage();
    render(jsx);
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

// --- Privacy Page (async server component) ---

import PrivacyPage from "@/app/[locale]/about/privacy/page";

describe("PrivacyPage", () => {
  it("renders the page heading", async () => {
    const jsx = await PrivacyPage();
    render(jsx);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders last updated date", async () => {
    const jsx = await PrivacyPage();
    render(jsx);
    expect(screen.getByText(/Last updated March/)).toBeInTheDocument();
  });

  it("renders the short version summary", async () => {
    const jsx = await PrivacyPage();
    render(jsx);
    expect(screen.getByText(/The short version/)).toBeInTheDocument();
  });

  it("renders all 10 sections", async () => {
    const jsx = await PrivacyPage();
    render(jsx);
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

  it("renders privacy contact email", async () => {
    const jsx = await PrivacyPage();
    render(jsx);
    expect(screen.getByText("privacy@deindex.me")).toBeInTheDocument();
  });
});

// --- Terms Page (async server component) ---

import TermsPage from "@/app/[locale]/about/terms/page";

describe("TermsPage", () => {
  it("renders the page heading", async () => {
    const jsx = await TermsPage();
    render(jsx);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders last updated date", async () => {
    const jsx = await TermsPage();
    render(jsx);
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
  });

  it("renders the short version summary", async () => {
    const jsx = await TermsPage();
    render(jsx);
    expect(screen.getByText(/The short version/)).toBeInTheDocument();
  });

  it("renders all 10 sections", async () => {
    const jsx = await TermsPage();
    render(jsx);
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

  it("renders legal contact email", async () => {
    const jsx = await TermsPage();
    render(jsx);
    expect(screen.getByText("legal@deindex.me")).toBeInTheDocument();
  });

  it("links to privacy policy", async () => {
    const jsx = await TermsPage();
    render(jsx);
    const links = screen.getAllByText("Privacy Policy");
    expect(
      links.some((el) => el.getAttribute("href") === "/about/privacy")
    ).toBe(true);
  });
});

// --- Blog (client component) ---

import BlogContent from "@/components/blog/BlogContent";

describe("BlogPage", () => {
  it("renders the page heading", () => {
    render(<BlogContent />);
    expect(screen.getByText("The Movement")).toBeInTheDocument();
  });

  it("renders the coming soon message", () => {
    render(<BlogContent />);
    expect(
      screen.getByText(/The movement is coming/)
    ).toBeInTheDocument();
  });

  it("renders email signup form", () => {
    render(<BlogContent />);
    expect(
      screen.getByPlaceholderText("your@email.com")
    ).toBeInTheDocument();
    expect(screen.getByText("Notify Me")).toBeInTheDocument();
  });

  it("shows confirmation after signup", () => {
    render(<BlogContent />);
    const input = screen.getByPlaceholderText("your@email.com");
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.submit(form);

    expect(
      screen.getByText(/Noted. We will reach out/)
    ).toBeInTheDocument();
  });
});

// --- Donate (client component) ---

import DonateContent from "@/components/donate/DonateContent";

describe("DonatePage", () => {
  it("renders the page heading", () => {
    render(<DonateContent success={false} cancelled={false} />);
    expect(screen.getByText("Support the Cause")).toBeInTheDocument();
  });

  it("renders suggested amounts", () => {
    render(<DonateContent success={false} cancelled={false} />);
    expect(screen.getByText("$5")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("renders transparency section", () => {
    render(<DonateContent success={false} cancelled={false} />);
    expect(screen.getByText(/Where your money goes/)).toBeInTheDocument();
  });

  it("donate button is disabled when no amount selected", () => {
    render(<DonateContent success={false} cancelled={false} />);
    const btn = screen.getByText("Donate");
    expect(btn).toBeDisabled();
  });

  it("enables donate button after selecting an amount", () => {
    render(<DonateContent success={false} cancelled={false} />);
    fireEvent.click(screen.getByText("$10"));
    const btn = screen.getByText("Donate");
    expect(btn).not.toBeDisabled();
  });

  it("shows custom input when Custom is clicked", () => {
    render(<DonateContent success={false} cancelled={false} />);
    fireEvent.click(screen.getByText("Custom"));
    expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument();
  });
});

// --- Footer (async server component) ---

import Footer from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders all nav links", async () => {
    const jsx = await Footer();
    render(jsx);
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

  it("renders legal links", async () => {
    const jsx = await Footer();
    render(jsx);
    expect(screen.getByText("Privacy")).toHaveAttribute(
      "href",
      "/about/privacy"
    );
    expect(screen.getByText("Terms")).toHaveAttribute(
      "href",
      "/about/terms"
    );
  });

  it("renders GitHub link", async () => {
    const jsx = await Footer();
    render(jsx);
    expect(screen.getByText("GitHub")).toHaveAttribute(
      "href",
      "https://github.com/DEINDEX-ME/deindex.me"
    );
  });

  it("renders MIT license text", async () => {
    const jsx = await Footer();
    render(jsx);
    expect(screen.getByText("MIT License")).toBeInTheDocument();
  });

  it("has footer navigation landmark", async () => {
    const jsx = await Footer();
    render(jsx);
    expect(
      screen.getByRole("navigation", { name: /footer/i })
    ).toBeInTheDocument();
  });
});
