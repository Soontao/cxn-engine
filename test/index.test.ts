import cds from "@sap/cds-compiler";
import { createEngine, execute } from "../src";

const compileCXN = cds.parse.expr;

describe("CXN Test Suite", () => {

  it("should support create engine", () => {
    const engine = createEngine({ isTrue: "a = true" });
    expect(engine.isTrue({ a: true })).toBe(true);
  });

  it("should support basic evaluation", () => {
    expect(execute(compileCXN("1"))).toBe(1);
    expect(execute(compileCXN("'v'"))).toBe("v");
    expect(execute(compileCXN("true"))).toBe(true);
    expect(execute(compileCXN("false"))).toBe(false);
    expect(execute(compileCXN("null"))).toBe(null);
    expect(execute(compileCXN("2.32"))).toBe(2.32);
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

  it("should support exists operator", () => {
    const ctx = {
      a: ["1", "2", 3, 4, [], 0],
      b: [{ c: 1 }, { c: 2, name: "a name" }, { c: 3 }, {}],
      c: { d: [{ e: { f: { value: 1 } } }] },
      e: [],
      f: Symbol("a")
    };

    expect(execute(compileCXN("exists a"), ctx)).toBe(true);
    expect(execute(compileCXN("exists a[0]"), ctx)).toBe(true);
    expect(execute(compileCXN("exists b[0]"), ctx)).toBe(true);
    expect(execute(compileCXN("exists c.d[e.f.value=1]"), ctx)).toBe(true);
    expect(execute(compileCXN("exists f"), ctx)).toBe(true);
    expect(execute(compileCXN("exists a[4]"), ctx)).toBe(false);
    expect(execute(compileCXN("exists a[5]"), ctx)).toBe(false);
    expect(execute(compileCXN("exists a[1000]"), ctx)).toBe(false);
    expect(execute(compileCXN("exists b[3]"), ctx)).toBe(false);
  });

  it("not should support not exists operator", () => {
    const ctx = {
      a: ["1", "2", 3, 4, [], 0],
      b: [{ c: 1 }, { c: 2, name: "a name" }, { c: 3 }, {}],
      c: { d: [{ e: { f: { value: 1 } } }] },
      e: [],
      f: Symbol("a")
    };

    expect(execute(compileCXN("not exists a"), ctx)).toBe(false);
    expect(execute(compileCXN("not exists a[0]"), ctx)).toBe(false);
    expect(execute(compileCXN("not exists b[0]"), ctx)).toBe(false);
    expect(execute(compileCXN("not exists c.d[e.f.value=1]"), ctx)).toBe(false);
    expect(execute(compileCXN("not exists f"), ctx)).toBe(false);
    expect(execute(compileCXN("not exists a[4]"), ctx)).toBe(true);
    expect(execute(compileCXN("not exists a[5]"), ctx)).toBe(true);
    expect(execute(compileCXN("not exists a[1000]"), ctx)).toBe(true);
    expect(execute(compileCXN("not exists b[3]"), ctx)).toBe(true);
  });

  it("should support not like", () => {
    expect(execute(compileCXN("'abc' not like 'a'"))).toBe(false);
    expect(execute(compileCXN("'abc' not like 'ab'"))).toBe(false);
    expect(execute(compileCXN("'abc' not like 'abc'"))).toBe(false);
    expect(execute(compileCXN("'abc' not like 'abcd'"))).toBe(true);
  });

  it("should support between operator", () => {
    expect(execute(compileCXN("a between 10 and 11"), { a: 10 })).toBe(true);
    expect(execute(compileCXN("a between 10 and 11"), { a: 11 })).toBe(true);
    expect(execute(compileCXN("a between 10 and 11"), { a: 12 })).toBe(false);
    expect(execute(compileCXN("a between 10 and 11"), { a: 9 })).toBe(false);
    expect(execute(compileCXN("a between 10 and 11 and true"), { a: 10 })).toBe(true);
    expect(execute(compileCXN("a between 10 and 11 and false"), { a: 10 })).toBe(false);

  });

  it("should support id generator", () => {
    expect(execute(compileCXN("uuid()"))).toHaveLength(36);
    expect(execute(compileCXN("nanoid()"))).toHaveLength(21);
  });

  it("should return null for undefined values", () => {
    const ctx = {
      a: { b: [{ e: [1, 2, 3, { d: 1 }] }] },
      w: "forever",
    };
    expect(execute(compileCXN("acb.c"), ctx)).toBe(null);
    expect(execute(compileCXN("a.b.c"), ctx)).toBe(null);
    expect(execute(compileCXN("w.c"), ctx)).toBe(null);
    expect(execute(compileCXN("w[0]"), ctx)).toBe("f");
    expect(execute(compileCXN("w.c.a"), ctx)).toBe(null);
    expect(execute(compileCXN("a.b[1].a"), ctx)).toBe(null);
    expect(execute(compileCXN("a.b[0].e"), ctx)).not.toBe(null);
  });

  it("should support not between operator", () => {
    expect(execute(compileCXN("a not between 10 and 11"), { a: 10 })).toBe(false);
    expect(execute(compileCXN("a not between 10 and 11"), { a: 9 })).toBe(true);
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

  it("should support __index property", () => {
    const ctx = {
      a: ["1", "2", 3, 4],
    };
    expect(execute(compileCXN("a[__index=1]"), ctx)).toStrictEqual([ctx.a[1]]);
  });

  it("should support __index complex", () => {
    const ctx = {
      a: ["1", "2", 3, 4],
    };
    expect(execute(compileCXN("a[__index=1 or __index=2]"), ctx))
      .toStrictEqual([ctx.a[1], ctx.a[2]]);
  });

  it("should support basic functions", () => {
    expect(execute(compileCXN("first(a)"), { a: [1, 2, 3] })).toBe(1);
    expect(execute(compileCXN("first(1)"), { a: 1 })).toBe(1);
    expect(execute(compileCXN("last(a)"), { a: [1, 2, 3] })).toBe(3);
    expect(execute(compileCXN("last(a)"), { a: 3 })).toBe(3);
  });


  it("should support in operator", () => {
    const ctx = {
      a: 1,
      b: [1, 2],
      c: [1, 2, 3, 4],
      d: [4, 5, 6]
    };

    expect(execute(compileCXN("a in b"), ctx)).toBe(true);
    expect(execute(compileCXN("a in c"), ctx)).toBe(true);
    expect(execute(compileCXN("a in d"), ctx)).toBe(false);
    expect(execute(compileCXN("b in c"), ctx)).toBe(true);
    expect(execute(compileCXN("b in d"), ctx)).toBe(false);
    expect(execute(compileCXN("c in d"), ctx)).toBe(false);

  });

  it("should support not in operator", () => {
    const ctx = {
      a: 1,
      b: [1, 2],
      c: [1, 2, 3, 4],
      d: [4, 5, 6]
    };

    expect(execute(compileCXN("a not in b"), ctx)).toBe(false);
    expect(execute(compileCXN("a not in c"), ctx)).toBe(false);
    expect(execute(compileCXN("a not in d"), ctx)).toBe(true);
    expect(execute(compileCXN("b not in c"), ctx)).toBe(false);
    expect(execute(compileCXN("b not in d"), ctx)).toBe(true);
    expect(execute(compileCXN("c not in d"), ctx)).toBe(true);

  });

  it("should support is null operator", () => {
    const ctx = {
      a: 1,
      b: [1, 2],
      c: [1, 2, 3, 4],
      d: [4, 5, 6]
    };

    expect(execute(compileCXN("a is null"), ctx)).toBe(false);
    expect(execute(compileCXN("a[0] is null"), ctx)).toBe(true);
    expect(execute(compileCXN("c[99] is null"), ctx)).toBe(true);
    expect(execute(compileCXN("a is not null"), ctx)).toBe(true);
    expect(execute(compileCXN("c[3] is not null"), ctx)).toBe(true);
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

  it("should support apply filter by function", () => {
    expect(
      execute(
        compileCXN("first(a.b[first(e) = 10])"),
        {
          a: {
            b: [
              { name: "first one", e: [12, 12, 12] },
              { name: "second one", e: [10, 12, 12] }
            ]
          }
        }
      )
    ).toStrictEqual({ name: "second one", e: [10, 12, 12] });
  });

});
