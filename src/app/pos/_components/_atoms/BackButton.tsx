"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PropsWithChildren } from "react";

type BackButtonProps = {
  href?: string;        // fallback route if no history
  label?: string;       // a11y label / tooltip
  className?: string;   // optional extra classes
} & PropsWithChildren;

export default function BackButton({
  href = "/pos",
  label = "Back",
  className = "",
  children,
}: BackButtonProps) {

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      prefetch={false}
      className={[
        "group fixed top-3 left-3 md:top-4 md:left-4 z-50",
        "inline-flex items-center gap-2 rounded-full",
        "bg-white/80 backdrop-blur border border-slate-200",
        "shadow-sm hover:shadow-md px-3.5 py-2",
        "text-slate-700 hover:bg-white",
        "transition-colors motion-safe:transition-transform",
        "motion-safe:hover:scale-[1.02] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "touch-manipulation", // better mobile tap response
        className,
      ].join(" ")}
    >
      <FiArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      {/* Show text on sm+ so it's compact on mobile */}
      <span className="hidden sm:inline text-sm font-medium">{children ?? "Back"}</span>
    </Link>
  );
}
