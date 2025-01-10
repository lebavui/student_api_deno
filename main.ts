import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";

const app = new Hono();
const kv = await Deno.openKv();

// Redirect root URL
app.get("/", (c) => c.redirect("/students"));

// List all students
app.get("/students", async (c) => {
  const iter = await kv.list({ prefix: ["students"] });
  const students = [];
  for await (const res of iter) students.push(res);

  return c.json(students);
});

// Create a student (POST body is JSON)
app.post("/students", async (c) => {
  const body = await c.req.json();
  const result = await kv.set(["students", body.mssv], body);
  return c.json(result);
});

// Get a student by mssv
app.get("/students/:mssv", async (c) => {
  const mssv = c.req.param("mssv");
  const result = await kv.get(["students", mssv]);
  return c.json(result);
});

// Delete a student by mssv
app.delete("/students/:mssv", async (c) => {
  const mssv = c.req.param("mssv");
  await kv.delete(["students", mssv]);
  return c.text("");
});

Deno.serve(app.fetch);