import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // If you're using a custom domain (spockhart.com), this is fine.
  // If you're NOT using a custom domain and are using github.io/<repo>/,
  // change base to "/Spockhart.com/".
  base: "/"
});
