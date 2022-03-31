import { execute } from "./index";
import { ref } from "./type";

export function processRef({ ref: refs }: ref, context?: any) {
  let localContext = context;
  for (const ref of refs) {
    if (typeof ref === "string") {
      if (ref in localContext) {
        localContext = localContext[ref];
      }
      // access single object array by attribute
      if (localContext instanceof Array) {
        if (localContext.length === 1 && ref in localContext[0]) {
          localContext = localContext[0][ref];
        } else {
          // TODO: error to access array with attributes name but the array elements are more than one
        }
      }
    }
    if (typeof ref === "object") {
      // cqn4(`foo[9].bar`) == {ref:[{ id:'foo', where:[{val:9}] }, 'bar' ]}
      if (typeof ref.id === "string" && typeof ref.where === "object") {
        const tmpContext = localContext[ref?.id];
        if (tmpContext instanceof Array && ref.where instanceof Array) {
          // c[1] => object
          if (ref.where.length === 1 && typeof ref.where[0]?.val === "number") {
            localContext = tmpContext[ref.where[0].val];
          }
          // c[a=1] => list
          else {
            localContext = tmpContext.filter(tmpContextItem => execute({ xpr: ref.where }, tmpContextItem));
          }
        } else {
          // TODO: error
        }
      }
      // cqn4(`foo(p:x).bar`) == {ref:[{ id:'foo', args:{p:{ref:['x']}} }, 'bar' ]}
      // TODO: support args
    }
  }
  return localContext;
}

