import { execute } from "./index";
import type { JSFunction, Operator, xpr } from "./type";

const LOGIC_OPERATORS = ["and", "or"];

const COMPARE_OPERATORS = ["=", "!=", "<", "<=", ">", ">=", "like"];

const SIMPLE_OPERATORS = ["+", "-", "*", "/"];

interface XprContext {
  exec?: JSFunction;
  /**
   * store un-processed values
   */
  tmp: Array<any>;
  /**
   * store un-processed operators
   */
  ops: Array<Operator>;
}

export function processXpr({ xpr }: xpr, context: any) {
  const cal: XprContext = { tmp: [], ops: [] };

  for (const iXpr of xpr) {
    if (typeof iXpr === "object") {
      cal.tmp.push(execute(iXpr, context));
      cal.exec?.();
      continue;
    }
    // operator
    if (typeof iXpr === "string") {
      if (SIMPLE_OPERATORS.includes(iXpr)) {
        applyNumericFunction(cal, iXpr);
        continue;
      }
      if (COMPARE_OPERATORS.includes(iXpr)) {
        applyCompareFunction(cal, iXpr);
        continue;
      }
      if (LOGIC_OPERATORS.includes(iXpr)) {
        applyLogicFunction(cal, iXpr);
        continue;
      }
      cal.ops.push(iXpr);
      continue;
    }
  }

  return cal.tmp[0];
}


function applyLogicFunction(cal: XprContext, op: Operator) {
  cal.exec = () => {
    if (cal.tmp.length >= 2) {
      const [left, right] = cal.tmp;
      switch (op) {
        case "and":
          if (cal.ops.length > 0) {
            // a between 1 and 2
            // { xpr: [ { ref: [ 'a' ] }, 'between', { val: 1 }, 'and', { val: 2 } ] }
            if (cal.ops[cal.ops.length - 1] === "between") {
              const [value, min, max] = cal.tmp;
              cal.tmp = [value >= min && value <= max];
              cal.ops = cal.ops.slice(0, cal.ops.length - 1);
            }
            // a not between 1 and 2
            if (cal.ops.length > 0 && cal.ops[cal.ops.length - 1] === "not") {
              cal.tmp = [!cal.tmp[0]];
              cal.ops = cal.ops.slice(0, cal.ops.length - 1);
            }
          } else {
            cal.tmp = [Boolean(left) && Boolean(right)];
          }
          break;
        case "or":
          cal.tmp = [Boolean(left) || Boolean(right)];
          break;
      }
      delete cal.exec;
    }

  };
}

function applyCompareFunction(cal: XprContext, op: string) {
  cal.exec = () => {
    if (cal.tmp.length >= 2) {
      const [left, right] = cal.tmp;
      switch (op) {
        case "=":
          cal.tmp = [left === right];
          break;
        case "!=":
          cal.tmp = [left !== right];
          break;
        case ">":
          cal.tmp = [left > right];
          break;
        case "<":
          cal.tmp = [left < right];
          break;
        case ">=":
          cal.tmp = [left >= right];
          break;
        case "<=":
          cal.tmp = [left <= right];
          break;
        case "like":
          if (typeof left?.includes === "function") {
            cal.tmp = [left.includes(right)];
          }
          cal.tmp = [String(left).includes(String(right))];
          if (cal.ops.length > 0 && cal.ops[cal.ops.length - 1] === "not") {
            cal.tmp = [!cal.tmp[0]];
            cal.ops = cal.ops.slice(0, cal.ops.length - 1);
          }
      }
      delete cal.exec;
    }
  };
}


function applyNumericFunction(cal: XprContext, op: string) {
  cal.exec = () => {
    if (cal.tmp.length >= 2) {
      const [left, right] = cal.tmp;
      switch (op) {
        case "+":
          cal.tmp = [left + right];
          break;
        case "-":
          cal.tmp = [left - right];
          break;
        case "*":
          cal.tmp = [left * right];
          break;
        case "/":
          cal.tmp = [left / right];
          break;
      }
      delete cal.exec;
    }
  };
}
