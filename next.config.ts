import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "build",
  trailingSlash: true,
  basePath: "/nossosegredo",
  assetPrefix: "/nossosegredo",
};

export default nextConfig;
