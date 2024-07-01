#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
//definitiion of requests and responses
let tMockDataArr;
//#1 read config
let tPort = 3000;
let tMockFile = 'mock.json';
//Dir u kojem se trenutno sve izvršava
let tWorkDir; ///home/dev/xoffice/my-mock-cli
//Dir u kojem nam je naš exe
let tBinDir; ///home/admin1/.nvm/versions/node/v16.19.1/bin/node
//! procesiraj ulazne parametre
process.argv.forEach(function (val, index, array) {
    //let tWorkDir ///home/dev/xoffice/my-mock-cli
    if (index == 0) {
        tWorkDir = val;
        console.log("WORK_DIR: " + tWorkDir);
        return;
    }
    //let tBinDir ///home/admin1/.nvm/versions/node/v16.19.1/bin/node
    if (index == 1) {
        tBinDir = val;
        console.log("BIN_DIR : " + tBinDir);
        return;
    }
    if (val.indexOf("--port") != -1) {
        tPort = parseInt(val.replace("--port=", ""), 10);
        console.log("PORT    : " + tPort);
        return;
    }
    //sve ostalo je putanja do filea koji mockamo
    tMockFile = val;
});
console.log("MOCK    : " + tMockFile);
fs_1.default.readFile(tMockFile, "utf8", (error, data) => {
    if (error) {
        console.log(error);
        return;
    }
    tMockDataArr = JSON.parse(data);
});
const server = http_1.default.createServer((request, response) => {
    // console.dir(request.params);
    //console.log(request)
    //http://localhost:3000/test
    var _a;
    //!Preskoci favicon ***************************************
    if (((_a = request.url) === null || _a === void 0 ? void 0 : _a.indexOf('/favicon.ico')) !== -1) {
        const filePath = "favicon.ico";
        //Da li imamo favico
        fs_1.default.exists(filePath, function (exists) {
            if (!exists) {
                response.end();
                return;
            }
        });
        response.writeHead(200, { 'Content-Type': 'image/x-icon' });
        fs_1.default.createReadStream(filePath).pipe(response);
        return;
    }
    //Preskoci favicon ***************************************
    console.log('request:' + request.method + " " + request.url);
    let tMatchedItem;
    //! MATCH REQUEST DINAMICALY *************************+
    tMockDataArr.some((element) => {
        var _a, _b;
        //Razboj podatke na method i url
        const tItems = element.request.split(" ");
        const tMethod = tItems[0];
        const tUrl = tItems[1];
        //Da li je ok metoda GET | POST | PUT | DELETE | * - bilokoja
        // console.log('check METHOD:' + tMethod);
        if ((!tMethod.startsWith("" + request.method)) &&
            (!tMethod.startsWith("*")))
            return false;
        //Da li je ok url
        // console.log('check URL:' + tUrl);
        if (tUrl.indexOf("*") !== -1) {
            //*REGEX
            const tRegex = tUrl.replaceAll("*", ".*");
            if (!((_a = request.url) === null || _a === void 0 ? void 0 : _a.match(tRegex + "$")))
                return false;
        }
        else {
            //* NORMALAN
            if (!((_b = request.url) === null || _b === void 0 ? void 0 : _b.startsWith(tUrl)))
                return false;
        }
        tMatchedItem = element;
        return true;
    });
    if (tMatchedItem == null) {
        // console.log('REQUEST NEPOZNAT');
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end('{ error: "UNKNOWN_REQUEST"}');
        return;
    }
    //Logiraj poziv
    if (!tMatchedItem.title) {
        console.log('# Matched:' + tMatchedItem.request);
    }
    else {
        console.log('# Matched:' + tMatchedItem.title);
        console.log('  request:' + tMatchedItem.request);
    }
    //U suprotnom vrati response
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(tMatchedItem.response));
});
const host = '127.0.0.1';
server.listen(tPort, host);
console.log(`Listening at http://${host}:${tPort}`);
