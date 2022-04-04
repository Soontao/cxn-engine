/* eslint-disable max-len */
import type { Functions } from "./func";

/**
 * Binding Parameters
 */
export type param = {
  ref: _ref
  /**
   * @example
   * ```js
   * cds.parse.expr("a > ?")
   * { xpr: [ { ref: [ 'a' ] }, '>', { ref: [ '?' ], param: true } ] }
   * ```
   */
  param: true
};

export type ref = { ref: _ref }
export type val = { val: _val }
export type xpr = { xpr: _xpr }
export type func = { func: Functions, args: Args, xpr?: _xpr }

type AnyOperator = "*"
type CompareOperator = "<" | "<=" | "<>" | "=" | "!=" | ">" | ">="
type NumericOperator = "*" | "+" | "-" | "/"
type LogicOperator = "AND" | "OR"

type operator = NumericOperator | CompareOperator | LogicOperator | "||" | "BETWEEN" | "IN" | "IS" | "LIKE" | "NOT" | "OVER" | "NULL" | "EXISTS"

type ArrayArgs = (ref | val | AnyOperator)[];
type NamedArgs = { [argName: string]: (ref | val) };

export type Identifier = string
export type ObjectQuery = { id?: string, where?: CXN, args?: CXN[] }
export type Args = ArrayArgs | NamedArgs;
export type Operator = Lowercase<operator>;
export type _val = string | number | boolean | null;
export type _ref = Array<Identifier | ObjectQuery>
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

