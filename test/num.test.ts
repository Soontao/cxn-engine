
import cds from "@sap/cds-compiler";
import { execute } from "../src";

const compileCXN = cds.parse.expr;

describe("Numeric Test Suite", () => {

  it("should support numeric operator", () => {
    expect(execute(compileCXN("2 * 2 + 1"))).toBe(5);
    expect(execute(compileCXN("2 * (2 + 1)"))).toBe(6);
    expect(execute(compileCXN("2 * (2 - 1)"))).toBe(2);
    expect(execute(compileCXN("2 / (2 - 1)"))).toBe(2);
  });

  it("should support numeric operator in correct order", () => {
    expect(execute(compileCXN("2 + 2 * 1"))).toBe(4);
    expect(execute(compileCXN("2 + (1 * 2) + 2 * 1 - 3 / 0.25"))).toBe(-6);
    expect(execute(compileCXN("2 + 2 / 1"))).toBe(4);
    expect(execute(compileCXN("2 + 2 / 0.5"))).toBe(6);

  });
});
