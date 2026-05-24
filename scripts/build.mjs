import { C, parseArgs, choose, runCommand } from "./utils.mjs";

const BUILD_TYPES = ["apk", "aab"];
const HELP_MESSAGE = `${C.bold("Build Arguments:")}
  --help                 ${C.dim("Show this message.")}
  --verbose              ${C.dim("Show command output.")}
  --release              ${C.dim("Build the app on production mode.")}
  --type <value>         ${C.dim(`Cordova build type. Values: ${BUILD_TYPES.join(", ")}`)}
  --skip-webpack         ${C.dim("Skip webpack from building.")}

${C.bold("Examples:")}
  npm run build -- --release --type aab
  npm run build -- --verbose --skip-webpack
`;

build().catch((error) => {
  console.error(
    C.yellow(C.bold("(!) Building app failed.\n")) +
    (error?.message || String(error)) +
    (error?.cause?.message ?
      (C.dim("caused by:\n") + error.cause.message) : "")
  );
  process.exitCode = 1;
});

async function build() {
  const { help, verbose, release, type: buildType, "skip-webpack": skipWebpack } = parseArgs(process);

  if (!!help) return console.log(HELP_MESSAGE);

  const type = choose(buildType ?? BUILD_TYPES[0], BUILD_TYPES);
  const isverbose = !!verbose;
  const isRelease = !!release;

  if (!type) throw new Error(
    `${C.red("<✖>")} Unexpected build type: ${type}.` +
    C.dim("\nUse --help for more information.")
  );

  console.log(
    C.bold("Start Building...\n") +
    C.dim(
      ("• Mode: " + (isRelease ? "production" : "development")) +
      ("\n• Package: " + type.toUpperCase()) +
      (isverbose ? C.yellow("\n• Verbose is enabled, more debug information will show.") : "\t")
    )
  );

  const cmdOptions = { verbose: isverbose };

  if (!!skipWebpack) {
    console.log(C.yellow("\n[i] ") + "Skipping Webpack.");
    console.log(C.gray("Webpack will be skipped and use pervious build."));
  } else {
    console.log(C.cyan("\n[i] ") + "Running Webpack.");
    runCommand("webpack", ["--progress", "--mode", isRelease ? "production" : "development"], cmdOptions);
    console.log(C.gray("Webpack finished with no errors."));
  }

  console.log(C.cyan("\n[i] ") + "Running Cordova.");
  runCommand("cordova", ["prepare"], cmdOptions);

  const buildArgs = ["build", "android"];
  if (isRelease) buildArgs.push("--release");
  if (BUILD_TYPES[1] === type) buildArgs.push("--", "--packageType=bundle");
  runCommand("cordova", buildArgs, cmdOptions);
  console.log(C.gray("Cordova finished with no errors."));

  console.log(C.green("\n<✓> ") + C.bold(type.toUpperCase()) + " build finished successfully.");

  const appBuildPath = isRelease ?
    `./platforms/android/app/build/outputs/apk/release/app-release-unsigned.${type}` :
    `./platforms/android/app/build/outputs/apk/debug/app-debug.${type}`;

  const appPath = `./app${isRelease ? ".release-unsigned": ".debug"}.${type}`;

  runCommand("cp", ["-rf", appBuildPath, appPath], cmdOptions);
  console.log(C.gray(`Copied ${type.toUpperCase()} build to: ${appPath}`));
}

