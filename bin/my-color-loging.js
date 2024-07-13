#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.logLine = exports.myApp = exports.reset = void 0;
//https://gist.github.com/ValeriiVasin/4261265
exports.reset = "\x1b[0m";
exports.myApp = {
    exit: (text) => {
        exports.logLine.red(text);
        throw (text);
        // process.exit(1);
    }
};
exports.logLine = {
    green: (text) => process.stdout.write("\x1b[32m" + text + exports.reset + "\n"),
    red: (text) => process.stdout.write("\x1b[31m" + text + exports.reset + "\n"),
    blue: (text) => process.stdout.write("\x1b[34m" + text + exports.reset + "\n"),
    yellow: (text) => process.stdout.write("\x1b[33m" + text + exports.reset + "\n"),
    white: (text) => process.stdout.write("\x1b[37m" + text + exports.reset + "\n"),
};
exports.log = {
    green: (text) => process.stdout.write("\x1b[32m" + text + exports.reset),
    red: (text) => process.stdout.write("\x1b[31m" + text + exports.reset),
    blue: (text) => process.stdout.write("\x1b[34m" + text + exports.reset),
    yellow: (text) => process.stdout.write("\x1b[33m" + text + exports.reset),
    white: (text) => process.stdout.write("\x1b[37m" + text + exports.reset),
};
//# sourceMappingURL=my-color-loging.js.map