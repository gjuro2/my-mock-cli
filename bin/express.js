"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require('path');
const app = express();
const PORT = process.env.port || 3000;
// View Engine Setup
//app.set("views", path.join(__dirname))
//app.set("view engine", "ejs")
app.get("/user/:id/:start/:end", function (req, res) {
    const user_id = req.params['id'];
    const start = req.params['start'];
    const end = req.params['end'];
    console.log("User ID :", user_id);
    console.log("Start :", start);
    console.log("End :", end);
    res.send('OK');
});
app.listen(PORT, function (error) {
    if (error)
        throw error;
    console.log("Server created Successfully on PORT", PORT);
});
//# sourceMappingURL=express.js.map