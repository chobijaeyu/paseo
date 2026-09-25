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
});
