import { execSync } from "child_process";

try {
  const output = execSync("npx --yes @desplega.ai/qa-use 2>&1", {
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 120000,
  });
  console.log(output);
} catch (error) {
  console.log("=== STDOUT ===");
  console.log(error.stdout || "(empty)");
  console.log("=== STDERR ===");
  console.log(error.stderr || "(empty)");
  console.log("=== EXIT CODE ===");
  console.log(error.status);
}
