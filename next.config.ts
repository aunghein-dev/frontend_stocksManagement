import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    domains: ['svmeynesalueoxzhtdqp.supabase.co'], 
  },
};


export default withFlowbiteReact(nextConfig);