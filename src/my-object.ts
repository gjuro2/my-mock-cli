/**
 * Object helper
 */
export class MyObject {

    /**
         * da li je naš objekt array
         */
    public static isArray(pObj: any) {
        return Array.isArray(pObj) && pObj !== null
    }

    /**
     * da li je naš objekt objekt
     */
    public static isObject(pObj: any) {
        return typeof pObj === 'object' && pObj !== null
    }

    /**
     *da li je naš objekt string
     */
    public static isString(pObj: any) {
        return Object.prototype.toString.call(pObj) === "[object String]"
    }

    /**
     * dohvati atribut iz nekog objekta
     * podržavamo i nestanu strukturu
     */
    public static get(pObj: any, pAttribute: any) {
        if (!pObj) return null;
        if (!pAttribute) return pObj;

        //Sad idi po atributima i uzmo vrijednost
        let tAttArr: string[] = pAttribute.split(".");

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