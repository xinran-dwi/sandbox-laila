import Link from "next/link";

const screens = [
  {
    id: "image-detail",
    label: "Image Detail",
    note: "Image viewer, action grid, generated description",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-[22px] font-semibold text-ink">Design Sandbox</h1>
      <p className="mt-2 text-[14px] text-ink-muted">
        Code-based reproductions of the Figma screens, for motion and
        microinteraction exploration.
      </p>

      <ul className="mt-8 space-y-3">
        {screens.map((screen) => (
          <li key={screen.id}>
            <Link
              href={`/sandbox/${screen.id}`}
              className="block rounded-[var(--radius-panel)] border border-subtle bg-card px-5 py-4 transition-colors hover:bg-card-hover"
            >
              <span className="text-[15px] text-ink">{screen.label}</span>
              <span className="mt-1 block text-[12.5px] text-ink-muted">
                {screen.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
