import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-border text-xs text-inksoft flex flex-wrap gap-x-5 gap-y-2">
      <span>© {new Date().getFullYear()} Deux Toits</span>
      <Link href="/mentions-legales" className="underline">Mentions légales</Link>
      <Link href="/cgu" className="underline">Conditions générales</Link>
      <Link href="/confidentialite" className="underline">Confidentialité</Link>
    </footer>
  );
}
