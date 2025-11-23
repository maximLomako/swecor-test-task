import type { NextConfig } from "next";

const repoBase =
  process.env.NEXT_PUBLIC_BASE_PATH?.replace(/^\/|\/$/g, "") ?? "";
const basePath = repoBase ? `/${repoBase}` : "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
