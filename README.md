# CXN Execution Engine

> general CXN execution engine

[![node-test](https://github.com/Soontao/cxn-engine/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Soontao/cxn-engine/actions/workflows/nodejs.yml)
[![codecov](https://codecov.io/gh/Soontao/cxn-engine/branch/main/graph/badge.svg?token=qNex2ly3RN)](https://codecov.io/gh/Soontao/cxn-engine)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Soontao_cxn-engine&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Soontao_cxn-engine)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Soontao_cxn-engine&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Soontao_cxn-engine)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Soontao_cxn-engine&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Soontao_cxn-engine)

## Get Started

```js
const { execute } = require("cxn-engine")
const cds = require("@sap/cds-compiler");
const compileCXN = cds.parse.expr;

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
```

## Operators

- [x] Logic
- [x] Numeric
  - [ ] Numeric Common Order (`*` and `/` should be calculated firstly)  
- [x] Compare
- [x] Like/Between
- [x] NOT
- [x] IN
- [x] IS

## Reference Evaluation

- [x] Chain
- [x] Deep
- [ ] Where

## Built-in Functions

- [x] first
- [x] last
- [x] sum
- [x] avg
- [x] min
- [x] max
- [ ] assign
- [ ] append
- [ ] groupBy

## Param Binding

- [ ] param binding

## Security

- [ ] disable prototype access
- [ ] execution timeout

## [LICENSE](./LICENSE)
