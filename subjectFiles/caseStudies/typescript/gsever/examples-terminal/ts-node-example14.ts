// Burada 'Basic Generics' ogrenecegiz.

import { publicDecrypt } from "crypto";

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
	private	_name: string = '\0';

	public	constructor( _name: string )
	{
		this._name = _name;
	};

	public	setValue( _value: T )
	{
		this._value = _value;
	};
	public	getValue(): T | undefined
	{
		return (this._value);
	};
};
// Type Aliases
type	AllTypes<T> = { value: T };
interface	IAllTypes<T>
{
	_type1: T;
	_type2: T | string;
	_type3: T | number;
	_type4: T | number | string | boolean;
};
class	MultipleTypes<T> implements IAllTypes<T>
{
	public	_type1;
	public	_type2;
	public	_type3;
	public	_type4;

	public	constructor(
		_type1: IAllTypes<T>["_type1"],
		_type2: IAllTypes<T>["_type2"],
		_type3: IAllTypes<T>["_type3"],
		_type4: IAllTypes<T>["_type4"])
	{
		this._type1 = _type1;
		this._type2 = _type2;
		this._type3 = _type3;
		this._type4 = _type4;
	};

	// Bu sekilde kullanabiliriz ama 'return' degerimiz 'any' oldugu icin guvenlikli bir kod olmamis oluyor.
	// public	getTypeValue( index: keyof MultipleTypes<T>): any { return (this[index]); }
	public	getTypeValue<K extends keyof IAllTypes<T>>(index: K): IAllTypes<T>[K]
	{
		return (this[index]);
	};
};
// Keyof nasil kullanidigi
type	MyType = { name: string, age: number, city: string };
type	KeyofMyType = keyof MyType; // Bunun turu; "name" | "age" | "city" seklinde bir turdur.
// Extends ornekleri
type	Animal = { name: string, year: number };
type	Dog = Animal & { breed: string }; // Bu Animal tipine ekstradan tip ekleyebilmemizi sagliyor.
// Default Value
class	NamedValueString<T = string>
{
	/**
	 * Bu yazim stili sen class'i hangi tipte olusturursan
	 *  bu variabla'yi o veridigin tipte olusturmani sagliyor.
	 */
	private	_value: T | undefined;
	private	_name: string = '\0';

	public	constructor( _name: string )
	{
		this._name = _name;
	};

	public	setValue( _value: T )
	{
		this._value = _value;
	};
	public	getValue(): T | undefined
	{
		return (this._value);
	};
};
// Extends
function createLoggedPair<S extends string | number,
		T extends string | number>
	(v1: S, v2: T): [S, T]
{
	console.log(`creating pair: v1='${v1}', v2='${v2}'`);
	return [v1, v2];
}

let	sampleArray = createPair<string, string>("Gorkem", "SEVER");
let	sampleArrayNumber = createPair<number, number>(31, 42);
let	sampleArrayMixed = createPair<number, string>(1001001, "Audi");
let	myNamedValue = new NamedValue("myValue");
const	sampleType: AllTypes<number> = { value: 42 };
let	myNamedAllValue = new NamedValue("asdf");
let	myMultipleTypes = new MultipleTypes(100, "asdf", 42, true);
const	myTypeKeys: KeyofMyType[] = ["name", "age", "city"];
const	myDogKeys: Dog[] = [{ name: "Minnos", year: 2016, breed: "Jack Russel"}];
let	myNamedValueString = new NamedValueString("myDoggy");
let	aLoggedPair = createLoggedPair(31, "Doge");

console.clear();
console.log(sampleArray); // [ 'Gorkem', 'SEVER' ]
console.log(sampleArrayNumber); // [ 31, 42 ]
console.log(sampleArrayMixed); // [ 1001001, 'Audi' ]
console.log(sampleType); // { value: 42 }
console.log(myNamedAllValue); // NamedValue { _name: 'asdf' }
myNamedValue.setValue(3131);
console.log(myNamedValue.getValue()); // 3131
console.log(myMultipleTypes); // MultipleTypes { _type1: 100, _type2: 'asdf', _type3: 42, _type4: true }
console.log(myMultipleTypes.getTypeValue("_type1")); // 100
myTypeKeys.forEach(index => { console.log(index); }); // name age city
myDogKeys.forEach(index => { console.log(index) }); // { name: 'Minnos', year: 2016, breed: 'Jack Russel' }
myNamedValueString.setValue("myDogBRUH");
console.log(myNamedValueString.getValue()); // myDogBRUH
console.log(aLoggedPair); // [ 31, 'Doge' ]