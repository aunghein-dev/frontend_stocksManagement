export default function ServicesSection() {
  const items = [
    {
      title: "Data migration",
      desc: "We’ll import products, customers, and historical sales from CSV or your legacy system.",
    },
    {
      title: "Custom integrations",
      desc: "Connect ERPs, accounting, or delivery platforms via secure APIs and webhooks.",
    },
    {
      title: "White‑glove onboarding",
      desc: "Training sessions, environment hardening, and role‑based access set up for your team.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h4 className="font-semibold text-lg">{it.title}</h4>
          <p className="mt-2 text-slate-600">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}