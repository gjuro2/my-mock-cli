import { log, logLine, myApp } from './my-color-loging';
import fs from 'fs';
import fse from 'fs-extra';
import path from "path";


import { MyMock_DataDefinition, MyMock_EndpointRow } from './my-mock-data';
import { MyObject } from './my-object';
import { version, name } from './version';
import { MyJsonTemplateHelper } from './my-json-template-helper';
import { Server, IncomingMessage, ServerResponse } from 'http';
const querystring = require('querystring');
const { URL } = require('url');

export class MyHttpHelper {
    public isUnitTest = false; //Flag da smo u unit testu i onda ne parsamo CMD parametre
    public host = '127.0.0.1';
    //definitiion of requests and responses
    public mockData: MyMock_DataDefinition | null = null;

    //#1 read config
    public port = 3000;
    public mockFile = 'mock.json';

    //Dir u kojem se trenutno sve izvršava
    public workDir: string = ""; ///home/dev/xoffice/my-mock-cli

    //Dir u kojem nam je naš exe
    public binDir: string = "" ///home/admin1/.nvm/versions/node/v16.19.1/bin/node

    //! **************************************************************
    /**
     * Inicijaliziraj ulaze parametre
     */
    public init() {
        //Log version
        logLine.green(`${name}: ${version}`);
        this.parseParameters();

        //parse mock definition
        this.mockData = this.getMockDataAsOBJ(this.mockFile);
    }

    /**
     * Parsiraj podatke iz mock filea
     * i ako fali kreiraj potrebnu strukturu
     */
    private getMockDataAsOBJ(pMockFile: string): MyMock_DataDefinition {
        let tData: any = this.getMockDataAsOBJ_int(pMockFile);
        if (!tData) {
            myApp.exit(`#ERROR: INVALID_MOCK_FILE_STRUCTURE!`);
        };
        if (!MyObject.get(tData, "@endpoints")) {
            myApp.exit(`#ERROR "@endpoints" attribute is missing see documentation!`);
        };

        logLine.green(`ENDPOINTS:`);

        tData["@endpoints"].forEach(function (tMapping: any, tIdx: any, tArr: any) {
            logLine.green("    - " + MyObject.get(tMapping, "@request.@url"));
        })

        return tData;
    }

    /**
     * Parsiraj podatke iz mock filea
     * i ako fali kreiraj potrebnu strukturu
     */
    private getMockDataAsOBJ_int(pMockFile: string): MyMock_DataDefinition | null {

        logLine.white("MOCK    : " + pMockFile);
        let tJsonString = fs.readFileSync(pMockFile, "utf8");
        if (!tJsonString) {
            return null;
        }
        //merge all file chunks
        // "{{file users-api.json}}"
        let tJsonObj = MyJsonTemplateHelper.parseAsObj(tJsonString, this.workDir);

        //provjeri da li imamo išta
        if (!tJsonObj || !MyObject.get(tJsonObj, "@endpoints")) {
            myApp.exit(`#ERR mock file: "${pMockFile}" has invlid structure! (missing "@endpoints": [...])`)
        }

        return tJsonObj;
    }


