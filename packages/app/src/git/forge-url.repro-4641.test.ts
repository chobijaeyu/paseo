import { describe, expect, it } from "vitest";
import { buildForgeBlobUrl, buildForgeBranchTreeUrl } from "./forge-url";

// Repro for https://github.com/getpaseo/paseo/issues/4641: a Gitea instance whose
// SSH host (git.example.com) differs from the web URL configured in the tea
// login (https://projects.example.com). The source links must use the web host.
describe("#4641 Gitea source links with a split SSH/web host", () => {
  const remoteUrl = "ssh://git@git.example.com:7998/Acme/main.git";

  it("links the branch tree on the tea login's web host", () => {
    expect(buildForgeBranchTreeUrl("gitea", { remoteUrl, branch: "main" })).toBe(
      "https://projects.example.com/Acme/main/src/branch/main",
    );
  });

  it("links a file on the tea login's web host", () => {
    expect(buildForgeBlobUrl("gitea", { remoteUrl, branch: "main", path: "README.md" })).toBe(
      "https://projects.example.com/Acme/main/src/branch/main/README.md",
    );
  });
});
