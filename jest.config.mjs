import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jest-fixed-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@data/(.*)$": "<rootDir>/src/data/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@msw/(.*)$": "<rootDir>/src/msw/$1",
    "^@content/(.*)$": "<rootDir>/src/content/$1",
    "\\.mdx$": "<rootDir>/jest.mdx-stub.tsx",
  },
};

async function jestConfig() {
  const nextConfig = await createJestConfig(config)();
  nextConfig.transformIgnorePatterns = [
    "/node_modules/(?!(.pnpm|msw|@mswjs|rettime|until-async|is-node-process|outvariant)/)",
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return nextConfig;
}

export default jestConfig;
