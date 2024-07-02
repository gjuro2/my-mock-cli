#!/usr/bin/env node

import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import { version, name } from './version';
import { MyMockDataDefinition, MyMockDataRow } from './my-mock-data';

//https://gist.github.com/ValeriiVasin/4261265
const reset = "\x1b[0m";

const logLine = {
    green: (text: any) => process.stdout.write("\x1b[32m" + text + reset + "\n"),
    red: (text: any) => process.stdout.write("\x1b[31m" + text + reset + "\n"),
    blue: (text: any) => process.stdout.write("\x1b[34m" + text + reset + "\n"),
    yellow: (text: any) => process.stdout.write("\x1b[33m" + text + reset + "\n"),
    white: (text: any) => process.stdout.write("\x1b[37m" + text + reset + "\n"),
};
const log = {
    green: (text: any) => process.stdout.write("\x1b[32m" + text + reset),
    red: (text: any) => process.stdout.write("\x1b[31m" + text + reset),
    blue: (text: any) => process.stdout.write("\x1b[34m" + text + reset),
    yellow: (text: any) => process.stdout.write("\x1b[33m" + text + reset),
    white: (text: any) => process.stdout.write("\x1b[37m" + text + reset),
};

//definitiion of requests and responses
let tMockData: MyMockDataDefinition;

//#1 read config
let tPort = 3000;
let tMockFile = 'mock.json';

//Dir u kojem se trenutno sve izvršava
let tWorkDir:string; ///home/dev/xoffice/my-mock-cli

//Dir u kojem nam je naš exe
let tBinDir:string ///home/admin1/.nvm/versions/node/v16.19.1/bin/node

//Log version
logLine.green(`${name}: ${version}`);

parseParameters();

//parse mock definition
tMockData = getMockDataAsOBJ(tMockFile);

const server = http.createServer((request: IncomingMessage, response: ServerResponse) => {
    // console.dir(request.params);
    //logLine.white(request)
    //http://localhost:3000/test
    let tTimestamp = new Date().toISOString();
    log.blue(tTimestamp + ' ');
    log.yellow(request.method + " " + request.url);
    //!Preskoci favicon ***************************************
    if (request.url?.indexOf('favicon.ico') !== -1) {
        const filePath = "favicon.ico";
        //Da li imamo favico
        if (!fs.existsSync(filePath)) {
            response.end();
            logLine.green(' 200 OK');
            return;
        }

        response.writeHead(200, { 'Content-Type': 'image/x-icon' });
        fs.createReadStream(filePath).pipe(response);
        logLine.green(' 200 OK');
        return;
    }
    //Preskoci favicon ***************************************

    let tMatchedItem: MyMockDataRow | any;
    //AKo treba uzmi mapiranje requesta
    let tReqMapping = tMockData?.propMappings?.request
    if (!tReqMapping) {
        tReqMapping = "request";
    }
    //AKo treba uzmi mapiranje response
    let tRespMapping = tMockData?.propMappings?.response
    if (!tRespMapping) {
        tRespMapping = "response.body";
    }

    //! MATCH REQUEST DINAMICALY *************************+
    tMockData.mappings.some((element: MyMockDataRow | any) => {

        //Razboj podatke na method i url
        const tItems = getObjectValue(element, tReqMapping).split(" ");
        const tMethod = tItems[0];
        const tUrl = tItems[1];


        //Da li je ok metoda GET | POST | PUT | DELETE | * - bilokoja
        // logLine.white('check METHOD:' + tMethod);
        if (
            (!tMethod.startsWith("" + request.method)) &&
            (!tMethod.startsWith("*"))
        ) return false;

        //Da li je ok url
        // logLine.white('check URL:' + tUrl);
        if (tUrl.indexOf("*") !== -1) {
            //*REGEX
            const tRegex = tUrl.replaceAll("*", ".*");
            if (!request.url?.match(tRegex + "$")) return false;
        } else {
            //* NORMALAN
            if (!request.url?.startsWith(tUrl)) return false;
        }
        tMatchedItem = element;
        return true;
    });

    if (tMatchedItem == null) {
        logLine.red(' 404 NOK');
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end('{ error: "REQUEST_NOT_MATCHED"}');
        return;
    }

    //Logiraj poziv
    logLine.green(" 200 OK");
    // if (!tMatchedItem.title) {
    //     logLine.white('# Matched:' + getObjectValue(tMatchedItem,tReqMapping));
    // } else {
    //     logLine.white('# Matched:' + tMatchedItem.title);
    //     logLine.white('  request:' + getObjectValue(tMatchedItem,tReqMapping));
    // }

    //U suprotnom vrati response
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(getObjectValue(tMatchedItem, tRespMapping)));
});


const host = '127.0.0.1';
server.listen(tPort, host);
logLine.green(`Listening at http://${host}:${tPort}`);

/**
 * Parsiraj podatke iz mock filea
 * i ako fali kreiraj potrebnu strukturu
 */
function getMockDataAsOBJ(pMockFile: string): MyMockDataDefinition {
    let tData = getMockDataAsOBJ_int(pMockFile);
    if (!tData) {
        logLine.red(`INVALID_MOCK_FILE_STRUCTURE`);
        process.exit(1)
    };
    if (!tData.mappings) {
        logLine.red(`NO_MAPPINGS`);
        process.exit(1)
    };
    return tData;
}

/**
 * Parsiraj podatke iz mock filea
 * i ako fali kreiraj potrebnu strukturu
 */
function getMockDataAsOBJ_int(pMockFile: string): MyMockDataDefinition | null {

    logLine.white("MOCK    : " + pMockFile);
    let tJson = fs.readFileSync(pMockFile, "utf8");
    if (!tJson) {
        return null;
    }
    var tData: any = JSON.parse(tJson);
    return tData;
}

/**
 * VRATI VRIJEDNOST NEKOG PROPA U OBJEKTU
 * radi i sa nested propovima
 */
function getObjectValue(obj: any, path: string) {
    if (!path) return obj;
    const properties: any = path.split('.');
    return getObjectValue(obj[properties.shift()], properties.join('.'))
}

function parseParameters() {
    tBinDir = __dirname;
    logLine.white("BIN_DIR : " + tBinDir);
    tWorkDir = process.cwd();
    logLine.white("WORK_DIR: " + tWorkDir);

    //! procesiraj ulazne parametre
    process.argv.forEach(function (val, index, array) {

        //Prva dva parametra su pa ih ignoriramo
        // - /home/dev/xoffice/my-mock-cli
        // - /home/admin1/.nvm/versions/node/v16.19.1/bin/node
        if (index < 2) {
            return;
        }

        if (val.indexOf("--port") != -1) {
            tPort = parseInt(val.replace("--port=", ""), 10);
            logLine.white("PORT    : " + tPort);
            return;
        }

        if (val.indexOf("--init") != -1) {
            //copy file mock.json to work dir
            //           /home/admin1/.nvm/versions/node/v16.19.1/lib/node_modules/@gjuro/my-mock-cli/bin
            // tBinDir = /home/admin1/.nvm/versions/node/v16.19.1/bin/node

            fs.copyFileSync(`${tBinDir}/mock.json`, `${tWorkDir}/mock.json`);
            logLine.green("Sample file 'mock.json' created!");
            process.exit(1);
        }
        //sve ostalo je putanja do filea koji mockamo
        tMockFile = val;
    });

}
