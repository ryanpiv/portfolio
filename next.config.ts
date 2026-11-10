import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

// Sass modules import tokens/mixins by relative path (`@use "../../styles"`);
// Turbopack ignores `sassOptions.includePaths`, so none are configured.
const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

export default withMDX(nextConfig);
