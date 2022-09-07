/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-var-requires */
import { isBindingParamExpr, isFuncExpr, isRefExpr, isValExpr, isXprExpr } from "./expr";
import { processFunc } from "./func";
import { processRef } from "./ref";
import { processVal } from "./val";
import { processXprV2 } from "./xpr";


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

  if (isValExpr(expr)) {
    return processVal(expr);
  }
  if (isRefExpr(expr)) {
    return processRef(expr, context);
  }
  if (isXprExpr(expr)) {
    return processXprV2(expr, context);
  }
  if (isFuncExpr(expr)) {
    return processFunc(expr as any, context);
  }
  if (isBindingParamExpr(expr)) {
    // TODO: something
  }
  // TODO: throw error

}



export { execute, createEngine };
