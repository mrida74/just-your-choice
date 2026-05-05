import http from "http";

async function run() {
  const url = "http://localhost:3000/api/admin/auth/signin";
  const body = JSON.stringify({ email: "admin@example.com", password: "Admin@123456" });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    console.log("Status:", res.status);
    console.log("Headers:");
    for (const [k, v] of res.headers) {
      console.log(`${k}: ${v}`);
    }

    const text = await res.text();
    console.log("\nBody:\n", text);
  } catch (err) {
    console.error("Request error:", err);
    process.exit(1);
  }
}

run();
