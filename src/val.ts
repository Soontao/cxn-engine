import { val } from "./type";


export function processVal(val: val) {
  if (val.literal === undefined) {
    return val.val;
  }
  switch (val.literal) {
    case "date":
      return new Date(val.val as string);
    case "timestamp":
      return new Date(parseFloat(val.val as string));
    default:
      // TODO: throw error
      return val.val;
  }
}
