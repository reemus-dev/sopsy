#!/usr/bin/env node

import {$, sleep} from "zx";

import {Hono} from "hono";
import {serve} from "@hono/node-server";
import exitHook from "exit-hook";
import {SecretsManager} from "./sops.js";
import {args} from "./args.js";

const secrets = await SecretsManager.init();
const app = new Hono();

app.get("/:key", async (c) => {
  const key = c.req.param("key");
  console.log(`[Sopsy] GET: ${key}`);
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
  fetch: app.fetch,
  hostname: args.hostname,
  port: args.port,
});

console.log("[Sopsy] Started");

exitHook(() => {
  console.log("[Sopsy] Shutting down");
  void secrets.stop();
  void server.close();
});

while (true) {
  await sleep(1000);
}