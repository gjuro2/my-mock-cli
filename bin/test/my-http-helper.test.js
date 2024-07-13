"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const my_http_helper_1 = require("../my-http-helper");
const my_mock_request_1 = require("./fw/my-mock-request");
const my_mock_response_1 = require("./fw/my-mock-response");
const my_test_helper_1 = require("./fw/my-test-helper");
// MyJsonTemplateHelper.displayParsingSteps = true;
test('TEST #1 : http method lower case', () => {
    let httpServer = new my_http_helper_1.MyHttpHelper();
    httpServer.isUnitTest = true;
    const testHelper = new my_test_helper_1.MyTestHelper("src/samples/http-tests");
    httpServer.mockFile = testHelper.getTestFilePath("http-test1");
    httpServer.init();
    let request = new my_mock_request_1.MyMockRequest("GET", "/api/users/1");
    let response = new my_mock_response_1.MyMockResponse();
    httpServer.processRequest(request, response);
    testHelper.saveResultFile(response.body);
    let tExpectedJsonString = testHelper.getExpectedFile();
    expect(response.body).toBe(tExpectedJsonString);
});
//# sourceMappingURL=my-http-helper.test.js.map