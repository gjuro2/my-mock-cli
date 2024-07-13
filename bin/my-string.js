"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyString = void 0;
/**
 * String helper
 */
class MyString {
    /**
     * Formatiraj json string
     */
    static formatJson(tRez) {
        let tObj = JSON.parse(tRez);
        return JSON.stringify(tObj, null, 4);
    }
    /**
     * izvadi varijeble iz stringa prema start i end delimiteru
     * {{var1}} ....
     */
    static extract(str, beg, end) {
        const matcher = new RegExp(`${beg}(.*?)${end}`, 'gm');
        const normalise = (str) => str.slice(beg.length, end.length * -1);
        let tArr = str.match(matcher).map(normalise);
        //Vrati samo unique variable
        if (!tArr)
            return null;
        return [...new Set(tArr)];
    }
}
exports.MyString = MyString;
//# sourceMappingURL=my-string.js.map