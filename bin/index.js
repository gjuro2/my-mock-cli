#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const my_http_helper_1 = require("./my-http-helper");
let httpHelper = new my_http_helper_1.MyHttpHelper();
httpHelper.init();
const server = http_1.default.createServer((request, response) => {
    httpHelper.processRequest(request, response);
});
httpHelper.listen(server);
//# sourceMappingURL=index.js.map