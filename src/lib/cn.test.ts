import { describe, expect, test } from "bun:test";
import { cn } from "./cn";

describe("cn", () => {
  test("joins truthy fragments", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  test("drops falsy fragments", () => {
    expect(cn("a", undefined, "b", null, false)).toBe("a b");
  });

  test("returns an empty string without fragments", () => {
    expect(cn()).toBe("");
  });
});
