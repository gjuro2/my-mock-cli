# my-mock-cli
![Static Badge](https://img.shields.io/badge/licence-MIT-blue)


Simple mock HTTP API using json config

# USAGE
Install
```sh
  npm install -g @gjuro/my-mock-cli
```
Create default sample file: mock.json
```sh
  my-mock-cli --init
```

Start server
```sh
  my-mock-cli
```
goto: [http://localhost:3000/api/users/1](http://localhost:3000/api/users/1), you will get
```json
  {"id":1,"title":"test 1"}
```

## PARAMS

| Name | Type    | Required | Description                                    |
| ---- | ------- | -------- | ---------------------------------------------- |
| port | int     | No       | Port on localhost default 3000 |
| init | string  | No       | Init sample 'mock.json' file      |
| [filename.json]| string | No       | file or full path to mock file - default mock.json |

## USEGE EXAMPLES
- my-mock-cli --init
- my-mock-cli --port=1000
- my-mock-cli --port=1000 test.json

## SAMPLE MOCK FILE
- example config file mock.json
```json
{
    "title": "Sample mock API",
    "mappings": [
        {
            "request": "GET /api/users/1",
            "response": {
                "body": {
                    "id": 1,
                    "title": "test 1"
                }
            }
        },
        {
            "title": "get list",
            "request": "POST /api/users",
            "response": {
                "body": [
                    {
                        "id": 1,
                        "title": "test 1"
                    },
                    {
                        "id": 2,
                        "title": "test 2"
                    },
                    {
                        "id": 3,
                        "title": "test 3"
                    }
                ]
            }
        },
        {
            "title": "get first matching endpoint any HTTP method ",
            "request": "* /api/users/1",
            "response": {
                "body": {
                    "id": "1",
                    "title": "test 1"
                }
            }
        },
        {
            "title": "get first mathing endpoint",
            "request": "POST /api/*/1",
            "response": {
                "body": {
                    "id": "1",
                    "title": "test 1"
                }
            }
        }
    ]
}
```

## MAPPING CUSTOM LOG FILE to MOCK API
- example maps custom log file to API
- in 'mappings' is content of log file
- 'propMappings' defines mapping to API
```json
{
    "title": "Sample mock API from log file",
    "propMappings": {
        "request": "endpoint",
        "response": "@resp.data"
    },
    "mappings": [
        {
            "@t": "2024-06-12T13:51:40.9408113+02:00",
            "@scope": "HTTP_OUT",
            "endpoint": "GET /api/users/1",
            "requestId": "2be2d1dd2fd91",
            "jti": "ff5f45e1-1551-45fc-b11d-b92aa7bda4c2",
            "@resp": {
                "HttpStatusCode": "OK",
                "data": {
                    "id": 1,
                    "title": "User 1"
                }
            },
            "@dur": "00:07.2814"
        },
        {
            "@t": "2024-06-12T13:51:40.9408113+02:00",
            "@scope": "HTTP_OUT",
            "endpoint": "GET /api/users/*",
            "requestId": "2be2d1dd2fd91",
            "jti": "ff5f45e1-1551-45fc-b11d-b92aa7bda4c2",
            "@resp": {
                "HttpStatusCode": "OK",
                "data": {
                    "id": 123,
                    "title": "User any"
                }
            },
            "@dur": "00:07.2814"
        }
    ]
}
```

## TODD - stuff to be done
-  response: conten type
-  response: headers
-  response http status code
-  multipart request
-  static files
-  request| response variables
-  response random variables (num,date,text)
-  response date now +format variable
-  response template x rows , s time da i x može biti random
-  cors
-  upload 1 file
-  upload multiple files
-  get 1 file
   -  content disposition
   -  from url
   -  from loca file
   -  base 64
- SSL
- ....