
import cds from "@sap/cds-compiler";
import { execute } from "../src";

const compileCXN = cds.parse.expr;

describe("Function of Array Test Suite", () => {

  const ctx = {
    a: ["1", "2", 3, 4, [], 0],
    b: [{ c: 1 }, { c: 2, name: "a name" }, { c: 3 }, {}],
    c: { d: [{ e: { f: { value: 1 } } }] },
    e: [],
    f: Symbol("a")
  };


  it("should support slice", () => {
    expect(execute(compileCXN("slice(a, 1)"), ctx)).toStrictEqual(ctx.a.slice(1));
    expect(execute(compileCXN("slice(a, 1, 2)"), ctx)).toStrictEqual(ctx.a.slice(1, 2));
  });

  it("should support toUpperCase", () => {
    expect(execute(compileCXN(`toUpperCase('123')`))).toBe("123");
    expect(execute(compileCXN(`toUpperCase('123abc')`))).toBe("123ABC");
  });

  it("should support toFixed", () => {
    expect(execute(compileCXN(`toFixed(1.23243124, 2)`))).toBe("1.23");
  });


});
