#!/usr/bin/env node

import http, { IncomingMessage, ServerResponse } from 'http';

import { MyHttpHelper } from './my-http-helper';

let httpHelper = new MyHttpHelper();
httpHelper.init();

const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {
    httpHelper.processRequest(request, response);
});


httpHelper.listen(server);
