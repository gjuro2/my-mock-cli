"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const my_object_1 = require("../my-object");
let tObj = {
    "@prop1": {
        prop2: "test data"
    }
};
test('MyObject #1 nested', () => {
    let tRez = my_object_1.MyObject.get(tObj, "@prop1.prop2");
    expect(tRez).toBe("test data");
});
test('MyObject #2 null obj', () => {
    let tRez = my_object_1.MyObject.get(null, "@prop1.prop2");
    expect(tRez).toBe(null);
});
test('MyObject #3 null attribute', () => {
    let tRez = my_object_1.MyObject.get(tObj, null);
    expect(tRez).toBe(tObj);
});
test('MyObject #4 unknown attribute', () => {
    let tRez = my_object_1.MyObject.get(tObj, "@prop1.prop2.prop3");
    expect(tRez).toBe(null);
});
//# sourceMappingURL=my-object.test.js.map