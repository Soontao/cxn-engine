import type { CXN, JSFunction, _ref, _xpr } from "./type";

const LOGIC_OPERATORS = ["and", "or"];

const COMPARE_OPERATORS = ["=", "!=", "<", "<=", ">", ">="];

const SIMPLE_OPERATORS = ["+", "-", "*", "/"];

/**
 * execute CXN expression
 * 
 * @param expr compiled CXN expression
 * @param context data context
 * @returns 
 */
function execute(expr: any, context?: any) {

  if (isValidCXN(expr)) {
    if ("val" in expr) {
      return expr.val;
    }
    if ("ref" in expr) {
      return processRef(expr.ref, context);
    }
    if ("xpr" in expr) {
      return processXpr(expr.xpr, context);
    }
  } else {
    // TODO: throw error
  }
}

function processRef(refs: _ref, context: any) {
  let localContext = context;
  for (const ref of refs) {
    if (typeof ref === "string") {
      if (ref in localContext) {
        localContext = localContext[ref];
      } else {
        // TODO: error
      }
    }
    if (typeof ref === "object") {
      if (typeof ref.id === "string" && typeof ref.where === "object") {
        const tmpContext = localContext[ref?.id];
        if (tmpContext instanceof Array && ref.where instanceof Array) {
          let localContextNext = undefined;
          // c[1]
          if (ref.where.length === 1 && typeof ref.where[0]?.val === "number") {
            localContextNext = tmpContext[ref.where[0].val];
          }
          // c[a=1]
          else {
            localContextNext = tmpContext.find(tmpContextItem => execute({ xpr: ref.where }, tmpContextItem));
          }
          localContext = localContextNext;
        } else {
          // TODO: error
        }
      }
    }
  }
  return localContext;
}

function processXpr(xpr: _xpr, context: any) {
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

function applyLogicFunction(cal: { exec?: any; tmp: Array<any>; }, op: string) {
  cal.exec = () => {
    if (cal.tmp.length >= 2) {
      switch (op) {
        case "and":
          cal.tmp = [Boolean(cal.tmp[0]) && Boolean(cal.tmp[1])];
          break;
        case "or":
          cal.tmp = [Boolean(cal.tmp[0]) || Boolean(cal.tmp[1])];
          break;
      }
      delete cal.exec;
    }
  };
}

function applyCompareFunction(cal: { exec?: any; tmp: Array<any>; }, op: string) {
  cal.exec = () => {
    if (cal.tmp.length >= 2) {
      switch (op) {
        case "=":
          cal.tmp = [cal.tmp[0] === cal.tmp[1]];
          break;
        case "!=":
          cal.tmp = [cal.tmp[0] !== cal.tmp[1]];
          break;
        case ">":
          cal.tmp = [cal.tmp[0] > cal.tmp[1]];
          break;
        case "<":
          cal.tmp = [cal.tmp[0] < cal.tmp[1]];
          break;
        case ">=":
          cal.tmp = [cal.tmp[0] >= cal.tmp[1]];
          break;
        case "<=":
          cal.tmp = [cal.tmp[0] <= cal.tmp[1]];
          break;
      }
      delete cal.exec;
    }
  };
}


function applyNumericFunction(cal: { exec?: any; tmp: Array<any>; }, op: string) {
  cal.exec = () => {
    if (cal.tmp.length >= 2) {
      switch (op) {
        case "+":
          cal.tmp = [cal.tmp[0] + cal.tmp[1]];
          break;
        case "-":
          cal.tmp = [cal.tmp[0] - cal.tmp[1]];
          break;
        case "*":
          cal.tmp = [cal.tmp[0] * cal.tmp[1]];
          break;
        case "/":
          cal.tmp = [cal.tmp[0] / cal.tmp[1]];
          break;
        default:
          // TODO: warn
          break;
      }
      delete cal.exec;
    }
  };
}

/**
 * 
 * valid CXN
 * 
 * @param expr 
 * @returns 
 */
function isValidCXN(expr: any): expr is CXN {
  // TODO: check the CXN is valid or not
  return true;
}


export { execute };
