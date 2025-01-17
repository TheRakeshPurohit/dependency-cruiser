import { renameSync } from "fs";
import { expect } from "chai";
import extract from "../../src/extract/index.js";
import { createRequireJSON } from "../backwards.utl.mjs";
import normalize from "../../src/main/options/normalize.js";
import normalizeResolveOptions from "../../src/main/resolve-options/normalize.js";

const requireJSON = createRequireJSON(import.meta.url);

describe("extract/index - cache busting", () => {
  it("delivers a different output", () => {
    const lOptions = normalize.normalizeCruiseOptions({
      ruleSet: {
        forbidden: [
          {
            name: "burp-on-core",
            severity: "error",
            from: {},
            to: {
              dependencyTypes: ["core"],
            },
          },
        ],
      },
      validate: true,
      tsPreCompilationDeps: true,
      moduleSystems: ["amd", "cjs", "es6"],
      doNotFollow: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-optional",
          "npm-peer",
          "npm-bundled",
        ],
      },
    });
    const lResolveOptions = normalizeResolveOptions({}, lOptions);
    const lFirstResultFixture = requireJSON(
      "./fixtures/cache-busting-first-tree.json"
    );
    const lSecondResultFixture = requireJSON(
      "./fixtures/cache-busting-second-tree.json"
    );

    renameSync(
      "./test/extract/fixtures/cache-busting-first-tree",
      "./test/extract/fixtures/cache-busting"
    );

    const lFirstResult = extract(
      ["./test/extract/fixtures/cache-busting/index.ts"],
      lOptions,
      lResolveOptions
    );

    renameSync(
      "./test/extract/fixtures/cache-busting",
      "./test/extract/fixtures/cache-busting-first-tree"
    );

    renameSync(
      "./test/extract/fixtures/cache-busting-second-tree",
      "./test/extract/fixtures/cache-busting"
    );

    const lSecondResult = extract(
      ["./test/extract/fixtures/cache-busting/index.ts"],
      lOptions,
      lResolveOptions
    );

    renameSync(
      "./test/extract/fixtures/cache-busting",
      "./test/extract/fixtures/cache-busting-second-tree"
    );

    expect(lFirstResult).to.deep.equal(lFirstResultFixture);
    expect(lSecondResult).to.deep.equal(lSecondResultFixture);
    expect(lSecondResult).to.not.deep.equal(lFirstResult);
  });
});
