"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyHttpHelper = void 0;
const my_color_loging_1 = require("./my-color-loging");
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const my_object_1 = require("./my-object");
const version_1 = require("./version");
const my_json_template_helper_1 = require("./my-json-template-helper");
const querystring = require('querystring');
const { URL } = require('url');
class MyHttpHelper {
    constructor() {
        this.isUnitTest = false; //Flag da smo u unit testu i onda ne parsamo CMD parametre
        this.host = '127.0.0.1';
        //definitiion of requests and responses
        this.mockData = null;
        //#1 read config
        this.port = 3000;
        this.mockFile = 'mock.json';
        //Dir u kojem se trenutno sve izvršava
        this.workDir = ""; ///home/dev/xoffice/my-mock-cli
        //Dir u kojem nam je naš exe
        this.binDir = ""; ///home/admin1/.nvm/versions/node/v16.19.1/bin/node
    }
    //! **************************************************************
    /**
     * Inicijaliziraj ulaze parametre
     */
    init() {
        //Log version
        my_color_loging_1.logLine.green(`${version_1.name}: ${version_1.version}`);
        this.parseParameters();
        //parse mock definition
        this.mockData = this.getMockDataAsOBJ(this.mockFile);
    }
    /**
     * Parsiraj podatke iz mock filea
     * i ako fali kreiraj potrebnu strukturu
     */
    getMockDataAsOBJ(pMockFile) {
        let tData = this.getMockDataAsOBJ_int(pMockFile);
        if (!tData) {
            my_color_loging_1.myApp.exit(`#ERROR: INVALID_MOCK_FILE_STRUCTURE!`);
        }
        ;
        if (!my_object_1.MyObject.get(tData, "@endpoints")) {
            my_color_loging_1.myApp.exit(`#ERROR "@endpoints" attribute is missing see documentation!`);
        }
        ;
        my_color_loging_1.logLine.green(`ENDPOINTS:`);
        tData["@endpoints"].forEach(function (tMapping, tIdx, tArr) {
            my_color_loging_1.logLine.green("    - " + my_object_1.MyObject.get(tMapping, "@request.@url"));
        });
        return tData;
    }
    /**
     * Parsiraj podatke iz mock filea
     * i ako fali kreiraj potrebnu strukturu
     */
    getMockDataAsOBJ_int(pMockFile) {
        my_color_loging_1.logLine.white("MOCK    : " + pMockFile);
        let tJsonString = fs_1.default.readFileSync(pMockFile, "utf8");
        if (!tJsonString) {
            return null;
        }
        //merge all file chunks
        // "{{file users-api.json}}"
        let tJsonObj = my_json_template_helper_1.MyJsonTemplateHelper.parseAsObj(tJsonString, this.workDir);
        //provjeri da li imamo išta
        if (!tJsonObj || !my_object_1.MyObject.get(tJsonObj, "@endpoints")) {
            my_color_loging_1.myApp.exit(`#ERR mock file: "${pMockFile}" has invlid structure! (missing "@endpoints": [...])`);
        }
        return tJsonObj;
    }
    //! **************************************************************
    /**
     * Parsiraj ulazne CMD parametre
     */
    parseParameters() {
        this.binDir = __dirname;
        my_color_loging_1.logLine.white("BIN_DIR : " + this.binDir);
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
                my_color_loging_1.logLine.white("PORT    : " + this.port);
                return;
            }
            if (val.indexOf("--init") != -1) {
                //copy file mock.json to work dir
                //           /home/admin1/.nvm/versions/node/v16.19.1/lib/node_modules/@gjuro/my-mock-cli/bin
                // this.binDir = /home/admin1/.nvm/versions/node/v16.19.1/bin/node
                fs_extra_1.default.copySync(`${this.binDir}/samples`, `${this.workDir}/samples`);
                // To copy a folder or file
                fs_1.default.copyFileSync(`${this.binDir}/samples/mock.json`, `${this.workDir}/mock.json`);
                my_color_loging_1.logLine.green("Sample file 'mock.json' created!");
                // myApp.exit("END")
                process.exit(1);
            }
            if ((val.indexOf("--showParsing") != -1) ||
                (val.indexOf("--show") != -1) ||
                (val.indexOf("--verbose") != -1)) {
                my_json_template_helper_1.MyJsonTemplateHelper.displayParsingSteps = true;
                return;
            }
            //Fix za unit test
            if (!this.isUnitTest) {
                //sve ostalo je putanja do filea koji mockamo
                this.mockFile = val;
            }
        });
        this.workDir = process.cwd();
        let mockFileDir = path_1.default.dirname(this.mockFile);
        if (mockFileDir == ".") {
            //Ako imamo sao filename bez parcijale ili cjele putanje ond je ok this.workDir
        }
        else {
            if (path_1.default.isAbsolute(this.mockFile)) {
                this.workDir = path_1.default.dirname(this.mockFile);
            }
            else {
                this.workDir = this.workDir + "/" + path_1.default.dirname(this.mockFile);
            }
        }
        my_color_loging_1.logLine.white("WORK_DIR: " + this.workDir);
    }
    /**
     * Obradi ulazni request
     */
    processRequest(request, response) {
        var _a, _b, _c;
        // console.dir(request.params);
        //logLine.white(request)
        //http://localhost:3000/test
        let tTimestamp = new Date().toISOString();
        my_color_loging_1.log.blue(tTimestamp + ' ');
        my_color_loging_1.log.yellow(request.method + " " + request.url);
        //!Preskoci favicon ***************************************
        if (((_a = request.url) === null || _a === void 0 ? void 0 : _a.indexOf('favicon.ico')) !== -1) {
            const filePath = "favicon.ico";
            //Da li imamo favico
            if (!fs_1.default.existsSync(filePath)) {
                response.end();
                my_color_loging_1.logLine.green(' 200 OK');
                return;
            }
            response.writeHead(200, { 'Content-Type': 'image/x-icon' });
            fs_1.default.createReadStream(filePath).pipe(response);
            my_color_loging_1.logLine.green(' 200 OK');
            return;
        }
        //Preskoci favicon ***************************************
        let tMatchedItem;
        //AKo treba uzmi mapiranje requesta
        let reqMapping = my_object_1.MyObject.get(this.mockData, "@propMappings.@request");
        if (!reqMapping)
            reqMapping = "@request";
        //AKo treba uzmi mapiranje response
        let tRespMapping = my_object_1.MyObject.get(this.mockData, "@propMappings.@response");
        if (!tRespMapping)
            tRespMapping = "@response";
        //AKO GAĐAMO ROOT
        if (!request.url) {
            my_color_loging_1.logLine.red('ROOT');
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
            (_b = my_object_1.MyObject.get(this.mockData, "@endpoints")) === null || _b === void 0 ? void 0 : _b.some((mockRow) => {
                tMatchedItem = this.matchRequest(mockRow, reqMapping, tRequestUrl, request, response, "MATCH_URL_PARAMS");
                if (tMatchedItem)
                    return true;
            });
        }
        //! MATCH REQUEST DINAMICALY *************************+
        if (!tMatchedItem) {
            //ako nemamo direktan match makni query parametre i idemo dolje u dinamički match
            tRequestUrl = tReqCustomUrlObj.pathname;
            (_c = my_object_1.MyObject.get(this.mockData, "@endpoints")) === null || _c === void 0 ? void 0 : _c.some((mockRow) => {
                tMatchedItem = this.matchRequest(mockRow, reqMapping, tRequestUrl, request, response, "MATCH_ROUTE");
                if (tMatchedItem)
                    return true;
            });
        }
        if (tMatchedItem == null) {
            my_color_loging_1.logLine.red(' 404 NOK');
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end('{ error: "REQUEST_NOT_MATCHED"}');
            return;
        }
        let tResponse = my_object_1.MyObject.get(tMatchedItem, tRespMapping);
        if (!tResponse) {
            my_color_loging_1.logLine.red(' 400 RESPONSE_EMPTY');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end('{ error: "RESPONSE_EMPTY"}');
            return;
        }
        let tBody = my_object_1.MyObject.get(tResponse, "@body");
        if (!tBody) {
            my_color_loging_1.logLine.red(' 400 RESPONSE_BODY_EMPTY');
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end('{ error: "RESPONSE_BODY_EMPTY"}');
            return;
        }
        let tResponseStr = JSON.stringify(tBody, null, 4);
        //!ako imamo url parametre onda in sad opet resolvaj sa pravim vrijednostima
        if (tMatchedItem.requestData &&
            tResponseStr.indexOf(":") !== -1 //ako u responseu imamo varijable
        ) {
            //Sad :[variable_name] zamjeni sa stvarnim vrjednostima
            //variable je objekt {key:"id", value: "123"}
            tMatchedItem.requestData.forEach((variable) => {
                tResponseStr = tResponseStr.replaceAll(":" + variable.key, variable.value);
                //sad ako treba makni string navodnike u jsou
                tResponseStr = tResponseStr.replaceAll("\"((", "");
                tResponseStr = tResponseStr.replaceAll("))\"", "");
            });
        }
        //Logiraj poziv
        my_color_loging_1.logLine.green(" 200 OK");
        my_color_loging_1.logLine.green("response: " + tResponseStr);
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
    matchRequest(mockRow, reqMapping, requestUrl, request, response, matchStrategy //MATCH_URL_PARAMS matchamo i path i query parametre | MATCH_ROUTE matchamo samo po pathu
    ) {
        var _a;
        //Razbij podatke na method i url
        let tMockRequestObj = my_object_1.MyObject.get(mockRow, reqMapping);
        if (!tMockRequestObj)
            return null;
        let tMockRequestUrl = my_object_1.MyObject.get(tMockRequestObj, "@url");
        if (!tMockRequestUrl)
            return null;
        let tParts = tMockRequestUrl.split(" ");
        if (!tParts)
            return null;
        const tMockMethod = (_a = tParts[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase();
        let tMockUrl = tParts[1];
        //Da li je ok metoda GET | POST | PUT | DELETE | * - bilokoja
        // logLine.white('check METHOD:' + tMockMethod);
        if ((!tMockMethod.startsWith("" + request.method)) &&
            (!tMockMethod.startsWith("*")))
            return null;
        let tMatchedItem = null;
        //ako imamo url parametre onda ih rasparsaj
        let tUrlParams = [];
        //Uzmi prave parametre i iz originalnog requesta
        this.getUrlParameters(request.url, tUrlParams);
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
            if (!(requestUrl === null || requestUrl === void 0 ? void 0 : requestUrl.match(tRegex + "$")))
                return null;
        }
        else {
            //* NORMALAN
            // if (!tRequestUrl?.startsWith(tUrl)) return false;
            if (requestUrl !== tMockUrl)
                return null;
        }
        tMatchedItem = mockRow;
        this.addUrlParameters(tMatchedItem, tUrlParams);
        return tMatchedItem;
    }
    //Dodaj url parametre u item
    //ili ih spoji sa path parametrima ako već psotoje
    addUrlParameters(matchedItem, urlParams) {
        if (!urlParams)
            return;
        if (!urlParams.length)
            return;
        if (!matchedItem)
            return;
        //AKo nemamo request param onda samo naljepi
        if (!matchedItem.requestData) {
            matchedItem.requestData = urlParams;
            return;
        }
        //inače pospoji
        matchedItem.requestData = [...matchedItem.requestData, ...urlParams];
    }
    //Izvadi url parametre i vrati čisti url
    getUrlParameters(pUrl, pUrlParam) {
        if (pUrl.indexOf("?") === -1)
            return;
        //! ovo je finta da imamo dobar URL
        const parsedUrl = new URL("http://localhost:" + this.port + pUrl);
        let tParams = parsedUrl.searchParams;
        //Obradi parametre
        if (tParams) {
            for (var entry of tParams.entries()) {
                let tItem = { key: entry[0], value: entry[1] };
                pUrlParam.push(tItem);
            }
        }
    }
    //Izvadi url parametre i vrati čisti url
    getUrlParameters_OLD(pUrl, pUrlParam) {
        if (pUrl.indexOf("?") === -1)
            return pUrl;
        let tNewUrl = pUrl;
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
        let tParams = parsedUrl.searchParams;
        //Obradi parametre
        if (tParams) {
            for (var entry of tParams.entries()) {
                let tItem = { key: entry[0], value: entry[1] };
                pUrlParam.push(tItem);
            }
        }
        //#2 Vrati samo url bez query string
        return tNewUrl;
    }
    /**
     * Ako u ruti imamo varijable onda probaj matchati routu
     */
    matchRoute(requestUrl, mockUrl, mockRow) {
        if (!mockUrl)
            return null;
        if (!requestUrl)
            return null;
        let tReqData = null; //ovo je  array objekata { key:'test' value: 1 }
        //Izbaci url paremetre
        const parsedUrl = new URL("http://localhost:" + this.port + mockUrl);
        let tMockUrl = parsedUrl.pathname;
        //ovako izgledaju route parametri
        if (tMockUrl.indexOf("/:") === -1)
            return null;
        //Uzmi djelove urla i matchaj
        var url2MatchParts = tMockUrl.split("/"); //npr: /user/:id
        if (url2MatchParts.length == 0)
            return null;
        var urlParts = requestUrl.split("/"); //npr: /user/1
        if (url2MatchParts.length != urlParts.length)
            return null;
        let urlMatched = true;
        //sad provjeri sve partove
        for (let index = 0; index < url2MatchParts.length; index++) {
            const part2Match = url2MatchParts[index];
            const part = urlParts[index];
            //Varijable
            if (part2Match.indexOf(":") !== -1) {
                let tPropName = part2Match.replaceAll(":", "");
                if (!tReqData)
                    tReqData = [];
                let tItem = { key: tPropName, value: part };
                tReqData.push(tItem);
            }
            else 
            //Normalni dio putanje ako ne odgovara
            {
                if (part2Match != part) {
                    urlMatched = false;
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
    listen(server) {
        server.listen(this.port, this.host);
        my_color_loging_1.logLine.green(`Listening at http://${this.host}:${this.port}`);
    }
}
exports.MyHttpHelper = MyHttpHelper;
//# sourceMappingURL=my-http-helper.js.map