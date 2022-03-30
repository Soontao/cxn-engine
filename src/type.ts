type Name = string


type ref = { ref: _ref }
export type _ref = (Name | { id?: string, where?: CXN, args?: CXN[] })[]
type val = { val: string | number | boolean | null }
type xpr = { xpr: _xpr }
export type _xpr = (CXN | operator)[]
type operator = string

export type CXN = ref | val | xpr

export type JSFunction = (...args: any[]) => any