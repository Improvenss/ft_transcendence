// Burada 'null' kullanimini ogrenecegiz.
/**
 * Oncelikle "strictNullChecks" ayarini
 *  'tsconfig.json' dosyasindan 'true' yapmamiz gerekiyor.
 * 
 * "strictNullChecks": true, // When type checking, take into account 'null' and 'undefined'.
 * 
 * Bunu tsconfig.json dosyasindan yorum satirindan cikardik.
 */

import { arch } from "os";

// 'null' olarak init ettik. Ama 3 tipi de alabilir.
let	myValue: string | undefined | null = null; 
// Optional Chaining
interface	House {
	sqft: number;
	yard?: { sqft: number };
};
function	printYardSize( house: House )
{
	const	yardSize = house.yard?.sqft;
	if (yardSize === undefined)
		console.log("No yard.");
	else
		console.log("Yard is:", yardSize);
}

let	myHome: House = {
	sqft: 500,
};
// Nullish Coalescence
// Burada ?? ile kullanilabiliyor.
function	printMileage( mileage: number | null | undefined )
{
	console.log(`Mileage: ${mileage ?? 'Not Available'}`);
};
// Null Assertion
// Tipki dokum gibi bu da guvensiz olabilir ve dikkatli kullanilmalidir.
function	getValue(): string | undefined
{
	return ("Hello My Friend!");
};
// Array bounds handling
/**
 * strictNullChecks=true ise Array erisimi asla
 *  'undefined' dondurmeyecektir. Bunun dondurmesini
 *  saglayabilmek icin 'noUncheckedIndexedAccess'
 *  degerini tsconfig.json dosyasindan 'true' yapmamiz gerekiyor.
 * 
 * "noUncheckedIndexedAccess": true, // Add 'undefined' to a type when accessed using an index.
 * 
 * Boyle yaptik ve artik 'undefined' dondurebiliriz.
 */
let	myArray: number[] = [0, 1, 2];
// let	value = myArray[5]; // Burasi 'noUncheckedIndexedAccess' ile tipi number | undefined olabilir.

console.clear();
myValue = "Gorkem";
console.log(myValue); // Gorkem
myValue = undefined;
console.log(myValue); // undefined
myValue = null;
console.log(myValue); // null
// myValue = 42; // Bunu yapamayiz cunku alabilecegi degerler 3 tane.
console.log(myValue); // Burada tekrar 'null' yazacak.
printYardSize(myHome); // No yard.
myHome.yard = { sqft: 31}; // Burada atadik.
myHome.yard.sqft = 31; // Eger yukaridaki satirdaki gibi {} ile init etmezsek disarida boyle atama yapamiyoruz.
printYardSize(myHome); // Yard is: 31
printMileage(42); // Mileage: 42
printMileage(null); // Mileage: Not Available
printMileage(undefined); // Mileage: Not Available
console.log(getValue()!.length); // 16
console.log(myArray[2]); // 2
console.log(myArray[4]); // undefined