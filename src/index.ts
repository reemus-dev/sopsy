#!/usr/bin/env node

import { $ } from "zx";

console.log(await $`echo "Hello, world!"`);