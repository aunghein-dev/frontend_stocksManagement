import Link from "next/link";
import type { ReactNode } from "react";
// Optional: enable if you use Next typed routes
// import type { Route } from "next";

type PrimaryButtonProps = {
  // If it's always an in-page anchor, use: href: `#${string}`
  href: string; // or: Route | `#${string}` | URL
  children: ReactNode;
  className?: string;
};

export default function PrimaryButton({ href, children, className }: PrimaryButtonProps) {
  const isHash = typeof href === "string" && href.startsWith("#");

  return (
    <Link
      href={href}
      prefetch={isHash ? false : undefined} // don't prefetch hash links
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white shadow-sm transition hover:scale-[1.02] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
