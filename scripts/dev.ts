// scripts/dev.ts — runs both HackMaxx backend (:3011) and web frontend (:3000) concurrently
import { spawn } from "bun";

console.log("\x1b[36m%s\x1b[0m", "⚡ Starting HackMaxx full stack development environment...");
console.log("\x1b[90m%s\x1b[0m", "   • Backend API: http://localhost:3011");
console.log("\x1b[90m%s\x1b[0m", "   • Web App:     http://localhost:3000\n");

const backend = spawn(["bun", "run", "--cwd", "backend", "dev"], {
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
  env: { ...process.env, PORT: "3011" },
});

const web = spawn(["bun", "run", "--cwd", "web", "dev"], {
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
  env: { ...process.env, NEXT_PUBLIC_API_BASE_URL: "http://localhost:3011" },
});

function cleanup() {
  console.log("\n\x1b[33m%s\x1b[0m", "Shutting down HackMaxx backend & frontend...");
  try { backend.kill(); } catch {}
  try { web.kill(); } catch {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

await Promise.race([backend.exited, web.exited]);
cleanup();
