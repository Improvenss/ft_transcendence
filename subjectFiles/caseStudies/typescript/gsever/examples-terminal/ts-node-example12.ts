// Burada 'Casting'leri ogrenecegiz. 'as' & '<>'.
let	x: unknown = "Bunun tipi yok. Biz print ederken tipini belirtiyoruz.";

console.clear();
console.log((x as string).length);
// console.log(x.length); // Burada bunu yapamayiz cunku tipi yok.
console.log(x); // Bu otomatik algiliyor bu ayri mesele... Neden var anlamis degilim? :D
//------------------------------
// Bunlar da 'as'in aynisi sadece farkli yazilis hali. :D
console.log((<string>x).length);
// NOT: Bu donusum React ile yani .tsx dosyalari ile calismiyormus...
console.log(<string>x);
//------------------------------
// Force Casting
// En dogru yolu ilk olarak 'unknown' tipine cevirip sonra istedigin tipe cevirmekmis.
console.log(((x as unknown) as string).length);
console.log(x);