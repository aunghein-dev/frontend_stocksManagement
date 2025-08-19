export default function FAQ() {
  const items = [
    {
      q: "Does the free plan include inventory?",
      a: "Yes, the Starter plan includes basic inventory with stock counts and simple reporting.",
    },
    {
      q: "Do you support multiple locations?",
      a: "Yes—available on Growth and Scale. Manage per‑location stock and staff roles.",
    },
    {
      q: "Is there an API?",
      a: "Full REST API and webhooks are included on the Scale plan. SDKs are available upon request.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((it, i) => (
        <details key={i} className="group p-6 open:shadow-none">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <span className="font-medium">{it.q}</span>
            <span className="text-slate-500 group-open:rotate-180 transition">⌄</span>
          </summary>
          <p className="mt-3 text-slate-600">{it.a}</p>
        </details>
      ))}
    </div>
  );
}