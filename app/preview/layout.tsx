import { SandboxBridge } from "@/components/sandbox/SandboxBridge";

/**
 * Wraps every /preview/* screen. The bridge lets the sandbox shell drive the
 * screen (theme today, motion effects next) without the screen knowing a
 * sandbox exists — and it no-ops entirely when this route is opened directly,
 * so the preview stays the clean, shippable deliverable.
 */
export default function PreviewLayout({ children }: LayoutProps<"/preview">) {
  return (
    <>
      {children}
      <SandboxBridge />
    </>
  );
}
