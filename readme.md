Simple mock HTTP using json config

# USAGE
- npm install -g @gjuro/my-mock-cli
- create file mock.json
- exec: my-mock-cli
- params:
  - "--port=1000" -default 3000
  - [filename.json] file or full path ro mock file - default mock.json

## USEGE EXAMPLES
- my-mock-cli --port=1000
- my-mock-cli --port=1000 test.json

## MOCK FILE
- example config file mock.json
```json
{
    "title": "Sample mock API",
    "mappings": [
        {
            "request": "GET /api/users/1",
            "response": {
                "data": {
                    "id": 1,
                    "title": "test 1"
                }
            }
        },
        {
            "title": "get list",
            "request": "POST /api/users",
            "response": {
                "data": [
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
                "data": [
                    {
                        "id": "1",
                        "title": "test 1"
                    },
                    {
                        "id": "2",
                        "title": "test 2"
                    },
                    {
                        "id": "3",
                        "title": "test 3"
                    }
                ]
            }
        },
        {
            "title": "get first mathing endpoint",
            "request": "POST /api/*/1",
            "response": {
                "data": [
                    {
                        "id": "1",
                        "title": "test 10"
                    },
                    {
                        "id": "2",
                        "title": "test 20"
                    },
                    {
                        "id": "3",
                        "title": "test 30"
                    }
                ]
            }
        }
    ]
}
```

