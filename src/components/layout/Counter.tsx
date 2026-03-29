const COUNTER_API =
  process.env.NEXT_PUBLIC_APP_URL || "https://deindex.me";

async function getCount(): Promise<number> {
  try {
    const res = await fetch(`${COUNTER_API}/api/counter`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return 0;
    const data: { count: number } = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Counter() {
  const count = await getCount();

  if (count <= 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[200] font-mono text-[11px] uppercase tracking-[2px] text-text-dim"
      aria-live="polite"
    >
      {count.toLocaleString()} DELETION REQUESTS SENT
    </div>
  );
}
