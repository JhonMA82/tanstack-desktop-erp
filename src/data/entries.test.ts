import { beforeEach, describe, expect, test } from "bun:test";
import { ApiError } from "@/lib/api";
import {
  archiveEntry,
  createEntry,
  type EntryInput,
  entryInputSchema,
  fetchEntry,
  fetchEntryList,
  resetEntryStore,
  updateEntry,
} from "./entries";

const INPUT: EntryInput = {
  date: "2024-12-01",
  description: "Client invoice — December",
  account: "1100 Receivables",
  amountCents: 425000,
  status: "DRAFT",
};

/**
 * The mock adapter keeps a session store, so each test resets it: these tests cover
 * the write path (create, update, archive) and the contract that guards it.
 */
beforeEach(() => {
  resetEntryStore();
});

describe("entries contract", () => {
  test("rejects a malformed date, an empty description and a zero amount", () => {
    const result = entryInputSchema.safeParse({
      date: "01/12/2024",
      description: "   ",
      account: "1100",
      amountCents: 0,
      status: "DRAFT",
    });

    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path.join(".")) ?? [];
    expect(fields).toContain("date");
    expect(fields).toContain("description");
    expect(fields).toContain("amountCents");
  });

  test("rejects fractional cents", () => {
    expect(entryInputSchema.safeParse({ ...INPUT, amountCents: 42.5 }).success).toBe(false);
  });
});

describe("mock write path", () => {
  test("creates an entry with the next id and lists it first", async () => {
    const created = await createEntry(INPUT);

    expect(created.id).toBe("ENT-1043");
    expect(created.status).toBe("DRAFT");

    const data = await fetchEntryList();
    expect(data.entries[0]?.id).toBe("ENT-1043");
    expect(data.entries).toHaveLength(7);
    expect(data.totalLabel).toBe("7 ENTRIES");
  });

  test("updates an entry in place", async () => {
    const updated = await updateEntry("ENT-1042", {
      ...INPUT,
      description: "Vendor invoice — edited",
    });

    expect(updated.id).toBe("ENT-1042");
    expect(updated.description).toBe("Vendor invoice — edited");
    expect((await fetchEntry("ENT-1042")).description).toBe("Vendor invoice — edited");
  });

  test("archives instead of deleting", async () => {
    const archived = await archiveEntry("ENT-1041");

    expect(archived.status).toBe("ARCHIVED");
    // The row is still there: an accountant never loses a line.
    const data = await fetchEntryList();
    expect(data.entries).toHaveLength(6);
    expect(data.entries.find((row) => row.id === "ENT-1041")?.status).toBe("ARCHIVED");
  });

  test("reads one entry and reports a missing id as ApiError", async () => {
    expect((await fetchEntry("ENT-1038")).description).toBe("Bank fees");

    const failure = fetchEntry("ENT-0000");
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ status: 404 });
  });

  test("rejects an invalid payload before writing", async () => {
    await expect(createEntry({ ...INPUT, amountCents: -1 })).rejects.toBeDefined();
    expect((await fetchEntryList()).entries).toHaveLength(6);
  });
});
