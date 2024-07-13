"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyTestHelper = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * Globalne konfiguracije za testove
 */
class MyTestHelper {
    constructor(workdir) {
        //Work directory iz kojeg puštamo testove
        this.projectRoot = "/home/dev/xoffice/my-mock-cli";
        this.workDir = "";
        this.testFile = "";
        this.workDir = this.projectRoot + "/" + workdir;
    }
    /**
     * Učitaj test file
     */
    getTestFile(pFile) {
        this.testFile = pFile;
        return fs_1.default.readFileSync(this.workDir + "/" + this.testFile + ".json", "utf8");
    }
    /**
     *Vrati putanju do testnog file-a
     * @param pFile
     * @returns
     */
    getTestFilePath(pFile) {
        this.testFile = pFile;
        return this.workDir + "/" + this.testFile + ".json";
    }
    /**
     * Učitaj result file i formatiraj ga
     */
    getExpectedFile() {
        let tExpectedJsonString = fs_1.default.readFileSync(this.workDir + "/" + this.testFile + "-expected.json", "utf8");
        if (!tExpectedJsonString)
            return null;
        tExpectedJsonString = JSON.stringify(JSON.parse(tExpectedJsonString), null, 4);
        return tExpectedJsonString;
    }
    /**
     * Spremi result
     */
    saveResultFile(pText) {
        return fs_1.default.writeFileSync(this.workDir + "/" + this.testFile + "-result.json", pText, "utf8");
    }
}
exports.MyTestHelper = MyTestHelper;
//# sourceMappingURL=my-test-helper.js.map