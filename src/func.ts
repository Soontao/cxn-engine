import { execute } from ".";
import { _func } from "./type";


export function processFunc(funcExpr: _func, context: any) {
  const { func, args } = funcExpr;
  if (func in functions) {
    const values = args.map(argExpr => execute(argExpr, context));
    return (functions[func] as any)(...values);
  }
  // TODO: throw error
}

export const functions = {
  first(value: Array<any>) { return value instanceof Array ? value[0] : value; },
  last(value: Array<any>) { return value instanceof Array ? value[value.length - 1] : value; }
};
