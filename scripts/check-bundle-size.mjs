import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const distFile = path.resolve(process.cwd(), "dist", "org-header-react.js");
const maxBytes = Number(process.env.BUNDLE_MAX_BYTES || 550000);

if (!fs.existsSync(distFile)) {
  console.error(`[bundle-size] Missing build artifact: ${distFile}`);
  process.exit(1);
}

const sizeBytes = fs.statSync(distFile).size;
const sizeKb = (sizeBytes / 1024).toFixed(2);
const maxKb = (maxBytes / 1024).toFixed(2);

if (sizeBytes > maxBytes) {
  console.error(
    `[bundle-size] FAIL: ${sizeKb} KiB exceeds limit ${maxKb} KiB (${maxBytes} bytes)`
  );
  process.exit(1);
}

console.log(
  `[bundle-size] PASS: ${sizeKb} KiB within limit ${maxKb} KiB (${maxBytes} bytes)`
);
