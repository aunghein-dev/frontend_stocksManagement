"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PropsWithChildren } from "react";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
} & PropsWithChildren;

export default function BackButton({
  href = "/",
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
        "fixed top-4 left-4 z-50",
        "inline-flex items-center gap-2 rounded-md",
        "px-3 py-2 text-sm font-medium text-slate-700",
        "hover:rounded-3xl",
        "hover:bg-white active:bg-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className,
      ].join(" ")}
    >
      <FiArrowLeft className="h-5 w-5" />
      <span className="hidden sm:inline">{children ?? "Back"}</span>
    </Link>
  );
}
