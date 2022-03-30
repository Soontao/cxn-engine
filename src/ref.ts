import { execute } from "./index";
import { _ref } from "./type";

export function processRef(refs: _ref, context: any) {
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
          // c[1]
          if (ref.where.length === 1 && typeof ref.where[0]?.val === "number") {
            localContext = tmpContext[ref.where[0].val];
          }
          // c[a=1]
          else {
            localContext = tmpContext.find(tmpContextItem => execute({ xpr: ref.where }, tmpContextItem));
          }
        } else {
          // TODO: error
        }
      }
    }
  }
  return localContext;
}