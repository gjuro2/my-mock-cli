/**
 * Mockani http request
 */
export class MyMockRequest {
  constructor(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  
  public method = "GET";
  public url = "/api/users/1"
}
