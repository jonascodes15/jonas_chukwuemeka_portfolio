// Prints a bcrypt hash of the admin password for ADMIN_PASSWORD_HASH.
//
// Usage:
//   npm run hash-password
//
// You're asked for the password, and what you type is hidden. It is never written to disk
// or shell history. Paste the printed hash into Vercel as is, and into .env.local with every
// $ escaped as \$ (the second line printed).
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";

function askHidden(question) {
  return new Promise((resolve) => {
    let value = "";
    stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char) => {
      if (char === "\r" || char === "\n" || char === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.off("data", onData);
        stdout.write("\n");
        resolve(value);
      } else if (char === "\u0003") {
        process.exit(130); // Ctrl+C
      } else if (char === "\u007f" || char === "\b") {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    stdin.on("data", onData);
  });
}

const password = await askHidden("Admin password: ");
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
const confirm = await askHidden("Type it again: ");
if (confirm !== password) {
  console.error("The passwords don't match.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nFor Vercel (paste as is):");
console.log(hash);
console.log("\nFor .env.local (each $ escaped):");
console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