    //! **************************************************************
    /**
     * Parsiraj ulazne CMD parametre
     */
    private parseParameters() {

        this.binDir = __dirname;
        logLine.white("BIN_DIR : " + this.binDir);

        //! procesiraj ulazne parametre
        process.argv.forEach((val, index, array) => {

            //Prva dva parametra su pa ih ignoriramo
            // - /home/dev/xoffice/my-mock-cli
            // - /home/admin1/.nvm/versions/node/v16.19.1/bin/node
            if (index < 2) {
                return;
            }

            if (val.indexOf("--port") != -1) {
                this.port = parseInt(val.replace("--port=", ""), 10);
                logLine.white("PORT    : " + this.port);
                return;
            }

            if (val.indexOf("--init") != -1) {
                //copy file mock.json to work dir
                //           /home/admin1/.nvm/versions/node/v16.19.1/lib/node_modules/@gjuro/my-mock-cli/bin
                // this.binDir = /home/admin1/.nvm/versions/node/v16.19.1/bin/node
                fse.copySync(`${this.binDir}/samples`, `${this.workDir}/samples`);

                // To copy a folder or file
                fs.copyFileSync(`${this.binDir}/samples/mock.json`, `${this.workDir}/mock.json`);

                logLine.green("Sample file 'mock.json' created!");
                // myApp.exit("END")
                process.exit(1);
            }

            if (
                (val.indexOf("--showParsing") != -1) ||
                (val.indexOf("--show") != -1) ||
                (val.indexOf("--verbose") != -1)
            ) {
                MyJsonTemplateHelper.displayParsingSteps = true;
                return;
            }

            //Fix za unit test
            if (!this.isUnitTest) {
                //sve ostalo je putanja do filea koji mockamo
                this.mockFile = val;
            }
        });

        this.workDir = process.cwd();
        let mockFileDir = path.dirname(this.mockFile);

        if (mockFileDir == ".") {
            //Ako imamo sao filename bez parcijale ili cjele putanje ond je ok this.workDir
        } else {
            if (path.isAbsolute(this.mockFile)) {
                this.workDir = path.dirname(this.mockFile)
            } else {
                this.workDir = this.workDir + "/" + path.dirname(this.mockFile)
            }
        }
        logLine.white("WORK_DIR: " + this.workDir);

    }


    /**
     * Obradi ulazni request
     */
    processRequest(request: any, response: any) {
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

        let tMatchedItem: MyMock_EndpointRow | any;
        //AKo treba uzmi mapiranje requesta
        let reqMapping: any = MyObject.get(this.mockData, "@propMappings.@request");
        if (!reqMapping) reqMapping = "@request";

        //AKo treba uzmi mapiranje response
        let tRespMapping = MyObject.get(this.mockData, "@propMappings.@response");
        if (!tRespMapping) tRespMapping = "@response";

        //AKO GAĐAMO ROOT
        if (!request.url) {
            logLine.red('ROOT');
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end('{ message: "ROOT"}');
            return;
        }

        let tRequestUrl = request.url;
        //Finta da dobijemo dobar URL jer iz nekog razloga metode na requestu ne vraćaju sve propove nego za neke null

        const tReqCustomUrlObj = new URL("http://localhost:" + this.port + tRequestUrl);

        //! ako imamo query parametre onda probaj po njima naći duirect match
        //! znaći da svi parametri odgovoraju
        if (tReqCustomUrlObj.search) {
            //Url uvijek gledamo bez paramatara
            //!prvo probaj naći rutu koja ima točno query parametre ako takova ne psotoji onda idemo u normalan matching
            MyObject.get(this.mockData, "@endpoints")?.some((mockRow: MyMock_EndpointRow | any) => {
                tMatchedItem = this.matchRequest(
                    mockRow, reqMapping,
                    tRequestUrl,
                    request, response,
                    "MATCH_URL_PARAMS");
                if (tMatchedItem) return true;
            });
        }

        //! MATCH REQUEST DINAMICALY *************************+
        if (!tMatchedItem) {
            //ako nemamo direktan match makni query parametre i idemo dolje u dinamički match
            tRequestUrl = tReqCustomUrlObj.pathname;

            MyObject.get(this.mockData, "@endpoints")?.some((mockRow: MyMock_EndpointRow | any) => {
                tMatchedItem = this.matchRequest(
                    mockRow, reqMapping,
                    tRequestUrl,
                    request, response,
                    "MATCH_ROUTE");
                if (tMatchedItem) return true;
            });
        }

        if (tMatchedItem == null) {
            logLine.red(' 404 NOK');
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end('{ error: "REQUEST_NOT_MATCHED"}');
            return;
        }
        let tResponse = MyObject.get(tMatchedItem, tRespMapping)
        if (!tResponse) {
            logLine.red(' 400 RESPONSE_EMPTY');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end('{ error: "RESPONSE_EMPTY"}');
            return;
        }

        let tBody = MyObject.get(tResponse, "@body")
        if (!tBody) {
            logLine.red(' 400 RESPONSE_BODY_EMPTY');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end('{ error: "RESPONSE_BODY_EMPTY"}');
            return;
        }

        let tResponseStr = JSON.stringify(tBody, null, 4);
        //!ako imamo url parametre onda in sad opet resolvaj sa pravim vrijednostima
        if (
            tMatchedItem.requestData &&
            tResponseStr.indexOf(":") !== -1 //ako u responseu imamo varijable
        ) {
            //Sad :[variable_name] zamjeni sa stvarnim vrjednostima
            //variable je objekt {key:"id", value: "123"}
            tMatchedItem.requestData.forEach((variable: any) => {
                tResponseStr = tResponseStr.replaceAll(":" + variable.key, variable.value)
                //sad ako treba makni string navodnike u jsou
                tResponseStr = tResponseStr.replaceAll("\"((", "")
                tResponseStr = tResponseStr.replaceAll("))\"", "")
            });
        }

        //Logiraj poziv
        logLine.green(" 200 OK");
        logLine.green("response: " + tResponseStr);
        // if (!tMatchedItem.title) {
        //     logLine.white('# Matched:' + getObjectValue(tMatchedItem,reqMapping));
        // } else {
        //     logLine.white('# Matched:' + tMatchedItem.title);
        //     logLine.white('  request:' + getObjectValue(tMatchedItem,reqMapping));
        // }

        //U suprotnom vrati response
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(tResponseStr);

    }

