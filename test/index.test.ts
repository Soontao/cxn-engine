import cds from "@sap/cds";
import { execute } from "../src";

describe("CXN Test Suite", () => {

  it("should support basic evaluation", () => {
    expect(execute(cds.parse.expr("1"))).toBe(1);
    expect(execute(cds.parse.expr("'v'"))).toBe("v");
    expect(execute(cds.parse.expr("true"))).toBe(true);
    expect(execute(cds.parse.expr("false"))).toBe(false);
    expect(execute(cds.parse.expr("null"))).toBe(null);
    expect(execute(cds.parse.expr("2.32"))).toBe(2.32);
  });

  it("should support basic operator", () => {
    expect(execute(cds.parse.expr("2 * 2 + 1"))).toBe(5);
    expect(execute(cds.parse.expr("2 * (2 + 1)"))).toBe(6);
  });

  it("should support logic operator", () => {

    expect(execute(cds.parse.expr("1 and 1"))).toBe(true);
    expect(execute(cds.parse.expr("0 and 1"))).toBe(false);
    expect(execute(cds.parse.expr("1 and 0"))).toBe(false);
    expect(execute(cds.parse.expr("0 and 0"))).toBe(false);

    expect(execute(cds.parse.expr("1 or 1"))).toBe(true);
    expect(execute(cds.parse.expr("0 or 1"))).toBe(true);
    expect(execute(cds.parse.expr("1 or 0"))).toBe(true);
    expect(execute(cds.parse.expr("0 or 0"))).toBe(false);

  });

  it("should support evaluate reference", () => {
    const ctx = {
      a: ["1", "2", 3, 4],
      b: [{ c: 1 }, { c: 2, name: "a name" }, { c: 3 }],
      c: { d: [{ e: { f: { value: 1 } } }] }
    };
    expect(execute(cds.parse.expr("a"), ctx)).toBe(ctx.a);
    expect(execute(cds.parse.expr("a[0]"), ctx)).toBe(ctx.a[0]);
    expect(execute(cds.parse.expr("a[2]"), ctx)).toBe(ctx.a[2]);
    expect(execute(cds.parse.expr("b[c=2]"), ctx)).toBe(ctx.b[1]);
    expect(execute(cds.parse.expr("b[c=2].name"), ctx)).toBe(ctx.b[1].name);
    expect(execute(cds.parse.expr("c.d[0].e.f.value"), ctx)).toBe(ctx.c.d[0].e.f.value);
  });

});
