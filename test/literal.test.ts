
import cds from "@sap/cds-compiler";
import { execute } from "../src";

const compileCXN = cds.parse.expr;

describe("Quoted Literal Test Suite", () => {

  it("should support quoted literal", () => {
    expect(execute(compileCXN("date'2022'"))).toStrictEqual(new Date("2022"));
    expect(execute(compileCXN("timestamp'1'"))).toStrictEqual(new Date(1));
  });


});
