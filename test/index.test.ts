import cds from "@sap/cds-compiler";
import { execute } from "../src";

const compileCXN = cds.parse.expr;

describe("CXN Test Suite", () => {

  it("should support basic evaluation", () => {
    expect(execute(compileCXN("1"))).toBe(1);
    expect(execute(compileCXN("'v'"))).toBe("v");
    expect(execute(compileCXN("true"))).toBe(true);
    expect(execute(compileCXN("false"))).toBe(false);
    expect(execute(compileCXN("null"))).toBe(null);
    expect(execute(compileCXN("2.32"))).toBe(2.32);
  });

  it("should support basic operator", () => {
    expect(execute(compileCXN("2 * 2 + 1"))).toBe(5);
    expect(execute(compileCXN("2 * (2 + 1)"))).toBe(6);
    expect(execute(compileCXN("2 * (2 - 1)"))).toBe(2);
    expect(execute(compileCXN("2 / (2 - 1)"))).toBe(2);
  });

  it("should support logic operator", () => {

    expect(execute(compileCXN("1 and 1"))).toBe(true);
    expect(execute(compileCXN("0 and 1"))).toBe(false);
    expect(execute(compileCXN("1 and 0"))).toBe(false);
    expect(execute(compileCXN("0 and 0"))).toBe(false);

    expect(execute(compileCXN("1 or 1"))).toBe(true);
    expect(execute(compileCXN("0 or 1"))).toBe(true);
    expect(execute(compileCXN("1 or 0"))).toBe(true);
    expect(execute(compileCXN("0 or 0"))).toBe(false);

  });

  it("should support compare operator", async () => {
    expect(execute(compileCXN("1 = 1"))).toBe(true);
    expect(execute(compileCXN("1 >= 1"))).toBe(true);
    expect(execute(compileCXN("0 > 1"))).toBe(false);
    expect(execute(compileCXN("1 >= 0"))).toBe(true);
    expect(execute(compileCXN("0 != 0"))).toBe(false);

    expect(execute(compileCXN("1 <= 1"))).toBe(true);
    expect(execute(compileCXN("0 < 1"))).toBe(true);
    expect(execute(compileCXN("1 <= 0"))).toBe(false);

    expect(execute(compileCXN("'a' = 'b'"))).toBe(false);
    expect(execute(compileCXN("'a' = 'a'"))).toBe(true);
    expect(execute(compileCXN("'abc' like 'a'"))).toBe(true);
    expect(execute(compileCXN("'abc' like 'ab'"))).toBe(true);
    expect(execute(compileCXN("'abc' like 'abc'"))).toBe(true);
    expect(execute(compileCXN("'abc' like 'abcd'"))).toBe(false);
  });

  it("should support between operator", () => {
    expect(execute(compileCXN("a between 10 and 11"), { a: 10 })).toBe(true);
    expect(execute(compileCXN("a between 10 and 11"), { a: 11 })).toBe(true);
    expect(execute(compileCXN("a between 10 and 11"), { a: 12 })).toBe(false);
    expect(execute(compileCXN("a between 10 and 11"), { a: 9 })).toBe(false);
    expect(execute(compileCXN("a between 10 and 11 and true"), { a: 10 })).toBe(true);
    expect(execute(compileCXN("a between 10 and 11 and false"), { a: 10 })).toBe(false);
  });

  it("should support evaluate reference", () => {
    const ctx = {
      a: ["1", "2", 3, 4],
      b: [{ c: 1 }, { c: 2, name: "a name" }, { c: 3 }],
      c: { d: [{ e: { f: { value: 1 } } }] }
    };
    expect(execute(compileCXN("a"), ctx)).toBe(ctx.a);
    expect(execute(compileCXN("a[0]"), ctx)).toBe(ctx.a[0]);
    expect(execute(compileCXN("a[2]"), ctx)).toBe(ctx.a[2]);
    expect(execute(compileCXN("b[c=2]"), ctx)).toStrictEqual([ctx.b[1]]);
    expect(execute(compileCXN("first(b[c=2])"), ctx)).toBe(ctx.b[1]);
    expect(execute(compileCXN("b[c=2].name"), ctx)).toBe(ctx.b[1].name);
    expect(execute(compileCXN("c.d[0].e.f.value"), ctx)).toBe(ctx.c.d[0].e.f.value);
  });

  it("should support basic functions", () => {
    expect(execute(compileCXN("first(a)"), { a: [1, 2, 3] })).toBe(1);
    expect(execute(compileCXN("first(1)"), { a: 1 })).toBe(1);
    expect(execute(compileCXN("last(a)"), { a: [1, 2, 3] })).toBe(3);
    expect(execute(compileCXN("last(a)"), { a: 3 })).toBe(3);
  });

  it("should support basic aggregation functions (basic)", () => {
    expect(execute(compileCXN("sum(a)"), { a: [11, 12, 13] })).toBe(36);
    expect(execute(compileCXN("avg(a)"), { a: [11, 12, 13] })).toBe(12);
    expect(execute(compileCXN("min(a)"), { a: [13, 11, 12] })).toBe(11);
    expect(execute(compileCXN("max(a)"), { a: [11, 12, 13] })).toBe(13);
  });

  it("should support basic aggregation functions (attribute)", () => {
    expect(execute(compileCXN("sum(a.age)"), { a: [{ age: 11 }, { age: 12 }, { age: 13 }] })).toBe(36);
    expect(execute(compileCXN("avg(a.age)"), { a: [{ age: 11 }, { age: 12 }, { age: 13 }] })).toBe(12);
    expect(execute(compileCXN("sum(a.b[id='target'].c.a.age)"), {
      a: {
        b: [
          {},
          { id: "target", c: { a: [{ age: 11 }, { age: 12 }, { age: 13 }] } }
        ]
      }
    })).toBe(36);
  });

});
