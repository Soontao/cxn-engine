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
