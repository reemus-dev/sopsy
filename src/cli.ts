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

const command: unknown[] = Array.isArray(argv._) ? argv._ : [];

const server = await Sopsy({file, port, hostname, verbose});

exitHook(() => {
  void server.shutdown();
});

if (command.length > 0) {
  await $({
    env: {
      ...process.env,
      SOPSY_ADDRESS: server.address,
    },
  })`${command}`;
}
