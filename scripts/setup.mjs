import { C, parseArgs, runCommand } from './utils.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HELP_MESSAGE = `${C.bold("Setup Arguments:")}
  --help                 ${C.dim("Show this message.")}
  --verbose              ${C.dim("Show command output.")}
  --dep                  ${C.dim("Install NPM dependencies.")}
  --build                ${C.dim("Create build directories.")}
  --platform             ${C.dim("Add Cordova Android 13 platform.")}
  --plugins              ${C.dim("Add Cordova plugins.")}

${C.bold("Default behavior:")}
  ${C.dim("If no arguments are passed, setup runs dep, build, and platform steps.")}

${C.bold("Examples:")}
  npm run setup -- --dep
  npm run setup -- --build --platform
  npm run setup -- --verbose --plugins
`;

setup().catch((error) => {
  console.error(
    C.yellow(C.bold("(!) Cleaning app failed.\n")) +
    (error?.message || String(error)) +
    (error?.cause?.message ?
      (C.dim("caused by:\n") + error.cause.message) : "")
  );
  process.exitCode = 1;
});

async function setup() {
  let { help, verbose, dep, build, platform, plugins } = parseArgs(process);

  if (!!help) return console.log(HELP_MESSAGE);
  if (process.argv.slice(2).length === 0) {
    dep = build = platform = plugins = true;
  }

  const cmdOptions = { verbose: !!verbose };

  console.log(C.bold("Setup starting..."));
  console.log(C.dim(C.yellow("• it may take few minutes to finish.")));

  if (!!build) {
    console.log(C.cyan("\n[i] ") + "Creating build directories.");
    runCommand("mkdir", ["-p", "www/css/build", "www/js/build"], cmdOptions);
    console.log(C.gray("Finished creating with no errors."));
  }

  if (!!dep) {
    console.log(C.cyan("\n[i] ") + "Installing dependencies.");
    runCommand("npm", ["install"], cmdOptions);
    console.log(C.gray("Finished installing with no errors."));
  }

  if (!!platform) {
    console.log(C.cyan("\n[i] ") + "Adding cordova Android 13 platform.");
    runCommand("cordova", ["platform", "add", "android@13"], cmdOptions);
    console.log(C.gray("Cordova finished with no errors."));
  }

  if (!!plugins) {
    const plugins = [
      "cordova-plugin-buildinfo",
      "cordova-plugin-device",
      "cordova-plugin-file"
    ];
  
    const localPlugins =
      (await fs.readdir(path.join(__dirname, "../src/plugins")) || [])
      .filter(plugin => !plugin.startsWith("."));
  
    console.log(C.cyan("\n[i] ") + `Adding cordova plugins (${plugins.length + localPlugins.length}).`);
    plugins.forEach(plugin => {
      runCommand("cordova", ["plugin", "add", plugin], cmdOptions);
      console.log(C.gray(`- Added ${plugin} plugin.`));
    });
    localPlugins.forEach(plugin => {
      runCommand("cordova", ["plugin", "add", `./src/plugins/${plugin}`], cmdOptions);
      console.log(C.gray(`- Added ${plugin} plugin.`));
    });
    console.log(C.gray("Cordova finished with no errors."));
  }

  console.log(C.green("\n<✓> ") + "Setup finished successfully.");
}