import { spawn } from "node:child_process";

const PORT = process.env.PORT || "3000";
const BASE = `http://127.0.0.1:${PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(hasProcessExited, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (hasProcessExited()) {
      throw new Error("Server process exited before readiness check completed.");
    }
    try {
      const r = await fetch(`${BASE}/`);
      if (r.status < 500) return;
    } catch {
      // retry
    }
    await wait(500);
  }
  throw new Error("Server did not become ready in time.");
}

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    throw error;
  }
}

async function run() {
  let childExited = false;
  let childExitCode = null;
  const child = spawn("npm", ["run", "start"], {
    stdio: "pipe",
    env: { ...process.env, PORT },
  });

  child.on("exit", (code) => {
    childExited = true;
    childExitCode = code;
  });

  child.stdout.on("data", (buf) => process.stdout.write(buf.toString()));
  child.stderr.on("data", (buf) => process.stderr.write(buf.toString()));

  try {
    await waitForServer(() => childExited);

    await check("landing page is reachable", async () => {
      const r = await fetch(`${BASE}/`);
      if (r.status !== 200) throw new Error(`expected 200, got ${r.status}`);
    });

    await check("onboarding route is reachable", async () => {
      const r = await fetch(`${BASE}/onboarding`);
      if (r.status !== 200) throw new Error(`expected 200, got ${r.status}`);
    });

    await check("auth route is reachable", async () => {
      const r = await fetch(`${BASE}/auth`);
      if (r.status !== 200) throw new Error(`expected 200, got ${r.status}`);
    });

    await check("protected profile endpoint requires auth", async () => {
      const r = await fetch(`${BASE}/api/me/profile`);
      if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
    });

    await check("public intake validates consent", async () => {
      const r = await fetch(`${BASE}/api/p/non-existent/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName: "Smoke",
          contactInfo: "smoke@example.com",
          consentToContact: false,
        }),
      });
      if (r.status !== 400) throw new Error(`expected 400, got ${r.status}`);
    });
  } finally {
    if (!childExited) {
      child.kill("SIGINT");
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
