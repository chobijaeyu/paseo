import { describe, expect, it } from "vitest";
import { resetCredentialsForPairingTarget } from "./pair-link-credentials";

describe("pairing target password", () => {
  it("clears the password and hides its input when switching hosts", () => {
    const first = "relay://relay.example:443/srv_a?key=AAAA&ssl=true";
    const second = "relay://relay.example:443/srv_b?key=BBBB&ssl=true";
    expect(resetCredentialsForPairingTarget(first, second)).toEqual({
      password: "",
      needsPassword: false,
    });
    expect(resetCredentialsForPairingTarget(first, first)).toBeNull();
  });

  it("clears the direct form credential when its advanced URI changes to a relay target", () => {
    expect(
      resetCredentialsForPairingTarget(
        "tcp://old.example:6767?password=old-secret",
        "relay://relay.example:443/srv_new?key=BBBB&ssl=true",
      ),
    ).toEqual({ password: "", needsPassword: false });
  });
});
