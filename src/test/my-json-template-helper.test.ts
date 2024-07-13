import { MyTestHelper } from './fw/my-test-helper';
import { MyJsonTemplateHelper } from "../my-json-template-helper";
// MyJsonTemplateHelper.displayParsingSteps = true;



test('MyJsonTemplateHelper #1 simple 1', () => {
  let testHelper = new MyTestHelper("src/samples/structure")
  let tJsonString = testHelper.getTestFile("structure1")

  let tRez = MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir)
  tRez = JSON.stringify(tRez,null, 4);
  testHelper.saveResultFile(tRez);

  let tExpectedJsonString = testHelper.getExpectedFile()

  expect(tRez).toBe(tExpectedJsonString);
});


test('MyJsonTemplateHelper #2 simple 2', () => {
  let testHelper = new MyTestHelper("src/samples/structure")
  let tJsonString = testHelper.getTestFile("structure2")
  let tRez = MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir)
  tRez = JSON.stringify(tRez,null, 4);
  testHelper.saveResultFile(tRez);
  let tExpectedJsonString = testHelper.getExpectedFile()
  expect(tRez).toBe(tExpectedJsonString);
});

test('MyJsonTemplateHelper #3 invalid "@request"', () => {
  let testHelper = new MyTestHelper("src/samples/structure/invalid")
  let tJsonString = testHelper.getTestFile("invalid-request1")

  let tRez = MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir)
  let tExpectedJsonString = testHelper.getExpectedFile()

  expect(tRez).toBe(null);
});

test('MyJsonTemplateHelper #4 invalid "@response"', () => {
  let testHelper = new MyTestHelper("src/samples/structure/invalid")
  let tJsonString = testHelper.getTestFile("invalid-respose1")

  let tRez = MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir)
  let tExpectedJsonString = testHelper.getExpectedFile()

  expect(tRez).toBe(null);
});

