#!/usr/bin/env node

//https://gist.github.com/ValeriiVasin/4261265
export const reset = "\x1b[0m";

export const myApp = {
    exit: (text: any) => {
        logLine.red(text);
        throw (text)
        // process.exit(1);
    }
}

export const logLine = {
    green: (text: any) => process.stdout.write("\x1b[32m" + text + reset + "\n"),
    red: (text: any) => process.stdout.write("\x1b[31m" + text + reset + "\n"),
    blue: (text: any) => process.stdout.write("\x1b[34m" + text + reset + "\n"),
    yellow: (text: any) => process.stdout.write("\x1b[33m" + text + reset + "\n"),
    white: (text: any) => process.stdout.write("\x1b[37m" + text + reset + "\n"),
};
export const log = {
    green: (text: any) => process.stdout.write("\x1b[32m" + text + reset),
    red: (text: any) => process.stdout.write("\x1b[31m" + text + reset),
    blue: (text: any) => process.stdout.write("\x1b[34m" + text + reset),
    yellow: (text: any) => process.stdout.write("\x1b[33m" + text + reset),
    white: (text: any) => process.stdout.write("\x1b[37m" + text + reset),
};
