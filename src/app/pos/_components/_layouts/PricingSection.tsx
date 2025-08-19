import { FaRegCircleCheck } from "react-icons/fa6";
import PrimaryButton from "../_particles/PrimaryButton";

export default function PricingSection() {
  const tiers = [
    {
      name: "Free",
      price: "0 MMK",
      period: "/mo",
      cta: "Start Free",
      href: "/signup",
      features: [
        "1 user",
        "500MB storage",
        "No support",
        "Basic versions",
      ],
    },
     {
      name: "Basic",
      price: "6000 Ks",
      period: "/mo",
      cta: "Try Basic",
      href: "/signup",
      featured: true,
      features: [
        "5 users",
        "5GB storage",
        "24/7 support",
        "Basic versions",
      ],
    },
    {
      name: "Pro",
      price: "20000 Ks",
      period: "/mo",
      cta: "Feel Pro",
      href: "/signup",
      features: [
        "20 users",
        "15GB storage",
        "24/7 support",
        "Advanced versions",
      ],
    },
    {
      name: "Business",
      price: "50000 Ks",
      period: "/mo",
      cta: "Contact Sales",
      href: "/contact",
      features: [
        "Unlimited registers",
        "API access & webhooks",
        "50GB storage",
        "Preminum versions",
        "Admin Panel",
        "Customizable"
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4  gap-6">
      {tiers.map((t, i) => (
        <div
          key={i}
          className={`relative rounded-2xl border p-6 shadow-sm bg-white ${
            t.featured
              ? "border-blue-300 ring-1 ring-blue-200"
              : "border-slate-200"
          }`}
        >
          {t.featured && (
            <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              Most Popular
            </span>
          )}

          <h3 className="text-lg font-semibold">{t.name}</h3>
          <div className="mt-4 flex items-end gap-1">
            <span className="text-3xl font-bold">{t.price}</span>
            <span className="text-slate-500">{t.period}</span>
          </div>

          <ul className="mt-4 space-y-2 text-slate-700">
            {t.features.map((f, j) => (
              <li key={j} className="flex items-start gap-2">
                <FaRegCircleCheck className="mt-1 h-4 w-4" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <PrimaryButton href={t.href}>{t.cta}</PrimaryButton>
          </div>
        </div>
      ))}
    </div>
  );
}
