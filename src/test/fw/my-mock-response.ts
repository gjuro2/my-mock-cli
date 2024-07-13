/**
 * Mockani http response
 */
export class MyMockResponse {
  constructor() {
  }

  body: any = null;

  httpErrorCode: number = 200;
  //Http headeri za response
  headers: any = [];

  /**
   * simuliraj dodavanje headera za response i errorcode-a
   * npr: response.writeHead(404, { 'Content-Type': 'application/json' });
   */
  public writeHead(httpErrorCode: number, header:any ) {
    this.httpErrorCode = httpErrorCode;
    this.headers.push(header);
  }

  /**
   * Simuliraj ispis u rsponse
   * npr: response.end('{ error: "RESPONSE_EMPTY"}');
   */
  public end(body:any ) {
    this.body = body;
  }
}
