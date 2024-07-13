# MOCK FILE STRUCTURE AND ATTRIBUTES

- all atributes begin with "@"
- support for minimal structure
- fix structure

## FULL STRUCTURE
example off all possible attributes
- some of them have default values and can be ommited
```json
{
    "@endpoints": [
        {
            "@request": {
                "@url":"GET /api/users/1",
                "@headers": [
                    {"content-type": "application/json"}
                ]
            },
            "@response": {
                "@status": 200,
                "@headers": [
                    {"content-type": "application/json"}
                ],
                "@body": {"id": 1,"title": "user 1"}
            }
        }
    ]
}
```

## REDUCED STRUCTURE
- is some atribute is missing we try to add them automaticalliy
```json
{
    "@endpoints": [
        {
            "@request": "GET /api/users/1",
            "@response": {"id": 1,"title": "user 1"}
        }
    ]
}
```
- because "@request" is string and not full json object it wil be internali treated as
```json
    "@request": {
        "@url":"GET /api/users/1",
        "@headers": [
            {"content-type": "application/json"}
        ]
    }
```

- because "@response" doesn't have "@body" whole "@response" will be treated as "@body"
```json
    "@response": {
        "@status": 200,
        "@headers": [
            {"content-type": "application/json"}
        ],
        "@body": {"id": 1,"title": "user 1"}
    }
```

## ATTRIBUTES

### @endpoints
  list of endpoints we would like to simulate

### @request
defines what request should be mocked

"@request":"[HTTP_VERB ROUTE]"
  - supports wildcards in VERB or ROUTE
    - "@request": "* /api/users/1",
    - "@request": "GET /api/*/1"
    - "@request": "GET /api/*",

  - HTTP_VERB - GET | PUT | POST | DELETE
  - ROUTE route of endpoint

### @response
    defines what response sqould be returned

  - response can bi simple
    - "@response": "OK"
    - "@response": { "id": 1 }
  - or can have aditional parameters
    - "@body" - any json
    - "@status" - default "200"
    - "@headers" -
    - "@content-type" default "application/json"
    - "@response": { "@body": {"id":1 }}
    - "@response": { "@status": 400, "@body": {"error":"INVALID_DATA" }}
