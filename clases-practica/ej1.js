let numeros = [7, 8, 9, 10, 11, 15];
const resp = numeros
  .filter((num) => num % 2 == 0)
  .map((num) => num * 2)
  .reduce((acumulador, num) => acumulador + num, 0);

console.log(resp);

let resp2 = numeros.reduce(
  (acumulador, num) => (num % 2 == 0 ? acumulador + num * 2 : acumulador),
  0,
);

console.log(resp2);

let nombre = "Juan";
let saludo = (nombre) => {
  nombre = "Hola " + nombre;
  return nombre;
};
console.log(saludo(nombre));

let persona = { nombre: "armando" };
let saludoPersona = (nombre) => {
  persona.nombre = nombre;
  return "Hola " + persona.nombre;
};

console.log(saludoPersona("reynaldo"));

let nombreList = [
  "jose mendez activo",
  "martha torres activo",
  "bruno diaz desactivado",
];

let list = nombreList.map((x) => {
  let dato = x.split(" ");
  return {
    nombre: dato[0],
    apellido: dato[1],
    activo: dato[2] == "activo",
  };
});
console.log(list);

let listaActivo = list.filter(x => x.activo)
console.log(listaActivo)
