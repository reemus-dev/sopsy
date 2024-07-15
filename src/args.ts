import {argv, fs} from "zx";

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

export const args = {file, port, hostname};