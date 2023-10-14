// Burada 'Basic Generics' ogrenecegiz.
// Functions
function	createPair<S, T>(arg1: S, arg2: T): [S, T]
{
	return [arg1, arg2];
};
// Classes
class	NamedValue<T>
{
	/**
	 * Bu yazim stili sen class'i hangi tipte olusturursan
	 *  bu variabla'yi o veridigin tipte olusturmani sagliyor.
	 */
	private	_value: T | undefined;
	private	_name: string = "";

	public	constructor( _name: string )
	{
		this._name = _name;
	};

	public	setValue( _value: T )
	{
		this._value = _value;
	};

};

let	sampleArray = createPair<string, string>("Gorkem", "SEVER");
let	sampleArrayNumber = createPair<number, number>(31, 42);
let	sampleArrayMixed = createPair<number, string>(1001001, "Audi");

console.clear();
console.log(sampleArray);
console.log(sampleArrayNumber);
console.log(sampleArrayMixed);