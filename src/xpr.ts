import { isCXNExpr } from "./expr";
import { execute } from "./index";
import type { Operator, xpr, _xpr } from "./type";

interface OperatorRule {
  opParts: Array<Operator>,
  valueNum: number,
  priority?: number,
  valueStartIndex?: number,
  valueEndIndex?: number,
  calculate: (values: Array<any>) => any,
}

const OperatorRuleDefault: Partial<OperatorRule> = {
  valueStartIndex: -1,
  valueEndIndex: 1,
  priority: 0
};

const calculations = {
  in: ([left, right]: Array<any>) => {
    if (right === undefined || right === null) {
      return false;
    }

    if (typeof right?.includes === "function") {
      if (left instanceof Array) {
        for (const item of left) {
          if (!right.includes(item)) {
            return false;
          }
        }
        return true;
      }
      return right.includes(left);
    }
    // TODO: only support array
    return true;
  },
  exists: ([value]: Array<any>) => {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === "string") {
      return value.length > 0;
    }
    if (value instanceof Array) {
      return value.length > 0;
    }
    if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.keys(value).length > 0;
    }
    if (typeof value === "number" || typeof value === "bigint") {
      return value !== 0;
    }
    return true;
  }
};

const opRules: Array<OperatorRule> = [
  {
    opParts: ["not", "between", "and"],
    priority: 20,
    valueNum: 3,
    calculate: ([value, min, max]) => !(value >= min && value <= max),
    valueEndIndex: 4,
  },
  {
    opParts: ["between", "and"],
    priority: 20,
    valueNum: 3,
    calculate: ([value, min, max]) => value >= min && value <= max,
    valueEndIndex: 3,
  },
  {
    opParts: ["not", "like"],
    priority: 20,
    valueNum: 2,
    calculate: ([left, right]) => !(String(left).includes(String(right))), // TODO: undefined
    valueEndIndex: 2,
  },
  {
    opParts: ["not", "in"],
    priority: 20,
    valueNum: 2,
    calculate: (arg0) => !calculations.in(arg0),
    valueEndIndex: 2,
  },
  {
    opParts: ["not", "exists"],
    priority: 20,
    valueNum: 1,
    calculate: (arg0) => !calculations.exists(arg0),
    valueStartIndex: 0,
    valueEndIndex: 3,
  },
  {
    opParts: ["is", "not", "null"],
    priority: 20,
    valueNum: 1,
    calculate: ([value]) => value !== null,
    valueStartIndex: -1,
    valueEndIndex: 3,
  },
  {
    opParts: ["is", "null"],
    priority: 20,
    valueNum: 1,
    calculate: ([value]) => value === null,
    valueStartIndex: -1,
    valueEndIndex: 2,
  },
  {
    opParts: ["*"],
    priority: 10,
    valueNum: 2,
    calculate: ([left, right]) => left * right,
  },
  {
    opParts: ["/"],
    priority: 10,
    valueNum: 2,
    calculate: ([left, right]) => left / right,
  },
  {
    opParts: ["+"],
    valueNum: 2,
    calculate: ([left, right]) => left + right,
  },
  {
    opParts: ["-"],
    valueNum: 2,
    calculate: ([left, right]) => left - right,
  },
  {
    opParts: ["="],
    priority: -10,
    valueNum: 2,
    calculate: ([left, right]) => left === right,
  },
  {
    opParts: ["!="],
    valueNum: 2,
    calculate: ([left, right]) => left !== right,
  },
  {
    opParts: [">"],
    valueNum: 2,
    calculate: ([left, right]) => left > right,
  },
  {
    opParts: [">="],
    valueNum: 2,
    calculate: ([left, right]) => left >= right,
  },
  {
    opParts: ["<"],
    valueNum: 2,
    calculate: ([left, right]) => left < right,
  },
  {
    opParts: ["<="],
    valueNum: 2,
    calculate: ([left, right]) => left <= right,
  },
  {
    opParts: ["in"],
    valueNum: 2,
    calculate: calculations.in,
  },
  {
    opParts: ["like"],
    valueNum: 2,
    calculate: ([left, right]) => String(left).includes(String(right)), // TODO: undefined
  },
  {
    opParts: ["and"],
    valueNum: 2,
    priority: -20,
    calculate: ([left, right]) => Boolean(left) && Boolean(right),
  },
  {
    opParts: ["or"],
    valueNum: 2,
    priority: -20,
    calculate: ([left, right]) => Boolean(left) || Boolean(right),
  },
  {
    opParts: ["exists"],
    valueStartIndex: 0,
    valueNum: 1,
    calculate: calculations.exists
  }
];


function containOp({ opParts }: OperatorRule, xpr: _xpr) {
  return opParts
    .map(part => xpr.includes(part)).filter(v => v === false)
    .length === 0;
}

function indexOp({ opParts, valueStartIndex, valueEndIndex }: OperatorRule, xpr: _xpr) {
  if (opParts.length === 1) {
    return xpr.indexOf(opParts[0]);
  }
  
  return xpr.findIndex((aXpr, idx, arr) => {
    const opPartsClone = [...opParts];
    const innerParts = arr
      .slice(idx + (valueStartIndex as number), idx + (valueEndIndex as number) + 1);

    for (const innerPart of innerParts) {
      if (opPartsClone[0] === innerPart) {
        opPartsClone.shift();
      }
    }

    if (opPartsClone.length === 0) {
      return true;
    }

    return false;
  });
}

export function processXprV2({ xpr }: xpr, context: any) {
  let xprClone = [...xpr];

  while (true) {
    const rules = opRules
      .filter(rule => containOp(rule, xprClone))
      .map(r => Object.assign({}, OperatorRuleDefault, r))
      .sort((r1, r2) => (r2.priority ?? 0) - (r1.priority ?? 0));

    if (rules.length > 0) {
      const rule = rules[0];
      const opIndex = indexOp(rule, xprClone);

      if (opIndex >= 0) {
        const startIndex = opIndex + (rule.valueStartIndex ?? 0);
        const endIndex = opIndex + (rule.valueEndIndex ?? 0) + 1;
        const opParameters = xprClone
          .slice(startIndex, endIndex)
          .filter((part: any) => !rule.opParts.includes(part)) // TODO: concern about value is the op keyword
          .map((expr) => isCXNExpr(expr) ? execute(expr, context) : expr);

        xprClone = [
          ...xprClone.slice(0, startIndex),
          rule.calculate(opParameters),
          ...xprClone.slice(endIndex)
        ];

      }
      else {
        // TODO: existed but not index, error
      }
    } else {

      break;

    }


  }

  if (xprClone.length === 1) {
    return xprClone[0];
  }
  // TODO: throw error
}


