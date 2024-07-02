/**
 * DEfinition of 1 endpoint maping
 */
export class MyMockDataRow {
    // "title": "get list",
    title?: string = "";
    //"request": "GET /api/users/1",
    request: string = "";
    //response json
    response: any;
}

/**
 * DEfinition of endpoint maping
 */
export class MyMockDataDefinition {
    // "title": "Sample mock API",
    title?: string;
    //default 3000
    port?: string;
    //mapping custom mock file structure to default
    propMappings?: MyPropMappings;
    //mapping definition
    mappings?: any;
}
 
/**
 * mapping custom mock file structure to default
 */
export class MyPropMappings {
    //"request": "endpoint",
    request?: string;

    // "response": "@resp.data"
    response?: string;
}