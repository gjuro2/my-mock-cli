import fs from 'fs';

/**
 * Globalne konfiguracije za testove
 */
export class MyTestHelper {

  constructor(workdir:string) {
    this.workDir = this.projectRoot+"/"+workdir;
  }

  //Work directory iz kojeg puštamo testove
  public projectRoot = "/home/dev/xoffice/my-mock-cli";
  public workDir = "";
  public testFile = "";

/**
 * Učitaj test file
 */
public getTestFile(pFile: string) {
  this.testFile = pFile
  return fs.readFileSync(this.workDir+"/"+this.testFile+".json", "utf8");
}

/**
 *Vrati putanju do testnog file-a
 * @param pFile
 * @returns 
 */
public getTestFilePath(pFile: string) {
  this.testFile = pFile
  return this.workDir+"/"+this.testFile+".json";
}


/**
 * Učitaj result file i formatiraj ga
 */
public getExpectedFile() {
  let tExpectedJsonString = fs.readFileSync(this.workDir+"/"+this.testFile+"-expected.json", "utf8");
  if (!tExpectedJsonString) return null;
  tExpectedJsonString = JSON.stringify(JSON.parse(tExpectedJsonString),null, 4);
  return tExpectedJsonString;
}

/**
 * Spremi result
 */
public saveResultFile(pText: string) {
  return fs.writeFileSync(this.workDir+"/"+this.testFile+"-result.json",pText, "utf8");
}


}
