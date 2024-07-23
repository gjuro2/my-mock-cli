"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const my_http_helper_1 = require("../../../my-http-helper");
const my_mock_request_1 = require("../../fw/my-mock-request");
const my_mock_response_1 = require("../../fw/my-mock-response");
const my_test_helper_1 = require("../../fw/my-test-helper");
//Ako imamo random value onda se ona treba preuzeti
test('VARIABLE #1 : QUERY PARAM - random variable value ', () => {
    let httpServer = new my_http_helper_1.MyHttpHelper();
    httpServer.isUnitTest = true;
    const testHelper = new my_test_helper_1.MyTestHelper("src/test/variables/query-paremeters");
    httpServer.mockFile = testHelper.getTestFilePath("test-1");
    httpServer.init();
    let request = new my_mock_request_1.MyMockRequest("GET", "/api/klijents?id=99&name=aaa");
    let response = new my_mock_response_1.MyMockResponse();
    httpServer.processRequest(request, response);
    testHelper.saveResultFile(response.body);
    let tExpectedJsonString = testHelper.getExpectedFile();
    expect(response.body).toBe(tExpectedJsonString);
});
//# sourceMappingURL=test-1.test%20copy.js.map