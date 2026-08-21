import { describe, expect, it } from "vitest";
import { canAccessDocument } from "./access";

describe("canAccessDocument", () => {
  it("allows the owner to access the document", () => {
    expect(canAccessDocument("owner-1", "owner-1", false)).toBe(true);
  });

  it("allows an explicitly shared user to access the document", () => {
    expect(canAccessDocument("owner-1", "shared-user-1", true)).toBe(true);
  });

  it("denies an unrelated user access to the document", () => {
    expect(canAccessDocument("owner-1", "unrelated-user-1", false)).toBe(
      false
    );
  });
});
