import { motion, useReducedMotion } from "framer-motion";
import { FaRegCircleCheck } from "react-icons/fa6";
import type { IconType } from "react-icons";

export default function FeatureCard({
  title,
  icon: Icon,
  content,
  color,
}: {
  title: string;
  icon: IconType;
  content: string;
  color: "blue" | "rose" | "emerald";
}) {
  const prefersReducedMotion = useReducedMotion();
  const scaleOnHover = prefersReducedMotion ? 1 : 1.035;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md focus-within:shadow-md outline-none"
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 bg-slate-50">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{content}</p>

      <div className="mt-5 flex items-center gap-2 text-sm font-medium">
        <FaRegCircleCheck className={`h-4 w-4`} />
        <span className="text-slate-700">Included in all plans</span>
      </div>

      {/* subtle accent ring on hover based on color */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-2 group-hover:ring-${color}-200`}
        aria-hidden
      />
    </motion.article>
  );
}

