import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}));

import {
  ContentConflictError,
  ContentValidationError,
  saveContent,
} from "@/lib/content-store";
import { parseSiteContent } from "@/lib/site-content-schema";
import { DEFAULT_CONTENT } from "@/lib/site-content";

let tmpDir = "";

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), "jcf-cms-"));
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("JCF_DATA_DIR", tmpDir);
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  vi.stubEnv("BLOB_STORE_ID", "");
});

afterEach(async () => {
  vi.unstubAllEnvs();
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
});

describe("saveContent", () => {
  it("valide DEFAULT_CONTENT contre le schéma CMS", () => {
    const parsed = parseSiteContent(DEFAULT_CONTENT);
    expect(parsed.ok).toBe(true);
  });
  it("incrémente la version puis renvoie 409 si expectedVersion est périmé", async () => {
    const first = await saveContent(DEFAULT_CONTENT, { expectedVersion: 0 });
    expect(first.version).toBe(1);

    await expect(
      saveContent(DEFAULT_CONTENT, { expectedVersion: 0 }),
    ).rejects.toBeInstanceOf(ContentConflictError);

    const second = await saveContent(DEFAULT_CONTENT, { expectedVersion: 1 });
    expect(second.version).toBe(2);
  });

  it("refuse deux bateaux avec le même slug", async () => {
    const duplicate = structuredClone(DEFAULT_CONTENT);
    const first = duplicate.boats[0];
    const second = duplicate.boats[1];
    if (!first || !second) {
      throw new Error("DEFAULT_CONTENT doit contenir au moins deux bateaux");
    }
    second.slug = first.slug;

    await expect(
      saveContent(duplicate, { expectedVersion: 0 }),
    ).rejects.toBeInstanceOf(ContentValidationError);
  });
});
