import { func, ref, val, xpr } from "./type";

export function isRefExpr(expr: any): expr is ref {
  return typeof expr === "object" && "ref" in expr;
}

export function isFuncExpr(expr: any): expr is func {
  return typeof expr === "object" && "func" in expr;
}

export function isXprExpr(expr: any): expr is xpr {
  return typeof expr === "object" && "xpr" in expr;
}

export function isValExpr(expr: any): expr is val {
  return typeof expr === "object" && "val" in expr;
}
