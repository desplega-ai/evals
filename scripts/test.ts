import { execSync } from "child_process";

try {
  const output = execSync("npx @desplega.ai/qa-use", {
    encoding: "utf-8",
    stdio: "pipe",
    timeout: 60000,
  });
  console.log(output);
} catch (error: any) {
  console.log("=== STDOUT ===");
  console.log(error.stdout || "(empty)");
  console.log("=== STDERR ===");
  console.log(error.stderr || "(empty)");
  console.log("=== EXIT CODE ===");
  console.log(error.status);
}
