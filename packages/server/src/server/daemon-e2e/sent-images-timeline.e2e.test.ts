import { afterEach, beforeEach, expect, test } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { createDaemonTestContext, type DaemonTestContext } from "../test-utils/index.js";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

let ctx: DaemonTestContext;
let cwd: string;

beforeEach(async () => {
  ctx = await createDaemonTestContext();
  cwd = mkdtempSync(path.join(tmpdir(), "sent-images-timeline-"));
});

afterEach(async () => {
  await ctx.cleanup();
  rmSync(cwd, { recursive: true, force: true });
}, 60_000);

test("the timeline row for a message sent with images carries those images", async () => {
  const agent = await ctx.client.createAgent({ provider: "claude", cwd, title: "images" });

  await ctx.client.sendMessage(agent.id, "test image", {
    images: [{ data: PNG_BASE64, mimeType: "image/png" }],
  });
  await ctx.client.waitForFinish(agent.id, 30_000);

  const timeline = await ctx.client.fetchAgentTimeline(agent.id, {
    direction: "tail",
    limit: 0,
    projection: "canonical",
  });
  const userRow = timeline.entries
    .map((entry) => entry.item)
    .find((item) => item.type === "user_message" && item.text === "test image");

  expect(userRow).toBeDefined();
  expect(userRow).toMatchObject({ images: [{ mimeType: "image/png" }] });
}, 60_000);
