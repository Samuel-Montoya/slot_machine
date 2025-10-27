module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended" // <-- add this
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react-refresh", "react-hooks"], // <-- add this
  rules: {
    "react-refresh/only-export-components": "warn",
    "react/prop-types": 0,
    "no-unused-vars": 1,
    "react-hooks/exhaustive-deps": "off" // now this works
  }
}
