"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyMockRequest = void 0;
/**
 * Mockani http request
 */
class MyMockRequest {
    constructor(method, url) {
        this.method = "GET";
        this.url = "/api/users/1";
        this.method = method;
        this.url = url;
    }
}
exports.MyMockRequest = MyMockRequest;
//# sourceMappingURL=my-mock-request.js.map