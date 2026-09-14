import { SandboxShell } from "@/components/sandbox/SandboxShell";

export default async function SandboxPage({
  params,
}: PageProps<"/sandbox/[screen]">) {
  const { screen } = await params;
  return <SandboxShell screen={screen} />;
}
