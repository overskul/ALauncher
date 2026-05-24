import { spawnSync } from "node:child_process";

export const C = {
  reset: "\x1b[0m",
  bold: (t) => "\x1b[1m" + t + C.reset,
  dim: (t) => "\x1b[2m" + t + C.reset,
  red: (t) => "\x1b[31m" + t + C.reset,
  green: (t) => "\x1b[32m" + t + C.reset,
  yellow: (t) => "\x1b[33m" + t + C.reset,
  cyan: (t) => "\x1b[36m" + t + C.reset,
  gray: (t) => "\x1b[90m" + t + C.reset,
};

export function parseArgs(process) {
  const args = process.argv;
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const value = args[i + 1]?.startsWith("--") ? true : args[++i] ?? true;
    result[arg.slice(2)] = value;
  }
  return result;
}

export function choose(choice, choices) {
  if (typeof choice !== "string") return;

  const value = choice.trim().toLowerCase();
  if (!value) return;

  return (
    choices.find((c) => c === value) ||
    choices.find((c) => c.startsWith(value)) ||
    null
  );
}

export function runCommand(command, args = [], { verbose = false } = {}) {
  if (verbose)
    console.log(C.dim(`${command} ${args.join(" ")}\n`));

  const result = spawnSync(command, args, {
    stdio: verbose ? "inherit" : ["ignore", "pipe", "pipe"],
    shell: false,
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(
      `${command} failed to start: ${result.error.message}`, 
      { cause: result.error }
    );
  }
  if (result.status !== 0) {
    const stdout = result.stdout ? `\n${result.stdout.trim()}` : "";
    const stderr = result.stderr ? `\n${result.stderr.trim()}` : "";
    throw new Error(
      `${command} exited with code ${result.status}.${stderr || stdout}`
    );
  }

  if (verbose) console.log(`\n`);
  return result.stdout || "";
}