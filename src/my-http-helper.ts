import { log, logLine, myApp } from './my-color-loging';
import fs from 'fs';
import fse from 'fs-extra';
import path from "path";


import { MyMock_DataDefinition, MyMock_EndpointRow } from './my-mock-data';
import { MyObject } from './my-object';
import { version, name } from './version';
import { MyJsonTemplateHelper } from './my-json-template-helper';
import { Server, IncomingMessage, ServerResponse } from 'http';


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
        let tReqMapping: any = MyObject.get(this.mockData, "@propMappings.@request");
        if (!tReqMapping) tReqMapping = "@request";

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

        //! MATCH REQUEST DINAMICALY *************************+
        MyObject.get(this.mockData, "@endpoints")?.some((element: MyMock_EndpointRow | any) => {

            //Razbij podatke na method i url
            let tRequestObj = MyObject.get(element, tReqMapping)
            if (!tRequestObj) return;
            let tRequestUrl = MyObject.get(tRequestObj, "@url")
            if (!tRequestUrl) return;
            let tParts = tRequestUrl.split(" ");
            if (!tParts) return;

            const tMethod: string = tParts[0]?.toUpperCase();
            const tUrl = tParts[1];

            //Da li je ok metoda GET | POST | PUT | DELETE | * - bilokoja
            // logLine.white('check METHOD:' + tMethod);
            if (
                (!tMethod.startsWith("" + request.method)) &&
                (!tMethod.startsWith("*"))
            ) return false;

            //MATCH PO PARAMETRIMA U RUTI
            tMatchedItem = this.matchRoute(tUrl, request, response, element);
            if (tMatchedItem) {
                return true;
            }

            //Da li je ok url
            // logLine.white('check URL:' + tUrl);
            if (tUrl.indexOf("*") !== -1) {
                //*REGEX
                const tRegex = tUrl.replaceAll("*", ".*");
                if (!request.url?.match(tRegex + "$")) return false;
            } else {
                //* NORMALAN
                // if (!request.url?.startsWith(tUrl)) return false;
                if (request.url !== tUrl) return false;
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
        //     logLine.white('# Matched:' + getObjectValue(tMatchedItem,tReqMapping));
        // } else {
        //     logLine.white('# Matched:' + tMatchedItem.title);
        //     logLine.white('  request:' + getObjectValue(tMatchedItem,tReqMapping));
        // }

        //U suprotnom vrati response
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(tResponseStr);

    }

    /**
     * Ako u ruti imamo varijable onda probaj matchati routu
     */
    private matchRoute(tUrl: any, request: IncomingMessage, response: ServerResponse<IncomingMessage>, element: any): any {

        if (!tUrl) return null;
        if (!request.url) return null;
        if (tUrl.indexOf("/:") === -1) return null;


        //Uzmi djelove urla i matchaj
        var url2MatchParts = tUrl.split("/") //npr: /user/:id
        if (url2MatchParts.length == 0) return null;

        var urlParts = request.url.split("/") //npr: /user/1
        if (url2MatchParts.length != urlParts.length) return null;

        let urlMatched = true;
        let tReqData: any = null; //ovo je  array objekata { key:'test' value: 1 }

        //sad provjeri sve partove
        for (let index = 0; index < url2MatchParts.length; index++) {
            const part2Match = url2MatchParts[index];
            const part = urlParts[index];
            //Varijable
            if (part2Match.indexOf(":") !== -1) {
                let tPropName = part2Match.replaceAll(":", "");
                if (!tReqData) {
                    tReqData = [];

                }
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
            element.requestData = tReqData; //Stavi varijable u element
            return element;
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

