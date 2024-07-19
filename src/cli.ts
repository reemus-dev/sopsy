import exitHook from "exit-hook";
import {$, argv, fs} from "zx";
import Sopsy from "./index.js";

const file = (() => {
  const value = argv.f || argv.file || process.env.SOPSY_FILE;

  if (typeof value !== "string") {
    throw new Error("Argument -f | --file is required");
  }

  if (!fs.existsSync(value)) {
    throw new Error(`Argument -f | --file does not exists`);
  }

  if (!fs.statSync(value).isFile()) {
    throw new Error(`Argument -f | --file is not a file`);
  }

  return value;
})();
const port = (() => {
  const value = argv.p || argv.port || process.env.SOPSY_PORT;
  try {
    return parseInt(value);
  } catch {
    throw new Error(`Argument -p | --port is not a number`);
  }
})();
const hostname = (() => {
  const value = argv.h || argv.hostname || process.env.SOPSY_HOSTNAME;
  if (typeof value === "undefined") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`Argument -h | --hostname is not a string`);
  }
  return value;
})();
const verbose = (() => {
  const value = argv.v || argv.verbose;
  if (typeof value === "undefined") {
    return null;
  }
  return Boolean(value);
})();

const log = verbose ? console.log : () => {};

const command: unknown[] = Array.isArray(argv._) ? argv._ : [];

const server = await Sopsy({file, port, hostname, verbose});

const cancelExitHook = exitHook(() => {
  void server.shutdown();
});

if (command.length > 0) {
  const cwd = process.cwd();

  log(`CWD: ${cwd}`);

  const proc = await $({
    nothrow: true,
    quiet: true,
    verbose: false,
    cwd: cwd,
    env: {
      ...process.env,
      SOPSY_ADDRESS: server.address,
    },
  })`${command}`;

  const exitCode = proc.exitCode ?? 0;

  console.log(proc.text());

  // Shutdown the server and remove the exit hook
  await server.shutdown();
  cancelExitHook();

  // Exit with the exit code of the command if it isn't 0

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
