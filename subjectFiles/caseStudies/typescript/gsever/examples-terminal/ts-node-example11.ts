// Burada 'Function'lari ogrenecegiz.
/**
 * Her function'un tanimlanan parantezlerinden sonra
 *  iki nokta koyduktan sonra hangi type'de deger
 *  dondurecegini belirtiriz.
 */
function	getMyTime(): string
{ // Bu 'string' donduren bir func().
	let	time = new Date();

	return (time.toLocaleDateString()
		+ ' ' + time.toLocaleTimeString());
}
function	printString(): void
{ // Void func().
	console.log("Bu hicbir sey dondurmeyen bir function.");
}
function	getSumNumbers( a: number, b: number ): number
{ // Parametreli func().
	return (a * b);
}
function	getSumNumbersOptional( a: number, b: number, c?:number ): number
{ // Optionel parametreli func().
	return (a * b * (c || 1));
}
function	getSumNumbersDefault( a: number, b: number = 42 ): number
{ // Default parametreli func().
	return (a * b);
}
function	getSumNumbersNamed( {a, b}: {a: number, b: number} )
{ // Named parametreli func().
	return (a * b);
}
function	getSumNumbersRest( a: number, b:number, ...asdf: number[] )
{ // Rest parametreli func().
	return (a * b * asdf.reduce((x, y) => (x * y), 1));
}
type	Asdf = ( a: number, b: number ) => number;
let	functionAsdf: Asdf = ( a, b ) => (a * b);


console.clear();
let	currentTime = getMyTime();
console.log(currentTime);
printString();
console.log(getSumNumbers(42, 42));
console.log(getSumNumbersOptional(5, 10)); // Burada 3. parametre de yazabilirsin ama sart degil.
console.log(getSumNumbersDefault(2)); // Buraya (2, 20) falan da yazabilisin ama sart degil.
console.log(getSumNumbersNamed({a: 5, b: 55555})); // Buraya function'da belirtilen isimde parametreyi {} icinde girmen gerekiyor.
console.log(getSumNumbersRest(1, 2, 3, 4, 5, 6));
console.log(functionAsdf(10, 6));