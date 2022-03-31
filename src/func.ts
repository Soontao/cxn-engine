/* eslint-disable prefer-const */
import { execute } from ".";
import { isRefExpr } from "./expr";
import { processRef } from "./ref";
import { Args, func, JSFunction, ref } from "./type";


export function processFunc(funcExpr: func, context: any) {
  const { func, args } = funcExpr;

  if (func in simpleFunctions) {
    const runner: JSFunction = (simpleFunctions as any)[(func as string)];

    if (args instanceof Array) {
      const values = args.map(argExpr => execute(argExpr, context));
      return runner(...values);
    } else {
      const values = Object
        .entries(args)
        .reduce((pre: any, [key, expr]) => { pre[key] = execute(expr, context); return pre; }, {});
      return runner(values);
    }

  }

  if (func in aggregationFunctions) {
    return (aggregationFunctions as any)[func](args, context);
  }

  // TODO: throw error
}

export const simpleFunctions = {
  first(value: Array<any>) { return value instanceof Array ? value[0] : value; },
  last(value: Array<any>) { return value instanceof Array ? value[value.length - 1] : value; },
};

const utils = {
  splitAccessObject({ ref }: ref, context: any) {
    if (ref.length > 1) {
      const targetObject = processRef({ ref: (ref as Array<string>).slice(0, ref.length - 1) }, context);
      const attributeName = ref[ref.length - 1] as string;
      return { targetObject, attributeName };
    } else {
      return { targetObject: context, attributeName: ref[0] as string };
    }
  },
  createAggregationFunction(impl: (targetObject: Array<any>, valueExtractor: (arg0: any) => any) => any) {
    return (args: Args, context: any) => {
      if (args instanceof Array) {
        if (args.length === 1 && isRefExpr(args[0])) {
          const ref0 = args[0];
          let curValExtractor: JSFunction = cur => cur;
          let { targetObject, attributeName } = utils.splitAccessObject(ref0, context);
          // not array and with attribute
          if (!(targetObject instanceof Array) && attributeName in targetObject) {
            targetObject = targetObject[attributeName];
          } else {
            targetObject = targetObject;
            curValExtractor = (cur) => cur[attributeName];
          }
          if (targetObject instanceof Array) {
            return impl(targetObject, curValExtractor);
          }
        }
      }
    };
  }
};

export const aggregationFunctions = {
  sum: utils.createAggregationFunction((targetObject, valueExtractor) => {
    return targetObject.reduce((pre, cur) => pre + valueExtractor(cur), 0);
  }),
  avg: utils.createAggregationFunction((targetObject, valueExtractor) => {
    return targetObject.reduce((pre, cur) => pre + valueExtractor(cur), 0) / targetObject.length;
  }),
  min: utils.createAggregationFunction((targetObject, valueExtractor) => {
    let min = undefined;
    for (const targetItem of targetObject) {
      const value = valueExtractor(targetItem);
      if (min === undefined) {
        min = value;
      }
      if (min > value) {
        min = value;
      }
    }
    return min;
  }),
  max: utils.createAggregationFunction((targetObject, valueExtractor) => {
    let max = undefined;
    for (const targetItem of targetObject) {
      const value = valueExtractor(targetItem);
      if (max === undefined) {
        max = value;
      }
      if (max < value) {
        max = value;
      }
    }
    return max;
  }),
};


export type Functions = keyof typeof simpleFunctions | keyof typeof aggregationFunctions
