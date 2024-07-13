/**
 * String helper
 */
export class MyString {

    /**
     * Formatiraj json string
     */
    static formatJson(tRez: string): string {
        let tObj = JSON.parse(tRez);
        return JSON.stringify(tObj,null, 4);
    }

    /**
     * izvadi varijeble iz stringa prema start i end delimiteru
     * {{var1}} ....
     */
    public static extract(str: any, beg: string, end: string) {
        const matcher = new RegExp(`${beg}(.*?)${end}`, 'gm');
        const normalise = (str: any) => str.slice(beg.length, end.length * -1);
        let tArr = str.match(matcher).map(normalise);

        //Vrati samo unique variable
        if (!tArr) return null;
        return [...new Set(tArr)];
    }
}