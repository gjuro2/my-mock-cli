//https://github.com/expressjs/express/discussions/5066
const express = require('express')
const app = express();
const router = express.Router(); // use router

app.use(function (req: any, res: any, next: any) {
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

router.use((req: any, res: any, next: any) => {
    let hasRouteToHandle = false;

    router.stack.forEach((stackItem: any) => {
        let tPath = stackItem.route?.path;
        if (tPath) {
            var ids = tPath.split("/")
            ids?.map((id: any) => {
                console.log("id=" + id)
            });
        }

        console.log("**********************")
        console.log("route=" + stackItem.route?.path)
        console.log("req=" + req.path)
        // check if current rout path matches route request path
        if (stackItem.route?.path &&
            // req.path.toString().match(stackItem.route?.path.regexp)
            req.path.toString().match(stackItem.route?.path + "\\d+$")
        ) {
            console.log('Route MATCH');
        }

        if (stackItem.route?.path === req.path) {
            hasRouteToHandle = true;
        }
    });


    if (hasRouteToHandle) {
        console.log('Request will be handled by a route later in the stack')
    } else {
        // No matching route for this request
        console.log('Request will not be handled')
        res.send('NO ROUTE');
    }


    next(); // to continue to next route
});

router.get('/user/:id', (req: any, res: any) => {
    // do some stuff
    //res.send('USER OK');
});

app.use(router);
app.listen(3000)