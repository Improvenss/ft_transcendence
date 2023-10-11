// Burada 'Union Types' ogrenecegiz.
// Buradaki '|' parametresinin (OR) nasil kullanildigini ogrenecegiz.
function	unionFunction(parameterType: string | number)
{
	console.log("Parameter type[" + typeof(parameterType) + "]:", parameterType);
	console.log(`Bu \`\` karakterlerinin arasina yazilirken ${parameterType}\
	olarak 'parametre'ni cagirabilirsin.`)
	// Boyle kullanilamaz ama...
	// console.log(".toUpperCase() -> function'u kullanilamaz", parameterType.toUpperCase());
	// Boyle kullanilabilinir.
	console.log(".toUpperCase() -> function'u kullanilamaz", parameterType.toString().toUpperCase());
}

console.clear();
unionFunction("Gorkem");
console.log();
unionFunction(42);
/**
 * Burada boyle bir tip gonderemeyiz.
 * Cunku function'un alabilecegi parametre tiplerini;
 * 'string' ya da 'number' olacak sekilde girdik.
 */
// unionFunction(true);

