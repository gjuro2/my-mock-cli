"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const my_json_template_helper_1 = require("../../../my-json-template-helper");
const my_test_helper_1 = require("../../fw/my-test-helper");
test('VARIABLE #1 : INFINITE LOOP', () => {
    let testHelper = new my_test_helper_1.MyTestHelper("src/test/variables/infinite-loop");
    let tJsonString = testHelper.getTestFile("variable-infinite-loop");
    // MyJsonTemplateHelper.displayParsingSteps = true;
    try {
        let tRez = my_json_template_helper_1.MyJsonTemplateHelper.parseAsObj(tJsonString, testHelper.workDir);
        fail("IFINITE LOOP EXPECTED");
    }
    catch (ex) {
        expect("OK").toBe("OK");
    }
});
//# sourceMappingURL=variable-infinite-loop.test.js.map