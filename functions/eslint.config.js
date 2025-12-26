module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "quotes": ["error", "double"],
      "no-unused-vars": ["warn"],
      "no-console": "off",
    },
  },
  {
    ignores: ["node_modules/**", "lib/**"],
  },
];

