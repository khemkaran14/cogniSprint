import { useState } from "react";
import { Facebook, Linkedin, Twitter, Link2 } from "lucide-react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const shareLinks = [
    { icon: Twitter, label: "Share on X", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { icon: Facebook, label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { icon: Linkedin, label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-brand-blue)]">
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <button type="button" onClick={copyLink} aria-label="Copy link" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-brand-blue)]">
        <Link2 className="h-4 w-4" />
      </button>
      {copied ? <span className="text-xs text-[var(--color-success)]">Copied</span> : null}
    </div>
  );
}
