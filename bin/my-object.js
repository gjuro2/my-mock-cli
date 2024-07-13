"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyObject = void 0;
/**
 * Object helper
 */
class MyObject {
    /**
         * da li je naš objekt array
         */
    static isArray(pObj) {
        return Array.isArray(pObj) && pObj !== null;
    }
    /**
     * da li je naš objekt objekt
     */
    static isObject(pObj) {
        return typeof pObj === 'object' && pObj !== null;
    }
    /**
     *da li je naš objekt string
     */
    static isString(pObj) {
        return Object.prototype.toString.call(pObj) === "[object String]";
    }
    /**
     * dohvati atribut iz nekog objekta
     * podržavamo i nestanu strukturu
     */
    static get(pObj, pAttribute) {
        if (!pObj)
            return null;
        if (!pAttribute)
            return pObj;
        //Sad idi po atributima i uzmo vrijednost
        let tAttArr = pAttribute.split(".");
        let tCurrent = pObj;
        for (let index = 0; index < tAttArr.length; index++) {
            const tAttrName = tAttArr[index];
            tCurrent = tCurrent[tAttrName];
            if (!tCurrent) {
                tCurrent = null;
                break;
            }
        }
        return tCurrent;
    }
}
exports.MyObject = MyObject;
//# sourceMappingURL=my-object.js.map