import { execSync } from "child_process";

// Print the PATH
console.log("=== PATH ===");
console.log(process.env.PATH);
console.log("");

// List executables in each PATH directory
const pathDirs = (process.env.PATH || "").split(":");
for (const dir of pathDirs) {
  try {
    const files = execSync(`ls "${dir}"`, { encoding: "utf-8" });
    console.log(`\n=== ${dir} ===`);
    console.log(files);
  } catch {
    console.log(`\n=== ${dir} === (not found or empty)`);
  }
}
