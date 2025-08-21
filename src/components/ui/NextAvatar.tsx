"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

function normalizeUrl(u?: string | null) {
  if (!u) return "";
  // collapse accidental double slashes except after protocol
  return u.replace(/([^:]\/)\/+/g, "$1");
}

export default function NextAvatar({
  url,
  alt = "user photo",
}: { url?: string | null; alt?: string }) {
  const fallback = "/man.png";
  const [src, setSrc] = useState<string>(normalizeUrl(url) || fallback);

  // update when the incoming url changes
  useEffect(() => {
    setSrc(normalizeUrl(url) || fallback);
  }, [url]);

  return (
    <Image
      className="rounded-full object-cover w-11 h-11"
      height={48}
      width={48}
      src={src}
      alt={alt}
      priority
      unoptimized
      onError={() => setSrc(fallback)}
    />
  );
}
