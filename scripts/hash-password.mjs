// Admin password helper.
//
//   npm run hash-password            Make a hash for ADMIN_PASSWORD_HASH from a password you choose.
//   npm run hash-password -- --check Test a password against the hash in .env.local.
//
// What you type shows as * and is never saved anywhere. Paste the printed hash into Vercel as
// is, and into .env.local with every $ escaped as \$ (the second line printed).
import { stdin, stdout } from "node:process";
import nextEnv from "@next/env";
import bcrypt from "bcryptjs";

let piped;
function pipedLines() {
  piped ??= new Promise((resolve) => {
    let data = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (c) => (data += c));
    stdin.on("end", () => resolve(data.split(/\r?\n/)));
  });
  return piped;
}

function ask(question) {
  return new Promise((resolve) => {
    stdout.write(question);
    if (!stdin.isTTY) {
      // Piped input (no terminal): answer each prompt with the next line.
      pipedLines().then((lines) => {
        stdout.write("\n");
        resolve(lines.shift() ?? "");
      });
      return;
    }
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk) => {
      // A paste arrives as one chunk, so handle it character by character.
      for (const char of chunk) {
        if (char === "\r" || char === "\n" || char === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          stdout.write("\n");
          process.exit(130); // Ctrl+C
        }
        if (char === "\u007f" || char === "\b") {
          if (value.length) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
        } else if (char >= " ") {
          value += char;
          stdout.write("*");
        }
      }
    };
    stdin.on("data", onData);
  });
}

if (process.argv.includes("--check")) {
  nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!/^\$2[aby]\$\d\d\$.{53}$/.test(hash)) {
    console.error("ADMIN_PASSWORD_HASH in .env.local is missing or not a valid hash.");
    process.exit(1);
  }
  const password = await ask("Password to test: ");
  console.log(
    (await bcrypt.compare(password, hash)) ? "Match: this password works with .env.local." : "No match.",
  );
  process.exit(0);
}

const password = await ask("Choose an admin password: ");
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
const confirm = await ask("Type it again: ");
if (confirm !== password) {
  console.error("The passwords don't match. Run the command again.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nFor Vercel (paste as is, no backslashes):");
console.log(hash);
console.log("\nFor .env.local (replace the whole ADMIN_PASSWORD_HASH line with this):");
console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
process.exit(0);
