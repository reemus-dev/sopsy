#!/usr/bin/env node

import {Hono} from "hono";
import {serve} from "@hono/node-server";
import {SecretsManager} from "./sops.js";
import type {SopsyOptions} from "./types.js";

export const Sopsy = async (options: SopsyOptions) => {
  const file = options.file;
  const port = options.port;
  const hostname = options.hostname ?? "localhost";
  const verbose = options.verbose ?? false;

  const log = verbose ? console.log : () => {};

  const secrets = await SecretsManager.init(file);
  const app = new Hono();

  app.get("/:key", async (c) => {
    const key = c.req.param("key");
    log(`[Sopsy] GET: ${key}`);
    const {type, value} = await secrets.getValue(key);
    if (type === "null") {
      return c.notFound();
    }
    if (type === "scalar") {
      return c.text(String(value));
    }
    return c.json(value as any);
  });

  const server = serve({
    port: port,
    hostname: hostname,
    fetch: app.fetch,
  });

  log("[Sopsy] Started", {
    file,
    hostname,
    port,
  });

  return {
    host: hostname,
    port: port,
    address: `${hostname}:${port}`,
    shutdown: async () => {
      log("[Sopsy] Shutting down...");
      await secrets.stop();
      await new Promise((resolve) => {
        server.close(resolve);
      });
      log("[Sopsy] Shutdown complete");
    },
  };
};

export default Sopsy;
export type * from "./types.js";
