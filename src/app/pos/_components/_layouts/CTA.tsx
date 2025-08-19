import GhostButton from "../_particles/GhostButton";
import PrimaryButton from "../_particles/PrimaryButton";

export default function CallToAction() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 text-center">
      <h3 className="text-2xl font-semibold">
        Ready to modernize your point‑of‑sale?
      </h3>
      <p className="mt-2 text-slate-600">
        Start free, invite your team, and go live in minutes.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <PrimaryButton href="/signup">Create your account</PrimaryButton>
        <GhostButton href="/contact">Talk to sales</GhostButton>
      </div>
    </div>
  );
}

