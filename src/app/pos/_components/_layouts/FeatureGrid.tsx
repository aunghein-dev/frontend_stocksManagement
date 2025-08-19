import FeatureCard from "../_atoms/FeatureCard";
import FEATURES from "../_data/Features";

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {FEATURES.map((f, idx) => (
        <FeatureCard key={idx} {...f} />
      ))}
    </div>
  );
}
