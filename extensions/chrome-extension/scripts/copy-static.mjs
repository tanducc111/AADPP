import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDirectory = join(rootDirectory, "public");
const distDirectory = join(rootDirectory, "dist");

await mkdir(distDirectory, { recursive: true });

const publicFiles = await readdir(publicDirectory);

await Promise.all(
  publicFiles.map((fileName) =>
    copyFile(join(publicDirectory, fileName), join(distDirectory, fileName)),
  ),
);
