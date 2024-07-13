/**
 * Main definition of MOCK structure
 */
export class MyMock_DataDefinition {
    // "title": "Sample mock API",
    title?: string;
    //default 3000
    port?: string;
    //mapping custom mock file structure to default
    "@propMappings"?: MyPropMappings;
    //mapping definition
    "@endpoints"?: MyMock_EndpointRow[];
}

/**
 * mapping custom mock file structure to default
 */
export class MyPropMappings {
    //"request": "endpoint",
    "@request"?: string;

    // "response": "@resp.data"
    "@response"?: string;
}

/**
 * DEfinition of 1 endpoint maping
 */
export class MyMock_EndpointRow {
    // "title": "get list",
    title?: string = "";
    //"request": "GET /api/users/1",
    "@request": MyMock_EndpointRow_Request;
    //response json
    "@response": MyMock_EndpointRow_Response;

    //!Interna polja
    /*
        podaci parametri iz requesta koristi se interno kad imamo varijable u url parametrima
        variable je objekt {key:"id", value: "123"}
    */
    requestData: any;

}

/**
 * Request
 */
export class MyMock_EndpointRow_Request {
    //"@url": "GET /api/users/1",
    "@url": string;

    // "@headers": [
    //     {"content-type": "application/json"}
    // ]
    "@headers": any[];
}

/**
 * Request
 */
export class MyMock_EndpointRow_Response {
    //"@status": 200,
    "@status": string;

    // "@headers": [
    //     {"content-type": "application/json"}
    // ]
    "@headers": any[];

    //"@body": {
    //    "id": 1,
    //    "title": "test 1"
    //}
    "@body": any;

}