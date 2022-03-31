/* eslint-disable max-len */

type ref = { ref: _ref }
type val = { val: _val }
type xpr = { xpr: _xpr }
type func = { func: _func }

type CompareOperator = "<" | "<=" | "<>" | "=" | "!=" | ">" | ">="
type NumericOperator = "*" | "+" | "-" | "/"
type LogicOperator = "AND" | "OR"

type operator = NumericOperator | CompareOperator | LogicOperator | "||" | "BETWEEN" | "IN" | "IS" | "LIKE" | "NOT" | "OVER"
export type Operator = Lowercase<operator>;
export type _val = string | number | boolean | null;
export type _ref = (string | { id?: string, where?: CXN, args?: CXN[] })[]
export type _func = { func: string, args: (_ref | _val | Operator)[], xpr?: _xpr }
export type _xpr = (CXN | Operator)[]

export type CXN = ref | val | xpr | func

export type JSFunction = (...args: any[]) => any

export interface ExecutionOptions {
  /**
   * allow throw error or not
   */
  error?: boolean;
  /**
   * timeout for execution
   */
  timeout?: number;
}
