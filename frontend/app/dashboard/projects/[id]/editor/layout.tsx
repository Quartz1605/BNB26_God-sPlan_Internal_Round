export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Editor uses its own full-screen layout, bypassing the dashboard sidebar
  return <>{children}</>;
}
