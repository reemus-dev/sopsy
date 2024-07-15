import {defineConfig} from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: "esm",
  target: ["node18"],
  splitting: false,
  sourcemap: true,
  clean: true,
});
