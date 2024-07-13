"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const my_test_helper_1 = require("./fw/my-test-helper");
const my_json_template_helper_1 = require("../my-json-template-helper");
// MyJsonTemplateHelper.displayParsingSteps = true;
test('MyJsonTemplateHelper #1 simple 1', () => {
    let testHelper = new my_test_helper_1.MyTestHelper("src/samples/structure");
    let tJsonString = testHelper.getTestFile("structure1");
    let tRez = my_json_template_helper_1.MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir);
    tRez = JSON.stringify(tRez, null, 4);
    testHelper.saveResultFile(tRez);
    let tExpectedJsonString = testHelper.getExpectedFile();
    expect(tRez).toBe(tExpectedJsonString);
});
test('MyJsonTemplateHelper #2 simple 2', () => {
    let testHelper = new my_test_helper_1.MyTestHelper("src/samples/structure");
    let tJsonString = testHelper.getTestFile("structure2");
    let tRez = my_json_template_helper_1.MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir);
    tRez = JSON.stringify(tRez, null, 4);
    testHelper.saveResultFile(tRez);
    let tExpectedJsonString = testHelper.getExpectedFile();
    expect(tRez).toBe(tExpectedJsonString);
});
test('MyJsonTemplateHelper #3 invalid "@request"', () => {
    let testHelper = new my_test_helper_1.MyTestHelper("src/samples/structure/invalid");
    let tJsonString = testHelper.getTestFile("invalid-request1");
    let tRez = my_json_template_helper_1.MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir);
    let tExpectedJsonString = testHelper.getExpectedFile();
    expect(tRez).toBe(null);
});
test('MyJsonTemplateHelper #4 invalid "@response"', () => {
    let testHelper = new my_test_helper_1.MyTestHelper("src/samples/structure/invalid");
    let tJsonString = testHelper.getTestFile("invalid-respose1");
    let tRez = my_json_template_helper_1.MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir);
    let tExpectedJsonString = testHelper.getExpectedFile();
    expect(tRez).toBe(null);
});
//# sourceMappingURL=my-json-template-helper.test.js.map