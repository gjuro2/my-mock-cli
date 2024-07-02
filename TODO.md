## globalno
+ traži u trenutnom dir-u


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
## see
-  https://www.npmjs.com/package/@r35007/mock-server
   -  startaj primjer i pogledaj kako su napravili web interface
-  https://github.com/typicode/json-server/tree/v0#static-file-server
-