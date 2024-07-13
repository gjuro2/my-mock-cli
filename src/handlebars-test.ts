/**
 * Primmjer korištenja handlebarsa
 * pokretanje
 *  node bin/handlebars-test.js
 */
import Handlebars from "handlebars";
import fs from 'fs';
import path from "path";


let prolaz = 1;
let tRandom = 1;

//1 load podataka iz jsona
// let tFile = "/home/dev/xoffice/my-mock-cli/samples/mock-variables.json";
let tFile = "/home/dev/xoffice/my-mock-cli/src/samples/multiple-files1/mock-multiple-files1.json";
// let tFile = "src/samples/multiple-files1/mock-multiple-files1.json";

let tFolder = path.dirname(tFile)
let tJsonStr = fs.readFileSync(tFile, "utf8");

//REGISTRIRAJ HELPERE
registerHelpers();

//Prvo napravi eval templatea i podataka
var tRez = evalTemplate(tJsonStr, tJsonStr, true);


//3 i sad sve pretvori u json objekt
var tJsonObj: any = JSON.parse(tRez);

//! *********************************************************************
function evalTemplate(pTemplate: string, pDataJson: string, pReplace = false) {
    //Pretvori u Objekt
    var tJsonObj: any = JSON.parse(pDataJson);
    //pusti handlebars kroz njega
    const template = Handlebars.compile(pTemplate,{noEscape: true});

    //AKO FALI DODAJ "idx": 0, jer nam treba kao specijalna varijabla za templete arraya
    //Ako postoji u pravi podacima idx varijabla ništa se neće dogoditi jer ju koristimo samo temporary kod array-a
    //no ako ju ne inicijaliziramo konaćni json neće iti validan pa moramo napraviti ovu fintu
    if (tJsonObj.idx === undefined) tJsonObj.idx = 1;
    //isto vrijedi i za random
    if (tJsonObj.rnd === undefined) tJsonObj.rnd = 1;


    var tRez = template(tJsonObj)

    //Ako treba makni navodnike to je ova specijalna sintaksa
    if (pReplace) {
        tRez = tRez.replaceAll("\"<<", "");
        tRez = tRez.replaceAll(">>\"", "");
    }
    console.log("# Prolaz:"+ (prolaz++)+ " *****************************")
    console.log(tRez)
    //sada ako treba napravi drugi prolaz evaluacije da se opet varijable resolvaju
    if (tRez.indexOf("{{") != -1) {
        //namjerno koristimo ulazne podatke i novi template
        return evalTemplate(tRez, pDataJson, true);
    }
    return tRez;
}

//! *********************************************************************
function registerHelpers() {
    //Vrati objekt
    Handlebars.registerHelper('object', function (pDataTemplate, idx) {
        let tText = JSON.stringify(pDataTemplate);
        return "<<"+tText.replaceAll("{{idx}}", ""+idx)+">>";
    });

    //Kreiraj array objekata
    Handlebars.registerHelper('array', function (pDataTemplate, pCoutnt: number ) {
        // const template = Handlebars.compile(pDataTemplate,{noEscape: true});
        //var tRez = template(pData)
        if (!pDataTemplate) return null;
        let tRez: any = [];
        if (!pCoutnt) return tRez;
        for (let index = 0; index < pCoutnt; index++) {
            let tText = JSON.stringify(pDataTemplate);
            tText = tText.replaceAll("{{idx}}", ""+(index+1));
            tRez.push(JSON.parse(tText));
        }
        let tText = JSON.stringify(tRez);
        return "<<"+tText+">>";
    });

    //Generiraj ili vrati Random broj
    Handlebars.registerHelper('rnd', function (min, max) {
        if (min === undefined) return tRandom;
        if (max === undefined) return tRandom;
        tRandom = Math.floor(Math.random() * (max - min + 1) + min);
        return tRandom;
    });


    Handlebars.registerHelper('file', function (file) {
        let tFullFilePath = file;
        if (!path.isAbsolute(file)) {
            tFullFilePath = tFolder+"/"+file;
        }
        let tJsonStr = fs.readFileSync(tFullFilePath, "utf8");

        //makni [] tako da na kraju imamo dobar array iz kombiniranih fileova
        tJsonStr = JSON.stringify(JSON.parse(tJsonStr))
        if (tJsonStr.startsWith("[")) tJsonStr = tJsonStr.substring(1)
        if (tJsonStr.endsWith("]")) tJsonStr = tJsonStr.slice(0, -1);
        return "<<"+tJsonStr+">>";
    });

}
