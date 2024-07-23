import { MyHttpHelper } from '../../my-http-helper';
import { MyMockRequest } from '../fw/my-mock-request';
import { MyMockResponse } from '../fw/my-mock-response';
import { MyTestHelper } from '../fw/my-test-helper';
// MyJsonTemplateHelper.displayParsingSteps = true;

test('TEST #1 : http method lower case', () => {
  let httpServer = new MyHttpHelper();
  httpServer.isUnitTest = true;
  const testHelper = new MyTestHelper("src/samples/http-tests")
  httpServer.mockFile = testHelper.getTestFilePath("http-test1");
  httpServer.init();
  let request = new MyMockRequest("GET", "/api/users/1");
  let response = new MyMockResponse();
  httpServer.processRequest(request, response);

  testHelper.saveResultFile(response.body);
  let tExpectedJsonString = testHelper.getExpectedFile()
  expect(response.body).toBe(tExpectedJsonString);
});
