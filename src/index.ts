#!/usr/bin/env node

import {type Context, Hono} from "hono";
import {serve} from "@hono/node-server";
import {SecretsManager} from "./sops.js";

export type SopsyOptions = {
  file: string;
  port: number;
  hostname?: string | null;
  verbose?: boolean | null;
};

export const Sopsy = async (options: SopsyOptions) => {
  const state = {shutdown: false};
  const file = options.file;
  const port = options.port;
  const hostname = options.hostname ?? "127.0.0.1";
  const verbose = options.verbose ?? false;

  const log = verbose ? console.log : () => {};

  const secrets = await SecretsManager.init(file);
  const app = new Hono();

  async function handler(c: Context, key?: string) {
    log(`[SOPSY] GET: ${key || "$ROOT"}`);
    const {type, value} = await secrets.getValue(key);
    if (type === "null") {
      return c.notFound();
    }
    if (type === "scalar") {
      return c.text(String(value));
    }
    return c.json(value as any);
  }

  app.get("/", async (c) => {
    const key = c.req.param("key");
    return await handler(c, key);
  });

  app.get("/:key", async (c) => {
    const key = c.req.param("key");
    return await handler(c, key);
  });

  const server = serve({
    port: port,
    hostname: hostname,
    fetch: app.fetch,
  });

  log("[SOPSY] Started", {
    file,
    hostname,
    port,
  });

  return {
    host: hostname,
    port: port,
    address: `${hostname}:${port}`,
    shutdown: async () => {
      if (state.shutdown) return;
      state.shutdown = true;
      log("[SOPSY] Shutting down...");
      await secrets.stop();
      await new Promise((resolve) => {
        server.close(resolve);
      });
      log("[SOPSY] Shutdown complete");
    },
  };
};

export default Sopsy;
