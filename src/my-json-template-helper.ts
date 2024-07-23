import Handlebars from "handlebars";
import fs from 'fs';
import path from "path";
import { logLine, myApp } from './my-color-loging';
import { MyObject } from "./my-object";
import { MyString } from "./my-string";

/* Koristimo handlebars kao templating engine sa custom doradama
- https://github.com/handlebars-lang/handlebars.js
- << >> za micanje navodnika na kraju jsona
- object
- array sa varijablom (idx)
- rnd sa varijabolm (rnd)
*/
let prolaz = 1;
let tRandom = 1;
let unresolved_variables: any = null;

export class MyJsonTemplateHelper {

    public static workDir = '';
    public static displayParsingSteps = false;
    public static files2Include: string[]; //lista fileova koje moramo includati, ali ih prvo trebamo proparsirati

    /**
     * Init variables
     */
    public static init() {
        prolaz = 1;
        tRandom = 1;
        MyJsonTemplateHelper.workDir = '';
        MyJsonTemplateHelper.files2Include = [];
    }

    /*
     * Parsiraj template i vrati ko Json objekt
     */
    public static parseAsObj(pJsonString: string, pRootFolder: string) {

        MyJsonTemplateHelper.init();
        this.workDir = pRootFolder;


        //REGISTRIRAJ HELPERE
        registerHelpers();

        //Prvo napravi eval templatea i podataka
        //tu izvadimo linkove i onda ih u drugom koraku sve obradimo i pospojimo
        logLine.yellow("Parsing MAIN mock file!")
        let tRezString = MyJsonTemplateHelper.evalTemplateAsString(pJsonString, pJsonString, true, logLine.yellow);

        //AKO IMAMI sad obradi 1 po 1 include file i dodaj "@endpoints" u našu strukturu
        let tJsonObj = MyJsonTemplateHelper.parseIncludeFiles(tRezString);

        //Ako nemamo endpointe onda vrati null
        let tEndpoints = MyObject.get(tJsonObj, "@endpoints");
        if (!tEndpoints || tEndpoints.length == 0) return null;

        return tJsonObj;
    }

    //sad obradi 1 po 1 file i dodaj "@endpoints" u našu strukturu
    public static parseIncludeFiles(jsonFileString: string) {
        if (!jsonFileString) return null;
        let jsonFileObj: any = JSON.parse(jsonFileString)
        if (!this.files2Include || this.files2Include.length == 0) {
            return jsonFileObj;
        }
        logLine.blue("Parsing include files!")
        this.files2Include.forEach(file => {
            let file1Str = MyJsonTemplateHelper.parseInclude1File(file);
            //Sad uzi mappinge i dodaj ih na kraj našeg filea
            let file1Obj: any = JSON.parse(file1Str)
            if (file1Obj["@endpoints"]) {
                logLine.green("#3 @endpoints added! file=" + file);
                jsonFileObj["@endpoints"] = jsonFileObj["@endpoints"].concat(file1Obj["@endpoints"]);
            } else {
                logLine.red(`#ERR include file: "${file}" has invlid structure! (missing "@endpoints": [...])`)
            }
            jsonFileObj["@endpoints"] = jsonFileObj["@endpoints"].filter((e: any) => e !== "##" + file + "##");
        });

        //Zalogiraj konačni file
        if (MyJsonTemplateHelper.displayParsingSteps) {
            let finalFile = JSON.stringify(jsonFileObj, null, 2);
            logLine.yellow("# Final json: *****************")
            logLine.yellow(finalFile)
        }
        return jsonFileObj;
    }

    /**
     * Pariraj jedan file
     */
    static parseInclude1File(file: string) {
        let tFullFilePath = file;
        logLine.blue("#1 file=" + tFullFilePath)
        // console.log("#1 work="+MyJsonTemplateHelper.workDir)
        if (!path.isAbsolute(file)) {
            tFullFilePath = MyJsonTemplateHelper.workDir + "/" + file;
            logLine.blue("#2 file=" + tFullFilePath)
        }
        let tJsonStr = fs.readFileSync(tFullFilePath, "utf8");
        var tRezStr = MyJsonTemplateHelper.evalTemplateAsString(tJsonStr, tJsonStr, true, logLine.blue);
        return tRezStr;
    }

