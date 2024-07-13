# EXTERNAL FILES
 This feature enables to include content of external file into mock file

## FEATURES
   - variable evaluation in all files
   - full or relative paths are suported
   - if relative paths are used root is folder where main file is placed
   - import only "@endpoints" from file into main json
     - but resolvee internali all variables first
   - imports whole content into main json

## EXAMPLES
### import "@endpoints" from file into main json
main mock file
```json
{
    "title": "Sample mock API",
    "@endpoints": [
        "{{m-file 'users-api.json'}}",
        "{{m-file 'groups-api.json'}}"
    ]
}
```

users-api.json
```json
{
   "global": {
        "id": 1
    },
    "@endpoints": [
        {
            "request": "GET /api/users/1",
            "response": {
                "body": { "id": 1, "title": "test {{global.id}}"}
            }
        }
    ]
}
```

groups-api.json
```json
{
    "@endpoints": [
        {
            "request": "GET /api/groups/1",
            "response": {
                "body": { "id": 1, "title": "test 1"}
            }
        }
    ]
}
```

### imports whole content into main json
```json
{
    "title": "Sample mock API",
    "global": "{{file 'global-variables.json'}}",
    "@endpoints": [
            {
            "request": "GET /api/users/1",
            "response": {
                "body": {
                    "id": 1,
                    "title": "test 1"
                }
            }
        },
    ]
}
```

### link external log file and adjust structure
```json
{
    "title": "Sample mock API",
    "@endpoints": [
          "{{m-file 'log-file.json'}}"
    ]
}
```