import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ['svmeynesalueoxzhtdqp.supabase.co'],
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

export default withFlowbiteReact(nextConfig);
