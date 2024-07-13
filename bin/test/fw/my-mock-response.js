"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyMockResponse = void 0;
/**
 * Mockani http response
 */
class MyMockResponse {
    constructor() {
        this.body = null;
        this.httpErrorCode = 200;
        //Http headeri za response
        this.headers = [];
    }
    /**
     * simuliraj dodavanje headera za response i errorcode-a
     * npr: response.writeHead(404, { 'Content-Type': 'application/json' });
     */
    writeHead(httpErrorCode, header) {
        this.httpErrorCode = httpErrorCode;
        this.headers.push(header);
    }
    /**
     * Simuliraj ispis u rsponse
     * npr: response.end('{ error: "RESPONSE_EMPTY"}');
     */
    end(body) {
        this.body = body;
    }
}
exports.MyMockResponse = MyMockResponse;
//# sourceMappingURL=my-mock-response.js.map