    //Matchaj request
    matchRequest(
        mockRow: MyMock_EndpointRow,
        reqMapping: any,
        requestUrl: any,
        request: any, response: any,
        matchStrategy: string  //MATCH_URL_PARAMS matchamo i path i query parametre | MATCH_ROUTE matchamo samo po pathu
    ): any {
        //Razbij podatke na method i url
        let tMockRequestObj = MyObject.get(mockRow, reqMapping)
        if (!tMockRequestObj) return null;

        let tMockRequestUrl = MyObject.get(tMockRequestObj, "@url")
        if (!tMockRequestUrl) return null;
        let tParts = tMockRequestUrl.split(" ");
        if (!tParts) return null;

        const tMockMethod: string = tParts[0]?.toUpperCase();
        let tMockUrl = tParts[1];

        //Da li je ok metoda GET | POST | PUT | DELETE | * - bilokoja
        // logLine.white('check METHOD:' + tMockMethod);
        if (
            (!tMockMethod.startsWith("" + request.method)) &&
            (!tMockMethod.startsWith("*"))
        ) return null;


        let tMatchedItem: any = null;

        //ako imamo url parametre onda ih rasparsaj
        let tUrlParams: any = [];
        //Uzmi prave parametre i iz originalnog requesta
        this.getUrlParameters(request.url, tUrlParams)
        // this.getUrlParameters(tMockUrl, tUrlParams)


        if (matchStrategy !== "MATCH_URL_PARAMS") {
            //MATCH PO PARAMETRIMA U RUTI
            let tMatchedItem = this.matchRoute(requestUrl, tMockUrl, mockRow);
            if (tMatchedItem) {
                //Dodaj url parametre u matched item
                this.addUrlParameters(tMatchedItem, tUrlParams);
                return tMatchedItem;
            }

            //Izbaci url paremetre ako smo u ovom koraku
            const parsedUrl = new URL("http://localhost:" + this.port + tMockUrl);
            tMockUrl = parsedUrl.pathname;
        }

        //Da li je ok url
        // logLine.white('check URL:' + tUrl);
        if (tMockUrl.indexOf("*") !== -1) {
            //*REGEX
            const tRegex = tMockUrl.replaceAll("*", ".*");
            if (!requestUrl?.match(tRegex + "$")) return null;
        } else {
            //* NORMALAN
            // if (!tRequestUrl?.startsWith(tUrl)) return false;
            if (requestUrl !== tMockUrl) return null;
        }
        tMatchedItem = mockRow;
        this.addUrlParameters(tMatchedItem, tUrlParams);
        return tMatchedItem;
    }

