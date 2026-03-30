import type { ReactNode } from "react";

// Root layout is minimal — the [locale] layout provides html/body/providers.
// This exists because Next.js requires a root layout, and API routes
// (which are not under [locale]) need a layout ancestor.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
