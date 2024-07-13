# CLI PARAMETERS
paremeters that can be used with CLI

| Name | Type    | Required | Description                                    |
| ---- | ------- | -------- | ---------------------------------------------- |
| port | int     | No       | Port on localhost default 3000 |
| init | string  | No       | Create default sample files and folders in curent shell folder |
| [filename.json]| string | No       | relative from current shell folder or full path to mock file - default mock.json |
| verbose | string    | No       | outputs result of json parsing steps and variable evaluation |

### USEGE EXAMPLES
Create default sample files and folders in curent shell folder
```sh
  my-mock-cli --init
```
Start server with default file mock.json
```sh
  my-mock-cli
```
Start server on port 1000 with default file mock.json
```sh
  my-mock-cli --port=1000
```
Start server on port 1000 with mock file test.json
```sh
  my-mock-cli --port=1000 test.json
```
Start server on with mock file relative to current shell folder and displays parsing details
- example: merging multiple files into one mock
```sh
  my-mock-cli samples/multiple-files1/mock-multiple-files1.json --show
```
Start server on with mock file relative to current shell folder
- example: mapping log file
```sh
  my-mock-cli samples/log-sample.json
```
