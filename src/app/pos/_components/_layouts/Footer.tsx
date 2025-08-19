import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-sm text-slate-600">
          © {new Date().getFullYear()} Openware POS. All rights reserved.
        </div>
        <nav className="flex gap-6 text-sm text-slate-700">
          <Link href="#features" className="hover:text-blue-600">Features</Link>
          <Link href="#services" className="hover:text-blue-600">Services</Link>
          <Link href="#pricing" className="hover:text-blue-600">Pricing</Link>
          <Link href="#faq" className="hover:text-blue-600">FAQ</Link>
        </nav>
      </div>
    </footer>
  );
}

