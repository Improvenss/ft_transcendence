// Burada 'tuple' yani 'demet' olayini ogrenecegiz.
let myTuple: [number, boolean, string];
let myTupleReadonly: readonly [number, boolean, string];


console.clear();
myTuple = [42, true, "Gorkem SEVER"];
console.log(myTuple);
myTupleReadonly = myTuple;
// myTupleReadonly.push("asdf"); // Buradaki .push() funtion'u 'readonly' oldugu icin engelleniyor.
console.log(myTupleReadonly);