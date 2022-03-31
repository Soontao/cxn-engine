import { isFuncExpr, isRefExpr, isValExpr, isXprExpr } from "./expr";
import { processFunc } from "./func";
import { processRef } from "./ref";
import type { CXN } from "./type";
import { processXpr } from "./xpr";

/**
 * execute CXN expression
 * 
 * @param expr compiled CXN expression
 * @param context data context
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


export { execute };
