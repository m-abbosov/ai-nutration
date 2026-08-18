export function AdminFullscreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--adm-bg)" }}>
      <div
        className="h-6 w-6 animate-spin rounded-full border-2"
        style={{ borderColor: "var(--adm-border-strong)", borderTopColor: "var(--adm-accent)" }}
      />
    </div>
  );
}
