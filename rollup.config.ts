import type { RollupOptions } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { babel } from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

// import pkg from './package.json' assert { type: 'json' };
const isProduction = false;

const extensions = [".js", ".ts", ".json"];

const config: RollupOptions = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "es",
    },
  ],
  plugins: [
    typescript(),
    resolve({
      extensions,
    }),
    babel({
      include: "src/**/*",
      exclude: "**/node_modules/**",
      babelHelpers: "runtime",
      extensions,
    }),
    commonjs(),
    isProduction ? terser() : null,
  ],
};
const dtsConfig: RollupOptions = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.d.ts",
      format: "es",
    },
  ],
  plugins: [dts()],
};
export default [config, dtsConfig];
