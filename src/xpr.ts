import { execute } from "./index";
import type { Operator, xpr } from "./type";

interface OperatorRule { opParts: Array<Operator>, valueNum: number, calculate: (values: Array<any>) => any }

const calculations = {
  in: ([left, right]: Array<any>) => {
    if (right === undefined || right === null) {
      return false;
    }

    if (typeof right?.includes === "function") {
      if (left instanceof Array) {
        for (const item of left) {
          if (!right.includes(item)) {
            return false;
          }
        }
        return true;
      }
      return right.includes(left);
    }
    // TODO: only support array
    return true;
  },
  exists: ([value]: Array<any>) => {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === "string") {
      return value.length > 0;
    }
    if (value instanceof Array) {
      return value.length > 0;
    }
    if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.keys(value).length > 0;
    }
    if (typeof value === "number" || typeof value === "bigint") {
      return value !== 0;
    }
    return true;
  }
};

const opRules: Array<OperatorRule> = [
  {
    opParts: ["not", "between", "and"],
    valueNum: 3,
    calculate: ([value, min, max]) => !(value >= min && value <= max)
  },
  {
    opParts: ["between", "and"],
    valueNum: 3,
    calculate: ([value, min, max]) => value >= min && value <= max
  },
  {
    opParts: ["not", "like"],
    valueNum: 2,
    calculate: ([left, right]) => !(String(left).includes(String(right))), // TODO: undefined
  },
  {
    opParts: ["not", "in"],
    valueNum: 2,
    calculate: (arg0) => !calculations.in(arg0),
  },
  {
    opParts: ["not", "exists"],
    valueNum: 1,
    calculate: (arg0) => !calculations.exists(arg0),
  },
  {
    opParts: ["is", "not", "null"],
    valueNum: 1,
    calculate: ([value]) => value !== null,
  },
  {
    opParts: ["is", "null"],
    valueNum: 1,
    calculate: ([value]) => value === null,
  },
  {
    opParts: ["+"],
    valueNum: 2,
    calculate: ([left, right]) => left + right,
  },
  {
    opParts: ["-"],
    valueNum: 2,
    calculate: ([left, right]) => left - right,
  },
  {
    opParts: ["*"],
    valueNum: 2,
    calculate: ([left, right]) => left * right,
  },
  {
    opParts: ["/"],
    valueNum: 2,
    calculate: ([left, right]) => left / right,
  },
  {
    opParts: ["="],
    valueNum: 2,
    calculate: ([left, right]) => left === right,
  },
  {
    opParts: ["!="],
    valueNum: 2,
    calculate: ([left, right]) => left !== right,
  },
  {
    opParts: [">"],
    valueNum: 2,
    calculate: ([left, right]) => left > right,
  },
  {
    opParts: [">="],
    valueNum: 2,
    calculate: ([left, right]) => left >= right,
  },
  {
    opParts: ["<"],
    valueNum: 2,
    calculate: ([left, right]) => left < right,
  },
  {
    opParts: ["<="],
    valueNum: 2,
    calculate: ([left, right]) => left <= right,
  },
  {
    opParts: ["in"],
    valueNum: 2,
    calculate: calculations.in,
  },
  {
    opParts: ["like"],
    valueNum: 2,
    calculate: ([left, right]) => String(left).includes(String(right)), // TODO: undefined
  },
  {
    opParts: ["and"],
    valueNum: 2,
    calculate: ([left, right]) => Boolean(left) && Boolean(right),
  },
  {
    opParts: ["or"],
    valueNum: 2,
    calculate: ([left, right]) => Boolean(left) || Boolean(right),
  },
  {
    opParts: ["exists"],
    valueNum: 1,
    calculate: calculations.exists
  }
];

class OperatorStore {

  #values: Array<any> = [];

  #ops: Array<Operator> = [];

  public getLastValue() {
    if (this.#values.length > 0) {
      return this.#values[this.#values.length - 1];
    }
    return undefined;
  }

  public addValue(value: any) {
    this.#values.push(value);
    return this;
  }

  public pushOp(op: Operator) {
    this.#ops.push(op);
    return this;
  }

  public acquireOp(opParts: Array<Operator>, valueNum: number): { ok: true, values: Array<any> } | { ok: false } {
    if (this.#ops.length >= opParts.length && this.#values.length >= valueNum) {
      const tmpOps = this.#ops.slice(this.#ops.length - opParts.length);
      for (let idx = 0; idx < tmpOps.length; idx++) {
        const tmpOp = tmpOps[idx];
        if (tmpOp !== opParts[idx]) {
          return { ok: false, };
        }
      }
      const values = this.#values.slice(this.#values.length - valueNum);
      this.#ops = this.#ops.slice(0, this.#ops.length - opParts.length);
      this.#values = this.#values.slice(0, this.#values.length - valueNum);
      return { ok: true, values };
    }
    return { ok: false, };
  }

  public execute() {
    while (true) {
      let executed = false;
      for (const rule of opRules) {
        const acquireResult = this.acquireOp(rule.opParts, rule.valueNum);
        if (acquireResult.ok === true) {
          executed = true;
          this.addValue(rule.calculate(acquireResult.values));
          break;
        }
      }
      if (executed === false) {
        break;
      }
    }

  }

}



/**
 * process Operator Expressions
 * 
 * @param param0 
 * @param context 
 * @returns 
 */
export function processXprNew({ xpr }: xpr, context: any) {
  const store = new OperatorStore();

  for (const iXpr of xpr) {
    if (typeof iXpr === "string") {
      store.pushOp(iXpr);
      continue;
    }
    if (typeof iXpr === "object") {
      const value = execute(iXpr, context);
      store.addValue(value);
      store.execute();
      continue;
    }
  }

  store.execute(); // final execution

  return store.getLastValue();

}


