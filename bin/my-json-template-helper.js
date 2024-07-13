"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyJsonTemplateHelper = void 0;
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const my_color_loging_1 = require("./my-color-loging");
const my_object_1 = require("./my-object");
const my_string_1 = require("./my-string");
/* Koristimo handlebars kao templating engine sa custom doradama
- https://github.com/handlebars-lang/handlebars.js
- << >> za micanje navodnika na kraju jsona
- object
- array sa varijablom (idx)
- rnd sa varijabolm (rnd)
*/
let prolaz = 1;
let tRandom = 1;
let unresolved_variables = null;
class MyJsonTemplateHelper {
    /**
     * Init variables
     */
    static init() {
        prolaz = 1;
        tRandom = 1;
        MyJsonTemplateHelper.workDir = '';
        MyJsonTemplateHelper.files2Include = [];
    }
    /*
     * Parsiraj template i vrati ko Json objekt
     */
    static parseAsObj(pJsonString, pRootFolder) {
        MyJsonTemplateHelper.init();
        this.workDir = pRootFolder;
        //REGISTRIRAJ HELPERE
        registerHelpers();
        //Prvo napravi eval templatea i podataka
        //tu izvadimo linkove i onda ih u drugom koraku sve obradimo i pospojimo
        my_color_loging_1.logLine.yellow("Parsing MAIN mock file!");
        let tRezString = MyJsonTemplateHelper.evalTemplateAsString(pJsonString, pJsonString, true, my_color_loging_1.logLine.yellow);
        //AKO IMAMI sad obradi 1 po 1 include file i dodaj "@endpoints" u našu strukturu
        let tJsonObj = MyJsonTemplateHelper.parseIncludeFiles(tRezString);
        //Ako nemamo endpointe onda vrati null
        let tEndpoints = my_object_1.MyObject.get(tJsonObj, "@endpoints");
        if (!tEndpoints || tEndpoints.length == 0)
            return null;
        return tJsonObj;
    }
    //sad obradi 1 po 1 file i dodaj "@endpoints" u našu strukturu
    static parseIncludeFiles(jsonFileString) {
        if (!jsonFileString)
            return null;
        let jsonFileObj = JSON.parse(jsonFileString);
        if (!this.files2Include || this.files2Include.length == 0) {
            return jsonFileObj;
        }
        my_color_loging_1.logLine.blue("Parsing include files!");
        this.files2Include.forEach(file => {
            let file1Str = MyJsonTemplateHelper.parseInclude1File(file);
            //Sad uzi mappinge i dodaj ih na kraj našeg filea
            let file1Obj = JSON.parse(file1Str);
            if (file1Obj["@endpoints"]) {
                my_color_loging_1.logLine.green("#3 @endpoints added! file=" + file);
                jsonFileObj["@endpoints"] = jsonFileObj["@endpoints"].concat(file1Obj["@endpoints"]);
            }
            else {
                my_color_loging_1.logLine.red(`#ERR include file: "${file}" has invlid structure! (missing "@endpoints": [...])`);
            }
            jsonFileObj["@endpoints"] = jsonFileObj["@endpoints"].filter((e) => e !== "##" + file + "##");
        });
        //Zalogiraj konačni file
        if (MyJsonTemplateHelper.displayParsingSteps) {
            let finalFile = JSON.stringify(jsonFileObj, null, 2);
            my_color_loging_1.logLine.yellow("# Final json: *****************");
            my_color_loging_1.logLine.yellow(finalFile);
        }
        return jsonFileObj;
    }
    /**
     * Pariraj jedan file
     */
    static parseInclude1File(file) {
        let tFullFilePath = file;
        my_color_loging_1.logLine.blue("#1 file=" + tFullFilePath);
        // console.log("#1 work="+MyJsonTemplateHelper.workDir)
        if (!path_1.default.isAbsolute(file)) {
            tFullFilePath = MyJsonTemplateHelper.workDir + "/" + file;
            my_color_loging_1.logLine.blue("#2 file=" + tFullFilePath);
        }
        let tJsonStr = fs_1.default.readFileSync(tFullFilePath, "utf8");
        var tRezStr = MyJsonTemplateHelper.evalTemplateAsString(tJsonStr, tJsonStr, true, my_color_loging_1.logLine.blue);
        return tRezStr;
    }
    //! *********************************************************************
    /**
     * Vrati string sa posacima
     */
    static evalTemplateAsString(pTemplate, pDataJson, pReplace = false, logger) {
        //Pretvori u Objekt
        var tJsonObj = JSON.parse(pDataJson);
        tJsonObj = MyJsonTemplateHelper.fixStructure(tJsonObj);
        //Sad provjeri da li imamo endpointe
        let tEndpoints = tJsonObj["@endpoints"];
        if (!tJsonObj || !tEndpoints || tEndpoints.length == 0)
            return null;
        let tTemplate = JSON.stringify(tJsonObj, null, 4);
        //pusti handlebars kroz njega
        const template = handlebars_1.default.compile(tTemplate, { noEscape: true });
        //AKO FALI DODAJ "idx": 0, jer nam treba kao specijalna varijabla za templete arraya
        //Ako postoji u pravi podacima idx varijabla ništa se neće dogoditi jer ju koristimo samo temporary kod array-a
        //no ako ju ne inicijaliziramo konaćni json neće iti validan pa moramo napraviti ovu fintu
        if (tJsonObj.idx === undefined)
            tJsonObj.idx = 1;
        //isto vrijedi i za random
        if (tJsonObj.rnd === undefined)
            tJsonObj.rnd = 1;
        var tRez = template(tJsonObj);
        //!pošto nakon evaluacije templatea se mogu opet pojaviti varijable napravi isto
        //Ako imamo varijable iz requesta njih nemoj još zamjeniti
        if (tRez.indexOf("<<:") !== -1) {
            let tRez1 = my_string_1.MyString.extract(tRez, "<<:", ">>");
            if (tRez1) {
                tRez1.forEach((element) => {
                    let tVar = "<<:" + element + ">>";
                    tRez = tRez.replaceAll(tVar, "((:" + element + "))");
                });
            }
        }
        //Ako treba makni navodnike to je ova specijalna sintaksa
        if (pReplace) {
            tRez = tRez.replaceAll("\"<<", "");
            tRez = tRez.replaceAll(">>\"", "");
        }
        tRez = my_string_1.MyString.formatJson(tRez);
        if (MyJsonTemplateHelper.displayParsingSteps) {
            logger("# Variable parsing step:" + (prolaz++) + " *****************************");
            //Ovo radimo da nam rsponse uvijek b logu bude formatiran
            logger(tRez);
        }
        //sada ako treba napravi drugi prolaz evaluacije da se opet varijable resolvaju
        if (tRez.indexOf("{{") != -1) {
            //FIX: za infinite loop
            if (pTemplate == tRez) {
                //Uzmi sve unique varijable
                let tVar1Array = my_string_1.MyString.extract(tRez, "{{", "}}");
                let tArrFinal = tVar1Array === null || tVar1Array === void 0 ? void 0 : tVar1Array.map((i) => "{{" + i + "}}");
                let tVar1Str = tArrFinal.join(",");
                my_color_loging_1.logLine.red("#problematic variables:");
                my_color_loging_1.logLine.red(tVar1Str);
                my_color_loging_1.myApp.exit("#ERROR: INFINITE LOOP DETECTED check variables that cant be resolved!");
            }
            // let tVar1Array = MyString.extract(tRez, "{{", "}}")
            // let tVar1ArrayUX = [...new Set(tVar1Array)];
            // let tArrFinal = tVar1ArrayUX.map( i => "{{"+i+"}}")
            // let tVar1Str = tArrFinal.join(",");
            // if (tVar1Str && unresolved_variables == tVar1Str) {
            // // if (prolaz > 10) {
            //     logLine.red("#ERROR: INFINITE LOOP DETECTED check variables that cant be resolved {{var}}");
            //     logLine.red("#problematic variables:");
            //     logLine.red(tVar1Str);
            //     process.exit(1)
            // }
            // unresolved_variables == tVar1Str
            //namjerno koristimo ulazne podatke i novi template
            return MyJsonTemplateHelper.evalTemplateAsString(tRez, pDataJson, true, logger);
        }
        return tRez;
    }
    //! *********************************************************************
    //Svedi na zadanu strukturu ako je moguce
    static fixStructure(pJsonObj) {
        if (!pJsonObj)
            return null;
        let tEndpints = my_object_1.MyObject.get(pJsonObj, "@endpoints");
        if (!tEndpints)
            return;
        let idx = 0;
        let tEndpointArrNew = [];
        //Prođi sve endpoie i uzmi smo one koji su dobri
        tEndpints.some((element) => {
            idx++;
            let tEndpoint = MyJsonTemplateHelper.getEndpoint(element, idx);
            if (tEndpoint)
                tEndpointArrNew.push(tEndpoint);
        });
        pJsonObj["@endpoints"] = tEndpointArrNew;
        return pJsonObj;
    }
    /**
     * Parsaj i vrati jedan endpoint element
     */
    static getEndpoint(pElement, idx) {
        if (!pElement)
            return null;
        let tEndpoint = {
            "@request": null,
            "@response": null
        };
        //Prvo parsaj request
        let tRequest = MyJsonTemplateHelper.getRequest(pElement);
        if (!tRequest) {
            my_color_loging_1.logLine.red(`# Missing or invalid "@request" attribute on element: ${idx} `);
            return null;
        }
        tEndpoint["@request"] = tRequest;
        //Sad response
        let tRsponse = MyJsonTemplateHelper.getResponse(pElement);
        if (!tRsponse) {
            let tUrl = tRequest["@url"];
            my_color_loging_1.logLine.red(`# Missing or invalid "@response" attribute on "@request": ${tUrl} `);
            return null;
        }
        tEndpoint["@response"] = tRsponse;
        return tEndpoint;
    }
    /**
     * Uzmi request objekt i vrati ga u cjeloj strukturi
     * {
         "@url": "GET /api/users/1",
         "@headers": [
             {"content-type": "application/json"}
         ]
        }
     */
    static getRequest(pElement) {
        //Preskoči elemente koji se nemogu popraviti
        let tRequest = my_object_1.MyObject.get(pElement, "@request");
        if (!tRequest)
            return null;
        let tRequestNew = {
            "@url": null,
            "@headers": [
                { "content-type": "application/json" }
            ]
        };
        //! Ako je string dodaj u pravoj strukturi
        if (my_object_1.MyObject.isString(tRequest)) {
            tRequestNew["@url"] = tRequest;
            return tRequestNew;
        }
        //! ako NIJE je objekt vrati null
        if (!my_object_1.MyObject.isObject(tRequest)) {
            return null;
        }
        //Ako nemamo url vrati null
        let tUrl = my_object_1.MyObject.get(tRequest, "@url");
        if (!tUrl)
            return null;
        tRequestNew["@url"] = tUrl;
        //Dodaj headera ako ih imamo
        let tHeaders = my_object_1.MyObject.get(tRequest, "@headers");
        if (tHeaders)
            tRequestNew["@headers"] = tHeaders;
        return tRequestNew;
    }
    /**
     * Uzmi response objekt i vrati ga u cjeloj strukturi
       {
            "@status": 200,
            "@headers": [
                {"content-type": "application/json"}
            ],
            "@body": {
                "id": 1,
                "title": "test 1"
            }
        }
     */
    static getResponse(pElement) {
        //Preskoči elemente koji se nemogu popraviti
        let tResponse = my_object_1.MyObject.get(pElement, "@response");
        if (!tResponse)
            return null;
        let tNew = {
            "@status": 200,
            "@headers": [
                { "content-type": "application/json" }
            ],
            "@body": null
        };
        //! Ako je string dodaj u pravoj strukturi
        if (my_object_1.MyObject.isString(tResponse)) {
            tNew["@body"] = tResponse;
            return tNew;
        }
        //! ako NIJE je objekt vrati null
        if (!my_object_1.MyObject.isObject(tResponse)) {
            return null;
        }
        //Ako nemamo body onda je body dobiveni objekt
        let tBody = my_object_1.MyObject.get(tResponse, "@body");
        if (!tBody)
            tBody = tResponse;
        tNew["@body"] = tBody;
        //Dodaj headera ako ih imamo
        let tHeaders = my_object_1.MyObject.get(tResponse, "@headers");
        if (tHeaders)
            tNew["@headers"] = tHeaders;
        //Dodaj status ako ga imamo
        let status = my_object_1.MyObject.get(tResponse, "@status");
        if (tHeaders)
            tNew["@status"] = status;
        return tNew;
    }
}
exports.MyJsonTemplateHelper = MyJsonTemplateHelper;
MyJsonTemplateHelper.workDir = '';
MyJsonTemplateHelper.displayParsingSteps = false;
//! *********************************************************************
function registerHelpers() {
    //Vrati objekt
    handlebars_1.default.registerHelper('object', function (pDataTemplate, idx) {
        if (!pDataTemplate)
            return null;
        let tText = JSON.stringify(pDataTemplate);
        //<< >> stripa " tako da dobijemo json objekt"
        return "<<" + tText.replaceAll("{{idx}}", "" + idx) + ">>";
    });
    //Kreiraj array objekata
    handlebars_1.default.registerHelper('array', function (pDataTemplate, pCoutnt) {
        if (!pDataTemplate)
            return null;
        // const template = Handlebars.compile(pDataTemplate,{noEscape: true});
        //var tRez = template(pData)
        let tRez = [];
        if (!pCoutnt)
            return tRez;
        for (let index = 0; index < pCoutnt; index++) {
            let tText = JSON.stringify(pDataTemplate);
            tText = tText.replaceAll("{{idx}}", "" + (index + 1));
            tRez.push(JSON.parse(tText));
        }
        let tText = JSON.stringify(tRez);
        //<< >> stripa " tako da dobijemo json objekt"
        return "<<" + tText + ">>";
    });
    //Generiraj ili vrati Random broj
    handlebars_1.default.registerHelper('rnd', function (min, max) {
        if (min === undefined)
            return tRandom;
        if (max === undefined)
            return tRandom;
        tRandom = Math.floor(Math.random() * (max - min + 1) + min);
        return tRandom;
    });
    handlebars_1.default.registerHelper('file', function (file) {
        //Prvo uzmi sve fileove u array
        MyJsonTemplateHelper.files2Include.push(file);
        return "##" + file + "##"; //Prvo stavljamo ovu oznako a onda na kraju replacamo
    });
}
//# sourceMappingURL=my-json-template-helper.js.map