import type { NextConfig } from "next";

const nextConfig = {
  output: "export",
  basePath: "/habit", // 실제 레포지토리명으로 변경
  assetPrefix: "https://somniarch.github.io/habit", // 실제 깃허브 아이디/레포지토리명으로 변경
  // 기타 옵션
};

export default nextConfig;
