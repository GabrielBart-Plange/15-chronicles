const readerUrl = process.env.NEXT_PUBLIC_READER_URL || "http://localhost:3001";

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-[var(--reader-border)] p-6 space-y-4">
      <h2 className="tracking-widest text-sm text-[var(--reader-text)]/70">
        .15 ARCHIVIST
      </h2>

      <nav className="flex flex-col space-y-2">
        <a href="/dashboard" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Home</a>
        <a href="/dashboard/drafts" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Drafts</a>
        <a href="/dashboard/published" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Published</a>
        <a href="/dashboard/profile" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Profile</a>
        <a href="/dashboard/art" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Art</a>
        <a href="/dashboard/settings" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Settings</a>
        <a href="/portal" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Portal</a>
        <a href={readerUrl} className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Reader</a>
      </nav>
    </aside>
  );
}
