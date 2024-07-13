## global
+ set current dir root of main movk file
- OPTIONS support

## parameters
+ [filename.json]           - default mock.json
+ --port=3001               - default 3000
+ --init                    - kreiraj sample file

## settings
- loadanje settingsa
- promjena u settingsima relad app-a
- ako nemamo json strukturu onda kreiraj dummy
+ u sttingsima definirati mapiranje na propove
+ nested propovi
- loadanje settingsa iz settings.jsona
- loadanje settingsa iz mock.jsona
- implementiraj
  - "simulateRresponseDuration": false,
  - "propMappings.wait": "@dur",

 ## requests|resposne
 - fix structure
 +? ispiši koja sva mapiranja imamo
 +? ispiši upozorenja da neko mapiranje vreća null u body-u
 + matchanje requesta točno
 + matchanje requesta po wildcardu
 - ako nema
 + favicon.ico ako ima favico u root onda njega pokaži
 - mock source custom log file
-  ako imamo "@dur": "00:07.2814" da se tolko stvarno čeka na odgo
-  response: conten type
-  request: content type
-  multipart request
-  static files
-  request| response variables
-  response random variables (num,date,text)
-  response date now +format variable
-  response template x rows , s time da i x može biti random
-  response http status code define
-  cors
-  upload 1 file
-  upload multiple files
-  get 1 file
   -  content disposition
   -  from url
   -  from loca file
   -  base 64

- da možemo podržati u parametrizaciji
  - "request": "GET /api/users/1",
   - "request": {
                "url":"GET /api/users/1"
   }
-- podrži prosljeđivanje parametara iz get-a u body
-- podrži evaluaciju u runtime-u
        {
            "request": "GET /api/klijent/:id",
            "response": {
                "body": "<<object global.user2Template :id>>"
            }
        },
- da možemo <<{{idx}}>> zaposati i kao {{object idx}}
+? da ispisujemo response koji smo poslali natrag ako s u ---verbose

## mock data varijables
- mapiranje na podatke u jsonu iz nekog drugog elementa
- podržati brojčane i text varijable 1 | 1.0 | "1.00" | null
- dinamički parametri varijabli
- <<>> objasniti
- objasni da koristimo handlebars i daj primjere
-

## see
-  https://www.npmjs.com/package/@r35007/mock-server
   -  startaj primjer i pogledaj kako su napravili web interface
-  https://github.com/typicode/json-server/tree/v0#static-file-server




## custom maping for request & response
- MAPPING CUSTOM LOG FILE to MOCK API
- example maps custom log file to API
- in '@endpoints' is content of log file
- 'propMappings' defines mapping to API
```json
{
    "title": "Sample mock API from log file",
    "propMappings": {
        "request": "endpoint",
        "response": "@resp.data"
    },
    "@endpoints": [
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


složi da naši atributi budu specijalno označeni @
mappings = @endpoints podrži oboje

```json
{
    "title": "Sample mock API",
    "global": "{{file 'global-variables.json'}}",
    "@mappings": [
            {
            "@request": "GET /api/users/1",
            "@response": {
                "@body": {
                    "id": 1,
                    "title": "test 1"
                }
            }
        },
    ]
}
```

LOGS
TODO
- propertie mapping
    - podržati i inline a i preko varijable mapiranje
- podesi strukturu da se može importati u naš mapping array
    - dodaj array ako fali i sve što fali
    - ako već imamo @endpoints onda to koristi
    - ovo treba ručn srediti
        - obično su logovi cf+lf delimeited i nemaju ,
        - i zna svakakovo smeće biti u njima
        - i staviti da je json array (array možemo mi)

- podrži
    - naveli smo točno body
    "@response.@body": "@resp.data",
    - naveli smo točno neki atribut
    "@response.@content-type": "neki content type",

    ako smo naveli samo @response onda se tu misli na mapiranje za body
    "@response": "@resp.data"


-- copy file and folder into tsc bin
