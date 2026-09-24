import { expect, test } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createTestPaseoDaemon } from "../test-utils/paseo-daemon.js";
import { DaemonClient } from "../test-utils/daemon-client.js";

// Repro for #4427: SDK, CLI, and MCP callers create agents with a prompt but no
// clientMessageId. The fake provider does not echo user messages, so the prompt
// only reaches the timeline if the daemon records it when the turn starts.
for (const clientMessageId of [undefined, "create-msg-1"]) {
  test(`initial prompt reaches the timeline without a provider echo (clientMessageId: ${
    clientMessageId ?? "none"
  })`, async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "initial-prompt-timeline-"));
    const daemon = await createTestPaseoDaemon();
    const client = new DaemonClient({
      url: `ws://127.0.0.1:${daemon.port}/ws`,
    });
    try {
      await client.connect();
      await client.fetchAgents({ subscribe: {} });
      const agent = await client.createAgent({
        provider: "codex",
        cwd,
        initialPrompt: "hello from create",
        ...(clientMessageId ? { clientMessageId } : {}),
      });
      await client.waitForFinish(agent.id, 10_000);

      const timeline = await client.fetchAgentTimeline(agent.id, {
        direction: "tail",
        limit: 0,
      });
      const userMessages = timeline.entries.flatMap((entry) =>
        entry.item.type === "user_message" ? [entry.item.text] : []
      );
      expect(userMessages).toEqual(["hello from create"]);
    } finally {
      await client.close().catch(() => undefined);
      await daemon.close();
      rmSync(cwd, { recursive: true, force: true });
    }
  }, 30_000);
}