    //Dodaj url parametre u item
    //ili ih spoji sa path parametrima ako već psotoje
    addUrlParameters(matchedItem: any, urlParams: any) {
        if (!urlParams) return;
        if (!urlParams.length) return;
        if (!matchedItem) return;

        //AKo nemamo request param onda samo naljepi
        if (!matchedItem.requestData) {
            matchedItem.requestData = urlParams;
            return;
        }
        //inače pospoji
        matchedItem.requestData = [...matchedItem.requestData, ...urlParams];
    }

    //Izvadi url parametre i vrati čisti url
    getUrlParameters(pUrl: string, pUrlParam: any[]) {

        if (pUrl.indexOf("?") === -1) return;
        //! ovo je finta da imamo dobar URL
        const parsedUrl = new URL("http://localhost:" + this.port + pUrl);
        let tParams = parsedUrl.searchParams

        //Obradi parametre
        if (tParams) {
            for (var entry of tParams.entries()) {
                let tItem = { key: entry[0], value: entry[1] }
                pUrlParam.push(tItem)
            }
        }
    }


    //Izvadi url parametre i vrati čisti url
    getUrlParameters_OLD(pUrl: string, pUrlParam: any[]): string {
        if (pUrl.indexOf("?") === -1) return pUrl;
        let tNewUrl: string = pUrl;


        //#1 sad uzmi url parametre iz requesta
        // const url = "https://u:p@www.example.com:777/a/b?c=d&e=f#g";
        // const parsedUrl = new URL(url);
        //href         https://u:p@www.example.com:777/a/b?c=d&e=f#g
        //origin       https://www.example.com:777
        //protocol     https:
        //username     u
        //password     p
        //host         www.example.com:777
        //hostname     www.example.com
        //port         777
        //pathname     /a/b
        //search       ?c=d&e=f
        //searchParams { 'c' => 'd', 'e' => 'f' }
        //hash         #g

        //! ovo je finta da imamo dobar URL
        const parsedUrl = new URL("http://localhost:" + this.port + tNewUrl);
        tNewUrl = parsedUrl.pathname;
        let tParams = parsedUrl.searchParams

        //Obradi parametre
        if (tParams) {
            for (var entry of tParams.entries()) {
                let tItem = { key: entry[0], value: entry[1] }
                pUrlParam.push(tItem)
            }
        }
        //#2 Vrati samo url bez query string
        return tNewUrl;

    }

    /**
     * Ako u ruti imamo varijable onda probaj matchati routu
     */
    private matchRoute(
        requestUrl: any,
        mockUrl: any,
        mockRow: any
    ): any {

        if (!mockUrl) return null;
        if (!requestUrl) return null;

        let tReqData: any = null; //ovo je  array objekata { key:'test' value: 1 }

        //Izbaci url paremetre
        const parsedUrl = new URL("http://localhost:" + this.port + mockUrl);
        let tMockUrl = parsedUrl.pathname;

        //ovako izgledaju route parametri
        if (tMockUrl.indexOf("/:") === -1) return null;

        //Uzmi djelove urla i matchaj
        var url2MatchParts = tMockUrl.split("/") //npr: /user/:id
        if (url2MatchParts.length == 0) return null;

        var urlParts = requestUrl.split("/") //npr: /user/1
        if (url2MatchParts.length != urlParts.length) return null;

        let urlMatched = true;

        //sad provjeri sve partove
        for (let index = 0; index < url2MatchParts.length; index++) {
            const part2Match = url2MatchParts[index];
            const part = urlParts[index];
            //Varijable
            if (part2Match.indexOf(":") !== -1) {
                let tPropName = part2Match.replaceAll(":", "");
                if (!tReqData) tReqData = [];
                let tItem = { key: tPropName, value: part }
                tReqData.push(tItem);
            } else
            //Normalni dio putanje ako ne odgovara
            {
                if (part2Match != part) {
                    urlMatched = false
                }
            }
        }

        if (urlMatched) {
            mockRow.requestData = tReqData; //Stavi varijable u element
            return mockRow;
        }
        return null;
    }

    //! **************************************************************
    /**
     * Listen na serveru
     */
    public listen(server: any) {
        server.listen(this.port, this.host);
        logLine.green(`Listening at http://${this.host}:${this.port}`);
    }


}

