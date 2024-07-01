#!/usr/bin/env node

const http = require('http')
const fs = require('fs');
const MyMockData = require("./my-mock-data");

//definitiion of requests and responses
let tMockData;

//#1 read config
let mock_json_file = 'mock.json';
fs.readFile(mock_json_file, "utf8", (error, data) => {
    if (error) {
        console.log(error);
        return;
    }
    tMockData = JSON.parse(data);
});

const server = http.createServer(function (request, response) {
    console.dir(request.param)

    //console.log(request)
    //http://localhost:3000/test
    console.log('url', request.url)

    if (request.method == 'POST') {
        console.log('POST')
        var body = ''
        request.on('data', function (data) {
            body += data
            console.log('Partial body: ' + body)
        })
        request.on('end', function () {
            console.log('Body: ' + body)
            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.end('post received')
        })
    } else {
        console.log('GET')
        var html = `{ "data": { "id:1, "title": "test 1"} }`
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(html)
    }
})

const port = 3000
const host = '127.0.0.1'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`)