import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ['svmeynesalueoxzhtdqp.supabase.co'],
  },
  eslint: {
    ignoreDuringBuilds: false, // ✅ enable ESLint blocking builds
  },
};

export default withFlowbiteReact(nextConfig);
