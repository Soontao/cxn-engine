/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prefer-const */
import { execute } from ".";
import { isRefExpr } from "./expr";
import { processRef } from "./ref";
import { Args, ArrayArgs, Context, func, JSFunction, ref } from "./type";


export function processFunc(funcExpr: func, context: Context) {
  const { func, args } = funcExpr;

  if (args instanceof Array) {
    const arg0 = execute(args[0], context);
    const execFunc = getBuiltInFunction(arg0, func);
    if (execFunc !== undefined) {
      return execFunc(argsToValues(args.slice(1), context));
    }
  }

  if (func in simpleFunctions) {
    const runner: JSFunction = (simpleFunctions as any)[(func as string)];

    if (args instanceof Array) {
      return runner(...argsToValues(args, context));
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
  uuid() { return require("uuid").v4(); },
  nanoid() { return require("nanoid").nanoid(); },
  first(arg0: Array<any>) { return arg0 instanceof Array ? arg0[0] : arg0; },
  last(arg0: Array<any>) { return arg0 instanceof Array ? arg0[arg0.length - 1] : arg0; },
};

function argsToValues(args: ArrayArgs, context: Context) {
  return args.map(argExpr => execute(argExpr, context));
}

const builtInFunctions = new Map<any, Array<string>>();


function getBuiltInFunction(arg0: any, funcName: string): ((parameters: Array<any>) => any) | undefined {

  if (builtInFunctions.size === 0) {
    // lazy init
    for (const Type of BUILT_IN_TYPES) {
      builtInFunctions.set(Type, getBuiltInFunctionList(Type));
    }
  }

  for (const Type of NON_PRIMARY_TYPES) {
    if (arg0 instanceof Type && builtInFunctions.get(Type)?.includes(funcName)) {
      return (parameters: Array<any>) => ((Type as any).prototype[funcName as any] as any).apply(arg0, parameters);
    }
  }

  if (typeof arg0 === "string" && builtInFunctions.get(String)?.includes(funcName)) {
    return (parameters: Array<any>) => ((String as any).prototype[funcName as any] as any).apply(arg0, parameters);
  }

  if (typeof arg0 === "number" && builtInFunctions.get(Number)?.includes(funcName)) {
    return (parameters: Array<any>) => ((Number as any).prototype[funcName as any] as any).apply(arg0, parameters);
  }

}

const getBuiltInFunctionList = (type: any) => Object
  .getOwnPropertyNames(type?.prototype)
  .filter((property: any) => typeof type.prototype[property] === "function");

const PRIMARY_TYPES = [Number, String];

const NON_PRIMARY_TYPES = [Array, Date];

const BUILT_IN_TYPES = [
  ...NON_PRIMARY_TYPES, ...PRIMARY_TYPES
];



const utils = {
  splitAccessObject({ ref }: ref, context: Context) {
    if (ref.length > 1) {
      const targetObject = processRef({ ref: (ref as Array<string>).slice(0, ref.length - 1) }, context);
      const attributeName = ref[ref.length - 1] as string;
      return { targetObject, attributeName };
    } else {
      return { targetObject: context, attributeName: ref[0] as string };
    }
  },
  createAggregationFunction(impl: (targetObject: Array<any>, valueExtractor: (arg0: any) => any) => any) {
    return (args: Args, context: Context) => {
      if (args instanceof Array) {
        if (args.length === 1 && isRefExpr(args[0])) {
          const ref0 = args[0];
          let curValExtractor: JSFunction = cur => cur;
          let { targetObject, attributeName } = utils.splitAccessObject(ref0, context);
          // not array and with attribute
          if (!(targetObject instanceof Array) && attributeName in targetObject) {
            targetObject = targetObject[attributeName];
          } else {
            curValExtractor = (cur) => cur[attributeName];
          }
          if (targetObject instanceof Array) {
            return impl(targetObject, curValExtractor);
          }
          // TODO: throw error
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
