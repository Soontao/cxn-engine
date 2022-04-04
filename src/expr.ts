import { func, param, ref, val, xpr } from "./type";


export function isBindingParamExpr(expr: any): expr is param {
  return typeof expr === "object" && "ref" in expr && expr?.param === true;
}

export function isRefExpr(expr: any): expr is ref {
  return typeof expr === "object" && "ref" in expr && expr?.param === undefined;
}

export function isFuncExpr(expr: any): expr is func {
  return typeof expr === "object" && "func" in expr;
}

export function isXprExpr(expr: any): expr is xpr {
  return typeof expr === "object" && !("func" in expr) && "xpr" in expr;
}

export function isValExpr(expr: any): expr is val {
  return typeof expr === "object" && "val" in expr;
}
