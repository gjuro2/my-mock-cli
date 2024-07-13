import { MyObject } from "../my-object";

let tObj = {
  "@prop1": {
    prop2: "test data"
  }
}

test('MyObject #1 nested', () => {
  let tRez = MyObject.get(tObj, "@prop1.prop2")
  expect(tRez).toBe("test data");
});

test('MyObject #2 null obj', () => {
  let tRez = MyObject.get(null, "@prop1.prop2")
  expect(tRez).toBe(null);
});

test('MyObject #3 null attribute', () => {
  let tRez = MyObject.get(tObj, null)
  expect(tRez).toBe(tObj);
});

test('MyObject #4 unknown attribute', () => {
  let tRez = MyObject.get(tObj, "@prop1.prop2.prop3")
  expect(tRez).toBe(null);
});
