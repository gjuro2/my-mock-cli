"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const my_http_helper_1 = require("../../../my-http-helper");
const my_mock_request_1 = require("../../fw/my-mock-request");
const my_mock_response_1 = require("../../fw/my-mock-response");
const my_test_helper_1 = require("../../fw/my-test-helper");
//Ako imamo random value onda se ona treba preuzeti
test('VARIABLE:QUERY-PARAM: random variable value', () => {
    let httpServer = new my_http_helper_1.MyHttpHelper();
    httpServer.isUnitTest = true;
    const testHelper = new my_test_helper_1.MyTestHelper("src/test/variables/query-paremeters");
    httpServer.mockFile = testHelper.getTestFilePath("test-mock");
    httpServer.init();
    let request = new my_mock_request_1.MyMockRequest("GET", "/api/klijents?id=2&name=test");
    let response = new my_mock_response_1.MyMockResponse();
    httpServer.processRequest(request, response);
    let tExpectedJsonString = testHelper.getExpectedFile("test-2");
    testHelper.saveResultFile(response.body);
    expect(response.body).toBe(tExpectedJsonString);
});
//# sourceMappingURL=test-2.test.js.map