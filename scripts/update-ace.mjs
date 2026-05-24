import { C, runCommand } from "./utils.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ACE_SOURCE = "node_modules/ace-builds/src-min";
const ACE_DIR = "www/js/ace";

updateACEBuild().catch((error) => {
  console.error(
    C.yellow(C.bold("\n(!) Failed to update ACE build.\n")) +
    (error?.message || String(error)) +
    (error?.cause?.message ?
      (C.dim("caused by:\n") + error.cause.message) : "")
  );
  process.exitCode = 1;
});


async function updateACEBuild() {
  const cmdOptions = { verbose: false };
  console.log(C.bold("Updating ACE build..."));

  console.log(C.cyan("\n[i] ") + "Cleaning ace directory.");
  runCommand("rm", ["-rf", "www/js/ace"], cmdOptions);
  runCommand("mkdir", ["www/js/ace"], cmdOptions);

  console.log(C.cyan("\n[i] ") + "Cloning ace directory.");
  const sourcePath = path.join(__dirname, "..", ACE_SOURCE);
  const dirPath = path.join(__dirname, "..", ACE_DIR);

  const files = await fs.readdir(sourcePath);
  for (const filename of files) {
    const filePath = path.join(sourcePath, filename);
    const destPath = path.join(dirPath, filename);

    if (filename === "snippets" || filename.startsWith("worker-"))
      continue;

    await fs.copyFile(filePath, destPath);
    console.log(C.gray(`- Copied ${filename} file.`));
  }

  console.log(C.green("\n<✓> ") + "Updating finished successfully.");
}