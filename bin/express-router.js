"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//https://github.com/expressjs/express/discussions/5066
const express = require('express');
const app = express();
const router = express.Router(); // use router
app.use(function (req, res, next) {
    var routes = app.routes; // See Reference 1.
    for (var method in routes) {
        console.log('ROUTE: ' + method);
        if (routes.hasOwnProperty(method)) {
            for (var route in routes[method]) {
                if (req.url.toString().match(routes[method][route].regexp)) {
                    console.log('Route Debugger: ' + routes[method][route].path);
                }
            }
        }
    }
    next();
});
app.use('/router', router);
router.use((req, res, next) => {
    let hasRouteToHandle = false;
    router.stack.forEach((stackItem) => {
        var _a, _b, _c, _d, _e;
        let tPath = (_a = stackItem.route) === null || _a === void 0 ? void 0 : _a.path;
        if (tPath) {
            var ids = tPath.split("/");
            ids === null || ids === void 0 ? void 0 : ids.map((id) => {
                console.log("id=" + id);
            });
        }
        console.log("**********************");
        console.log("route=" + ((_b = stackItem.route) === null || _b === void 0 ? void 0 : _b.path));
        console.log("req=" + req.path);
        // check if current rout path matches route request path
        if (((_c = stackItem.route) === null || _c === void 0 ? void 0 : _c.path) &&
            // req.path.toString().match(stackItem.route?.path.regexp)
            req.path.toString().match(((_d = stackItem.route) === null || _d === void 0 ? void 0 : _d.path) + "\\d+$")) {
            console.log('Route MATCH');
        }
        if (((_e = stackItem.route) === null || _e === void 0 ? void 0 : _e.path) === req.path) {
            hasRouteToHandle = true;
        }
    });
    if (hasRouteToHandle) {
        console.log('Request will be handled by a route later in the stack');
    }
    else {
        // No matching route for this request
        console.log('Request will not be handled');
        res.send('NO ROUTE');
    }
    next(); // to continue to next route
});
router.get('/user/:id', (req, res) => {
    // do some stuff
    //res.send('USER OK');
});
app.use(router);
app.listen(3000);
//# sourceMappingURL=express-router.js.map