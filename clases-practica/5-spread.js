let a = [4, 7, 8, 9, 10];
let b = [14, 4];

let b2 = [...a, ...b].map( x => x * 2);

console.log(b2);

let persona = {
    nombre: "Pepe",
    apellido: "Torrez",
    ciudad: "Santa Cruz",
    telefono: "65367370"
}

let datos = {
    edad: 22
}

let new_persona = { ...persona, ...datos };
let { nombre, apellido, ...resto } = persona;

console.log(nombre);
console.log(apellido);
console.log(resto);

let c = [4, 7, 8, 9, 10];
let [n1, n2, n3, ...nresto] = c;