    //! *********************************************************************
    /**
     * Vrati string sa posacima
     */
    static evalTemplateAsString(pTemplate: string, pDataJson: string, pReplace = false, logger: any): any {
        //Pretvori u Objekt
        var tJsonObj: any = JSON.parse(pDataJson);
        tJsonObj = MyJsonTemplateHelper.fixStructure(tJsonObj);
        //Sad provjeri da li imamo endpointe
        let tEndpoints = tJsonObj["@endpoints"];
        if (!tJsonObj || !tEndpoints || tEndpoints.length == 0) return null;

        let tTemplate = JSON.stringify(tJsonObj, null, 4);


        //pusti handlebars kroz njega
        const template = Handlebars.compile(tTemplate, { noEscape: true });

        //AKO FALI DODAJ "idx": 0, jer nam treba kao specijalna varijabla za templete arraya
        //Ako postoji u pravi podacima idx varijabla ništa se neće dogoditi jer ju koristimo samo temporary kod array-a
        //no ako ju ne inicijaliziramo konaćni json neće iti validan pa moramo napraviti ovu fintu
        if (tJsonObj.idx === undefined) tJsonObj.idx = 1;
        //isto vrijedi i za random
        if (tJsonObj.rnd === undefined) tJsonObj.rnd = 1;


        var tRez = template(tJsonObj)

        //!pošto nakon evaluacije templatea se mogu opet pojaviti varijable napravi isto
        //Ako imamo varijable iz requesta njih nemoj još zamjeniti
        if (tRez.indexOf("<<:") !== -1) {
            let tRez1: any = MyString.extract(tRez, "<<:", ">>")
            if (tRez1) {
                tRez1.forEach((element: string) => {
                    let tVar = "<<:" + element + ">>";
                    tRez = tRez.replaceAll(tVar, "((:" + element + "))")
                });
            }
        }

        //Ako treba makni navodnike to je ova specijalna sintaksa
        if (pReplace) {
            tRez = tRez.replaceAll("\"<<", "");
            tRez = tRez.replaceAll(">>\"", "");
        }
        tRez = MyString.formatJson(tRez);
        if (MyJsonTemplateHelper.displayParsingSteps) {
            logger("# Variable parsing step:" + (prolaz++) + " *****************************")
            //Ovo radimo da nam rsponse uvijek b logu bude formatiran
            logger(tRez)
        }
        //sada ako treba napravi drugi prolaz evaluacije da se opet varijable resolvaju
        if (tRez.indexOf("{{") != -1) {

            //FIX: za infinite loop
            if (pTemplate == tRez) {
                //Uzmi sve unique varijable
                let tVar1Array:any = MyString.extract(tRez, "{{", "}}")
                let tArrFinal = tVar1Array?.map( (i:any) => "{{"+i+"}}")
                let tVar1Str = tArrFinal.join(",");

                logLine.red("#problematic variables:");
                logLine.red(tVar1Str);
                myApp.exit("#ERROR: INFINITE LOOP DETECTED check variables that cant be resolved!");
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
    static fixStructure(pJsonObj: any): any {
        if (!pJsonObj) return null;
        let tEndpints = MyObject.get(pJsonObj, "@endpoints");
        if (!tEndpints) return;
        let idx = 0;
        let tEndpointArrNew: any = [];

        //Prođi sve endpoie i uzmi smo one koji su dobri
        tEndpints.some((element: any) => {
            idx++;
            let tEndpoint = MyJsonTemplateHelper.getEndpoint(element, idx);
            if (tEndpoint) tEndpointArrNew.push(tEndpoint);
        });
        pJsonObj["@endpoints"] = tEndpointArrNew;
        return pJsonObj;
    }

    /**
     * Parsaj i vrati jedan endpoint element
     */
    static getEndpoint(pElement: any, idx: number): any {

        if (!pElement) return null;

        //FIX za include file
        if (MyObject.isString(pElement)) {
            if (pElement.indexOf("{{file") != -1) return pElement;
        }
        let tEndpoint = {
            "@request": null,
            "@response": null
        }

        //Prvo parsaj request
        let tRequest = MyJsonTemplateHelper.getRequest(pElement);
        if (!tRequest) {
            logLine.red(`# Missing or invalid "@request" attribute on element: ${idx} `);
            return null;
        }
        tEndpoint["@request"] = tRequest;

        //Sad response
        let tRsponse = MyJsonTemplateHelper.getResponse(pElement);
        if (!tRsponse) {
            let tUrl = tRequest["@url"];
            logLine.red(`# Missing or invalid "@response" attribute on "@request": ${tUrl} `);
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
    static getRequest(pElement: any): any {
        //Preskoči elemente koji se nemogu popraviti
        let tRequest = MyObject.get(pElement, "@request");
        if (!tRequest) return null;

        let tRequestNew = {
            "@url": null,
            "@headers": [
                { "content-type": "application/json" }
            ]
        }

        //! Ako je string dodaj u pravoj strukturi
        if (MyObject.isString(tRequest)) {
            tRequestNew["@url"] = tRequest;
            return tRequestNew;
        }

        //! ako NIJE je objekt vrati null
        if (!MyObject.isObject(tRequest)) {
            return null;
        }

        //Ako nemamo url vrati null
        let tUrl = MyObject.get(tRequest, "@url");
        if (!tUrl) return null;
        tRequestNew["@url"] = tUrl;

        //Dodaj headera ako ih imamo
        let tHeaders = MyObject.get(tRequest, "@headers");
        if (tHeaders) tRequestNew["@headers"] = tHeaders;

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
    static getResponse(pElement: any): any {
        //Preskoči elemente koji se nemogu popraviti
        let tResponse = MyObject.get(pElement, "@response");
        if (!tResponse) return null;

        let tNew = {
            "@status": 200,
            "@headers": [
                { "content-type": "application/json" }
            ],
            "@body": null
        }

        //! Ako je string dodaj u pravoj strukturi
        if (MyObject.isString(tResponse)) {
            tNew["@body"] = tResponse;
            return tNew;
        }

        //! ako NIJE je objekt vrati null
        if (!MyObject.isObject(tResponse)) {
            return null;
        }

        //Ako nemamo body onda je body dobiveni objekt
        let tBody = MyObject.get(tResponse, "@body");
        if (!tBody) tBody = tResponse;
        tNew["@body"] = tBody;

        //Dodaj headera ako ih imamo
        let tHeaders = MyObject.get(tResponse, "@headers");
        if (tHeaders) tNew["@headers"] = tHeaders;

        //Dodaj status ako ga imamo
        let status = MyObject.get(tResponse, "@status");
        if (tHeaders) tNew["@status"] = status;

        return tNew;
    }

}


//! *********************************************************************
function registerHelpers() {
    //Vrati objekt
    Handlebars.registerHelper('object', function (pDataTemplate, idx) {
        if (!pDataTemplate) return null;
        let tText = JSON.stringify(pDataTemplate);
        //<< >> stripa " tako da dobijemo json objekt"
        return "<<" + tText.replaceAll("{{idx}}", "" + idx) + ">>";
    });

    //Kreiraj array objekata
    Handlebars.registerHelper('array', function (pDataTemplate, pCoutnt: number) {
        if (!pDataTemplate) return null;
        // const template = Handlebars.compile(pDataTemplate,{noEscape: true});
        //var tRez = template(pData)
        let tRez: any = [];
        if (!pCoutnt) return tRez;
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
    Handlebars.registerHelper('rnd', function (min, max) {
        if (min === undefined) return tRandom;
        if (max === undefined) return tRandom;
        tRandom = Math.floor(Math.random() * (max - min + 1) + min);
        return tRandom;
    });

    Handlebars.registerHelper('file', function (file) {
        //Prvo uzmi sve fileove u array
        MyJsonTemplateHelper.files2Include.push(file);
        return "##" + file + "##"; //Prvo stavljamo ovu oznako a onda na kraju replacamo
    });

}

