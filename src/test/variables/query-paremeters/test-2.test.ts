
import { MyHttpHelper } from "../../../my-http-helper";
import { MyMockRequest } from "../../fw/my-mock-request";
import { MyMockResponse } from "../../fw/my-mock-response";
import { MyTestHelper } from "../../fw/my-test-helper";


//Ako imamo random value onda se ona treba preuzeti
test('VARIABLE:QUERY-PARAM: random variable value', () => {
  let httpServer = new MyHttpHelper();
  httpServer.isUnitTest = true;
  const testHelper = new MyTestHelper("src/test/variables/query-paremeters")
  httpServer.mockFile = testHelper.getTestFilePath("test-mock");
  httpServer.init();
  let request = new MyMockRequest("GET", "/api/klijents?id=2&name=test");
  let response = new MyMockResponse();
  httpServer.processRequest(request, response);

  let tExpectedJsonString = testHelper.getExpectedFile("test-2")
  testHelper.saveResultFile(response.body);
  expect(response.body).toBe(tExpectedJsonString);
});