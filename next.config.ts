import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "build",
  trailingSlash: true,
  basePath: "/acampamentomiasma",
};

export default nextConfig;
