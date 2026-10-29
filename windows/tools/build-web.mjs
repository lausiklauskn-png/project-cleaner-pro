/* Windows-Hülle: dieselben Web-Dateien wie Android (tools/native/prepare-web.mjs) nach windows/dist legen. */
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
execFileSync(process.execPath, [join(WURZEL, "tools", "native", "prepare-web.mjs"), join("windows", "dist")], { stdio: "inherit" });
