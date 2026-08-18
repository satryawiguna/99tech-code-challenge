import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";

const openapiPath = path.join(
  __dirname,
  "../../src/interface/http/docs/openapi.yaml",
);

describe("OpenAPI specification", () => {
  it("parses as a valid document", () => {
    const raw = fs.readFileSync(openapiPath, "utf-8");
    const doc = YAML.parse(raw);
    expect(doc.openapi).toBe("3.0.3");
    expect(doc.paths).toBeDefined();
  });

  it("documents exactly the API contract's five approved endpoints", () => {
    const raw = fs.readFileSync(openapiPath, "utf-8");
    const doc = YAML.parse(raw);

    expect(Object.keys(doc.paths).sort()).toEqual([
      "/tickets",
      "/tickets/{id}",
    ]);
    expect(Object.keys(doc.paths["/tickets"]).sort()).toEqual([
      "get",
      "post",
    ]);
    expect(Object.keys(doc.paths["/tickets/{id}"]).sort()).toEqual([
      "delete",
      "get",
      "patch",
    ]);
  });
});
