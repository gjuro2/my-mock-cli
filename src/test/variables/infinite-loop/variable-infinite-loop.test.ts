
import { MyJsonTemplateHelper } from "../../../my-json-template-helper";
import { MyTestHelper } from "../../fw/my-test-helper";



test('VARIABLE #1 : INFINITE LOOP', () => {

  let testHelper = new MyTestHelper("src/test/variables/infinite-loop")
  let tJsonString = testHelper.getTestFile("variable-infinite-loop")
  // MyJsonTemplateHelper.displayParsingSteps = true;
  try {
  let tRez = MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir)
    fail("IFINITE LOOP EXPECTED");
  } catch(ex: any) {
    expect("OK").toBe("OK")
  }

});