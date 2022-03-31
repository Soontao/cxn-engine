import { execute } from "./index";
import type { JSFunction, Operator, _xpr } from "./type";

const LOGIC_OPERATORS = ["and", "or"];

const COMPARE_OPERATORS = ["=", "!=", "<", "<=", ">", ">=", "like"];

const SIMPLE_OPERATORS = ["+", "-", "*", "/"];

export function processXpr(xpr: _xpr, context: any) {
  const cal: { exec?: JSFunction, tmp: Array<any> } = { tmp: [] };

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
      }
      if (COMPARE_OPERATORS.includes(iXpr)) {
        applyCompareFunction(cal, iXpr);
      }
      if (LOGIC_OPERATORS.includes(iXpr)) {
        applyLogicFunction(cal, iXpr);
      }
      continue;
    }
  }

  return cal.tmp[0];
}

function applyLogicFunction(cal: { exec?: any; tmp: Array<any>; }, op: Operator) {
  cal.exec = () => {
    if (cal.tmp.length === 2) {
      const [left, right] = cal.tmp;
      switch (op) {
        case "and":
          cal.tmp = [Boolean(left) && Boolean(right)];
          break;
        case "or":
          cal.tmp = [Boolean(left) || Boolean(right)];
          break;
      }
      delete cal.exec;
    }
    // a between 1 and 2
    // { xpr: [ { ref: [ 'a' ] }, 'between', { val: 1 }, 'and', { val: 2 } ] }
    if (cal.tmp.length === 3 && op === "and") {
      const [value, min, max] = cal.tmp;
      cal.tmp = [value >= min && value <= max];
      delete cal.exec;
    }
  };
}

function applyCompareFunction(cal: { exec?: any; tmp: Array<any>; }, op: string) {
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
      }
      delete cal.exec;
    }
  };
}


function applyNumericFunction(cal: { exec?: any; tmp: Array<any>; }, op: string) {
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
