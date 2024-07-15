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
    return "localhost";
  }
  if (typeof value !== "string") {
    throw new Error(`Argument -h | --hostname is not a string`);
  }
  return value;
})();
const verbose = (() => {
  const value = argv.v || argv.verbose;
  return Boolean(value);
})();
const command = (() => {
  const value = argv.c || argv.cmd;
  return typeof value === "string" ? value : null;
})();

const shutdown = await Sopsy({file, port, hostname, verbose});

if (command) {
  await $`${command.split(" ")}`;
}

exitHook(() => {
  void shutdown();
});