import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginA11y from "eslint-plugin-jsx-a11y";
import babelParser from "@babel/eslint-parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: babelParser, // Importa directamente el parser
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"], // Habilita JSX
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "jsx-a11y": pluginA11y,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginA11y.configs.recommended.rules,
    },
  },
  pluginJs.configs.recommended, // Configuración básica de JavaScript
];
