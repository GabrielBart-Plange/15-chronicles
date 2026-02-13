const readerUrl = process.env.NEXT_PUBLIC_READER_URL || "http://localhost:3001";

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-[var(--reader-border)] p-6 space-y-4">
      <h2 className="tracking-widest text-sm text-[var(--reader-text)]/70 flex items-center gap-3">
        <div className="relative h-6 w-6 rounded-full bg-gradient-to-br from-[#8b0000] to-[#4a0000] flex items-center justify-center text-[10px] font-serif shadow-[0_2px_10px_rgba(139,0,0,0.5)] border border-[#a52a2a]/30 before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)] overflow-hidden flex-shrink-0">
          <span className="relative z-10 text-[#aa8e45] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">V</span>
        </div>
        VELLUM ARCHIVIST
      </h2>

      <nav className="flex flex-col space-y-2">
        <a href="/creator/dashboard" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Home</a>
        <a href="/creator/dashboard/drafts" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Drafts</a>
        <a href="/creator/dashboard/published" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Published</a>
        <a href="/creator/dashboard/art" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Art</a>
        <a href="/creator/dashboard/settings" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Settings</a>
        <a href="/" className="text-[var(--reader-text)] hover:text-[var(--foreground)] transition-colors">Reader</a>
      </nav>
    </aside>
  );
}
