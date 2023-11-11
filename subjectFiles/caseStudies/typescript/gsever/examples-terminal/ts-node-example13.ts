// Burada 'Class'lari ogrenecegiz.

// Members: Types
class	CarType
{
	public name: string;
	constructor( name: string )
	{
		this.name = name;
	};
};
// Members: Visibility
class	CarVisibility
{
	public name: string;
	private	_year: number;
	public constructor( name: string, _year: number )
	{
		this.name = name;
		this._year = _year;
	}
	public	getYear(): number
	{
		return (this._year);
	};
};
// Parameter Properties
class	CarProperties
{
	public	constructor( private _name: string )
	{
		// Burasi bos oldugu halde name'sine ataniyor wow.
	};
	
	public	getName(): string
	{
		return (this._name);
	}
};
class	CarReadonly
{
	private readonly	_name: string;

	public	constructor( _name: string )
	{
		this._name = _name;
	};

	public	getName(): string
	{
		return (this._name);
	};
};
// Inheritance: Implements
interface	Shape
{
	/**
	 * Burada; 'implement' alinan bir 'class'ta, 'getArea' function'u
	 *  kullanilacak ve dondurecegi deger 'number' tipinde olacak oluyor.
	 */
	getArea: () => number;
}
// Multiple Interface Implements
interface	Color
{
	_color: string; // Burada 'public' ya da 'protected' seklinde atamalar yapamiyoruz.
	// Interface icerisine tanimlanan her sey public olarak kabul edilir.

	getColor: () => string;
};
class	Rectangle implements Shape, Color
{
	protected	_width: number = 0; // Bunlari = 0 olacak sekilde init etmemiz sart.
	protected	_height: number = 0; // Cunku init etmezsek compile time'de hata goruruz.
	public readonly	_color: string; // Bunu Interface icerisinde sart kostugumuz icin 'protected' yapamiyoruz.

	public	constructor( _width: number, _height: number, _color: string )
	{
		this._width = _width;
		this._height = _height;
		this._color = _color;
	};

	// Yukaridaki tanimlamalari, asagidaki sekilde de tanimlayabiliriz.
	// Ama okunabilirlik/anlasilabilirlik acisindan yukaridaki gibi yapmak daha mantikli.
	// public	constructor( protected readonly _width: number, protected readonly _height: number ) {}

	public	getArea(): number
	{ // Burasi da 'Shape'den implement edildigi icin bu function'u olusturmamiz sart oluyor.
		return (this._width * this._height);
	};
	public	getColor(): string
	{ // Burasi da 'Color'dan implement edildigi icin bu function'u olusturmamiz sart oluyor.
		return (this._color);
	};
};
// Inheritance: Extends
class	Square extends Rectangle
{
	protected	_area: number; // Kare'nin alani.

	public	constructor( _side: number )
	{ // Burada ilk once 'Rectangle'nin constructor'unu 'super()' seklinde olusturmamiz lazim.
		super(50, 10, "red");
		this._area = _side * _side; // Kare'nin alaninin hesaplanmasi.
	};

	public	getSquareArea(): number
	{
		return (this._area);
	};
// Override
	public override	getArea(): number
	{
		/**
		 * Buradaki 'override' yazsan da yazmasan da calisiyor.
		 * Okuyanin daha kolay anlayabilmesi icin ve farkinda olmadan
		 *  override ettigimiz function'un birden fazla kalitildiginda
		 *  hata sorunlarini onlememizi sagliyor.
		 */
		return (this._area);
	};
};
// Abstract Class
abstract class	Animal
{
	// Bu 'abstract' class'larin icerisinde implement olmuyor.
	//  Sen sadece sanal halini olusturuyorsun. Tanimlamalari,
	//  kalitilan sinifta olusturuluyor.
	public abstract	makeSound(): void;
};
class	Cat
{
	private	_name: string;

	public	constructor( _name: string )
	{
		this._name = _name
	};

	public	makeSound(): void
	{
		console.log("MIYAV MIYAV NIBBA"); // :D
	};
	public	getName(): string 
	{
		return (this._name);
	};
};

let	myCarType = new CarType("Audi");
// let	myCarType = new CarType(); // Boyle kullanamiyoruz cunku bizde 'constructor' kullanmamizi istiyor.
let	myCarVisibility = new CarVisibility("Toyota", 2001);
let	myCarProperties = new CarProperties("Nissan");
let	myCarReadonly = new CarReadonly("Lexus");
let	myRectangle = new Rectangle(20, 10, "white");
let	mySquare = new Square(5);
let	myCat = new Cat("Peripella");
// let	myAnimal = new Animal(); // This Class can't create, because it's a abstract class.

myCarType.name = "Audi";
console.clear();
console.log(myCarType.name); // Audi
console.log(myCarVisibility.name); // Toyota
// console.log(myCarVisibility._year); // Burada private oldugu icin disaridan ulasamiyoruz.
console.log(myCarVisibility.getYear()); // 2001
console.log(myCarProperties.getName()); // Nissan
// myCarReadonly._name = "asdf"; // Boyle bir atama yapamayiz cunku readonly ayni const gibi.
console.log(myCarReadonly.getName()); // Lexus
console.log(myRectangle.getArea()); // 200
// myRectangle._color = "red"; // 'readonly' oldugu icin disarida degistirme yapamiyoruz.
console.log(myRectangle.getColor()); // white
console.log(mySquare.getArea()); // 500 -> Bu Rectangle'nin function'unu cagiriyor.
// NOTE: 2 function'da ayni isimde olsaydi ne yakindaki function'u kullanacakti.
console.log(mySquare.getSquareArea()); // 25 -> Bu kendi fuction'unu cagiriyor.
console.log(mySquare.getColor()); // red
console.log(myCat.getName()); // Peripella
myCat.makeSound(); // MIYAV MIYAV NIBBA

/**
 * NOTES:
 * const:
	* can't be reassigned
	* used for variables
 * readonly:
	* can be reassigned but only inside constructor
	* used for properties (class member)
 * both:
	* can be changed (for example by .push() if array)
 */