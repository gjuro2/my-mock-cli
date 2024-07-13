#!/usr/bin/env node

import http, { IncomingMessage, ServerResponse } from 'http';
import { log, logLine } from './my-color-loging';


//#1 read config
let tPort = 3000;
let tMockFile = 'mock.json';


const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {

    let tUrl = "/user/:id"
    if (request.url && tUrl.indexOf("/:") !== -1) {
        //Uzmi djelove urla i matchaj
        var url2MatchParts = tUrl.split("/")
        var urlParts = request.url.split("/")

        if (url2MatchParts.length !== 0 && url2MatchParts.length == urlParts.length) {
            let urlMatched = true;
            let tReq: any = {};
            for (let index = 0; index < url2MatchParts.length; index++) {
                const part2Match = url2MatchParts[index];
                const part = urlParts[index];
                //Varijable
                if (part2Match.indexOf(":") !== -1) {
                    let tPropName = part2Match.replaceAll(":","");
                    tReq[tPropName] = part;
                } else
                //Normalni dio putanje ako ne odgovara
                {
                    if (part2Match != part) {
                        urlMatched = false
                    }
                }
            }
            if (urlMatched) {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                let tResp = { status: "OK", req: tReq } ;
                response.end(JSON.stringify(tResp));
                return `;`
            }

        }
    }

    logLine.red('REQ:' + request.url);
    if (request.url?.startsWith("/test")) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end('{ "status": "OK"}');
        return;
    }

    logLine.red(' 404 NOK');
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end('{ error: "REQUEST_NOT_MATCHED"}');
    return;
});


const host = '127.0.0.1';
server.listen(tPort, host);
logLine.green(`Listening at http://${host}:${tPort}`);


