import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "data/**",
      "private/**",
      "devis/**",
      "public/uploads/**",
      "playwright-report/**",
      "test-results/**",
      ".e2e-data/**",
    ],
  },
];

export default eslintConfig;
