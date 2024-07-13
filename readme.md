# my-mock-cli
![Static Badge](https://img.shields.io/badge/licence-MIT-blue)

Simple mock HTTP API using json config
## BREAKING CHANGES
structure changed
```json
{
    "mappings" => "@endpoints" :
        {
            "request" => "@request" : "GET /api/users/1",
            "response": => "@response" {
                "body": => "@body"  {
                    "id": 1,
                    "title": "test 1"
                }
            }
        }
    ]
}
```

## MOCK FILE STRUCTURE AND ATTRIBUTES
[detailed documentation](_doc/mock-structure.md)

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

# FEATURES
- [defined mockfile structure and attributes](_doc/mock-structure.md)
  - fix structure if possible
 - [CLI paremeters](_doc/cli-parameters.md)
   - change datault port
   - generate sample mock files
   - outputs result of json parsing steps and variable evaluation (--verbose)
   - ...

 - [variables suport](_doc/variables.md)
   - using "handlebars" sintax + custom adjustments [https://github.com/handlebars-lang/handlebars.js](https://github.com/handlebars-lang/handlebars.js)
   - nested atributes
   - template objects
   - dynamic objects and arrays
   - random data
   - ...

 - [linking to external file/s in mock structure](_doc.external_files.md)
   - variable evaluation in all files

 - custom maping for request & response (support for custom log)
   - map custom log to defalt mock atributes

# USAGE
Install
```sh
  npm install -g @gjuro/my-mock-cli
```
Create default sample files and folders in curent shell folder
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

## EXAMPLES
TODO

## TODO - stuff to be done
-  response: conten type
-  response: headers
-  response http status code
-  multipart request
-  static files
+  request| response variables
+  response random variables (num,date,text)
-  response date now +format variable
+  response template x rows , s time da i x može biti random
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