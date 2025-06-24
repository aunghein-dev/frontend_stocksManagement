import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ['svmeynesalueoxzhtdqp.supabase.co'],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ This line disables ESLint blocking builds
  },
};

export default withFlowbiteReact(nextConfig);
