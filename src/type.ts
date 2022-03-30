type Name = string


type ref = { ref: (Name | { id?: string, where?: CXN, args?: CXN[] })[] }
type val = { val: string | number | boolean | null }
type xpr = { xpr: _xpr }
type _xpr = (CXN | operator)[]
type operator = string

export type CXN = ref | val | xpr

export type JSFunction = (...args: any[]) => any