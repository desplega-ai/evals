import { execSync } from "child_process";

const output = execSync("ls -la", { encoding: "utf-8" });
console.log(output);
