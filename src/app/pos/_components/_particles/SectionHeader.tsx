import { FaBolt } from "react-icons/fa";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-10">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <FaBolt /> {eyebrow}
        </div>
      )}
      <h2 className="mt-2 text-3xl font-bold">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600 text-lg">{subtitle}</p>}
    </div>
  );
}
