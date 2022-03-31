/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
import { isFuncExpr, isRefExpr, isValExpr, isXprExpr } from "./expr";
import { processFunc } from "./func";
import { processRef } from "./ref";
import type { CXN } from "./type";
import { processXpr } from "./xpr";


function createEngine<T extends { [exprName: string]: string }>(config: T): { [key in keyof T]: (context: any) => any } {
  const compiler = require("@sap/cds-compiler");
  return Object
    .entries(config)
    .reduce((pre: any, [exprName, expr]) => {
      const compiledCXN = compiler.parse.expr(expr);
      pre[exprName] = (context: any) => execute(compiledCXN, context);
      return pre;
    }, {}) as any;
}

/**
 * execute CXN expression
 * 
 * @see [CDS Expression Notation (CXN)](https://pages.github.tools.sap/cap/docs/cds/cxn)
 * @param expr compiled CXN expression
 * @param context context
 * @returns 
 */
function execute(expr: any, context?: any): any {

  if (isValidCXN(expr)) {
    if ("val" in expr) {
      return expr.val;
    }
    if ("ref" in expr) {
      return processRef(expr, context);
    }
    if ("xpr" in expr) {
      return processXpr(expr, context);
    }
    if ("func" in expr) {
      return processFunc(expr as any, context);
    }
  } else {
    // TODO: throw error
  }
}


/**
 * 
 * valid CXN
 * 
 * @param expr 
 * @returns 
 */
function isValidCXN(expr: any): expr is CXN {
  return isRefExpr(expr) || isXprExpr(expr) || isValExpr(expr) || isFuncExpr(expr);
}


export { execute, createEngine };
