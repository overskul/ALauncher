import { C, parseArgs, runCommand } from './utils.mjs';

const HELP_MESSAGE = `${C.bold("Clean Arguments:")}
  --help                 ${C.dim("Show this message.")}
  --verbose              ${C.dim("Show command output.")}
  --dep                  ${C.dim("Clean NPM dependencies (node_modules, package-lock.json).")}
  --platform             ${C.dim("Clean Cordova platforms.")}
  --plugins              ${C.dim("Clean Cordova plugins.")}
  --build                ${C.dim("Clean build directories.")}

${C.bold("Default behavior:")}
  ${C.dim("If no arguments are passed, all clean targets are enabled.")}

${C.bold("Examples:")}
  npm run clean -- --dep
  npm run clean -- --platform --plugins
  npm run clean -- --verbose
`;

clean().catch((error) => {
  console.error(
    C.yellow(C.bold("(!) Cleaning app failed.\n")) +
    (error?.message || String(error)) +
    (error?.cause?.message ?
      (C.dim("caused by:\n") + error.cause.message) : "")
  );
  process.exitCode = 1;
});

async function clean() {
  let { help, verbose, dep, platform, plugins, build } = parseArgs(process);

  if (!!help) return console.log(HELP_MESSAGE);
  if (process.argv.slice(2).length === 0) {
    dep = platform = plugins = build = true;
  }

  const cmdOptions = { verbose: !!verbose };
  console.log(C.bold("Cleaning..."));

  if (!!dep) {
    console.log(C.red("\n[i] ") + "Cleaning NPM dependencies.");
    runCommand("rm", ["-rf", "./node_modules", "./package-lock.json"], cmdOptions);
    console.log(C.gray("Finished cleaning with no errors."));
  }

  if (!!platform) {
    console.log(C.red("\n[i] ") + "Cleaning cordova platform.");
    runCommand("rm", ["-rf", "./platforms"], cmdOptions);
    console.log(C.gray("Finished cleaning with no errors."));
  }

  if (!!plugins) {
    console.log(C.red("\n[i] ") + "Cleaning cordova plugins.");
    runCommand("rm", ["-rf", "./plugins"], cmdOptions);
    console.log(C.gray("Finished cleaning with no errors."));
  }

  if (!!build) {
    console.log(C.red("\n[i] ") + "Cleaning build directories.");
    runCommand("rm", ["-rf", "./www/css/build", "./www/js/build"], cmdOptions);
    console.log(C.gray("Finished cleaning with no errors."));
  }

  console.log(C.green("\n<✓> ") + "Cleaning finished successfully.");
}