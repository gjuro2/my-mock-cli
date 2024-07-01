#!/usr/bin/env node

import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import { version, name } from './version';
import { MyMockData } from './my-mock-data';

//definitiion of requests and responses
let tMockDataArr: any;

//#1 read config
let tPort = 3000;
let tMockFile = 'mock.json';
 
//Dir u kojem se trenutno sve izvršava
let tWorkDir ///home/dev/xoffice/my-mock-cli

//Dir u kojem nam je naš exe
let tBinDir ///home/admin1/.nvm/versions/node/v16.19.1/bin/node

//Log version
console.log(`${name}: ${version}`);
//! procesiraj ulazne parametre
process.argv.forEach(function (val, index, array) {
    //let tWorkDir ///home/dev/xoffice/my-mock-cli
    if (index == 0) {
        tWorkDir = val;
        console.log("WORK_DIR: "+tWorkDir);
        return;
    }

    //let tBinDir ///home/admin1/.nvm/versions/node/v16.19.1/bin/node
    if (index == 1) {
        tBinDir = val;
        console.log("BIN_DIR : "+tBinDir);
        return;
    }
    if (val.indexOf("--port") != -1) {
        tPort = parseInt(val.replace("--port=", ""), 10);
        console.log("PORT    : "+tPort);

        return;
    }
    //sve ostalo je putanja do filea koji mockamo
    tMockFile = val;
});

console.log("MOCK    : "+tMockFile);
fs.readFile(tMockFile, "utf8", (error: any, data: any) => {
    if (error) {
        console.log(error);
        return;
    }
    tMockDataArr = JSON.parse(data);
});

const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {
    // console.dir(request.params);
    //console.log(request)
    //http://localhost:3000/test

    //!Preskoci favicon ***************************************
    if (request.url?.indexOf('/favicon.ico') !== -1) {
        const filePath = "favicon.ico";
        //Da li imamo favico
        fs.exists(filePath, function (exists) {
            if (!exists) {
                response.end();
                return;
            }
        });

        response.writeHead(200, { 'Content-Type': 'image/x-icon' });
        fs.createReadStream(filePath).pipe(response);
        return;
    }
    //Preskoci favicon ***************************************

    console.log('request:' + request.method+" "+request.url);
    let tMatchedItem: MyMockData | any;

    //! MATCH REQUEST DINAMICALY *************************+
    tMockDataArr.some((element: MyMockData) => {

        //Razboj podatke na method i url
        const tItems = element.request.split(" ");
        const tMethod = tItems[0];
        const tUrl = tItems[1];

        //Da li je ok metoda GET | POST | PUT | DELETE | * - bilokoja
        // console.log('check METHOD:' + tMethod);
        if (
            (!tMethod.startsWith("" + request.method)) &&
            (!tMethod.startsWith("*"))
        ) return false;

        //Da li je ok url
        // console.log('check URL:' + tUrl);
        if (tUrl.indexOf("*") !== -1) {
            //*REGEX
            const tRegex =tUrl.replaceAll("*", ".*");
            if (!request.url?.match(tRegex+"$"))  return false;
        } else {
            //* NORMALAN
            if (!request.url?.startsWith(tUrl)) return false;
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
        console.log('# Matched:'+ tMatchedItem.request);
    } else {
        console.log('# Matched:'+ tMatchedItem.title);
        console.log('  request:'+tMatchedItem.request);
    }

    //U suprotnom vrati response
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(tMatchedItem.response));
});


const host = '127.0.0.1';
server.listen(tPort, host);
console.log(`Listening at http://${host}:${tPort}`);

