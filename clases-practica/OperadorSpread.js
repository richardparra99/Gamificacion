// Combina dos objetos en uno solo utilizando el spread operator.
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

const resultado = { ...obj1, ...obj2 };
console.log(resultado);

//------------------------
// Obtener en variables los dos primeros nombres luego en otra variable el resto de nombres
const nombres = ["Juan", "Pedro", "Maria", "Luisa", "Laura", "Carlos", "Andres", "Sofia"];
const [nombre1, nombre2, ...resto] = nombres;
console.log(nombre1);
console.log(nombre2);
console.log(resto);

//------------------------
// Combina las dos lista en uno sola. Solo con los numeros menores a 20
const number1 = [ 15, 20, 30 , 10, 40, 50, 7];
const number2 = [1, 0, 15, 40, 3, 5, 10];

const numeros = [...number1, ...number2];
const menores20 = numeros.filter(numero => numero < 20);
console.log(menores20);

//------------------------
// Obtener en 3 variables los primeros numeros de la lista (3, 4, 7)
const listNumber = [
    [3, 5],
    [4, 6],
    [7, 8]
]

const [
    [numero1],
    [numero2],
    [numero3]
] = listNumber;
console.log(numero1);
console.log(numero2);
console.log(numero3);

//---------------------

// Obtener en variables y mostrar
    // el nombre y la ciudad de la persona.
    // el correo personal y laboral de la persona.
    // Los dos primeros lenguajes de programación de la persona.
const persona = {
    nombre: "Juan",
    edad: 30,
    direccion: {
        ciudad: "Santa Cruz",
        pais: "Bolivia",
    },
    correos: {
        personal: "juan@example.com",
        laboral: "juan.trabajo@example.com"
    },
    habilidades: [
        "JavaScript",
        "React",
        "Node.js",
        {
            nombre: "Bases de Datos",
            tipos: ["SQL", "NoSQL"]
        }
    ],
};

const {
    nombre,
    direccion: { ciudad }
} = persona;

console.log(nombre);
console.log(ciudad);

const {
    correos: { personal, laboral }
} = persona;

console.log(personal);
console.log(laboral);

const [lenguaje1, lenguaje2] = persona.habilidades;

console.log(lenguaje1);
console.log(lenguaje2);

//---------------------------

// Aumenta el precio de cada producto 10% devolviendo objetos NUEVOS.
const productos = [
    { id: 1, nombre: "Teclado", precio: 100 },
    { id: 2, nombre: "Mouse", precio: 50 },
    { id: 3, nombre: "Monitor", precio: 300 },
];

const nuevosProductos = productos.map(producto => ({
    ...producto,
    precio: producto.precio * 1.10
}));

console.log(nuevosProductos);

//--------------------------

// Cada usuario debe tener activo:true y rol:"user" si no lo trae.
const defaults = { activo: true, rol: "user" };
const usuarios = [
    { nombre: "Ana", rol: "admin" },
    { nombre: "Luis" },
    { nombre: "Eva", activo: false },
];


const nuevosUsuarios = usuarios.map(usuario => ({
    ...defaults,
    ...usuario
}));

console.log(nuevosUsuarios);

//------------------

// Junta todas las notas en un solo array y quédate con el promedio de las aprobadas (>=51).
const cursos = [
    { materia: "Mate", notas: [40, 60, 90] },
    { materia: "Historia", notas: [51, 30, 70] },
    { materia: "Física", notas: [20, 85] },
];

const notas = cursos.map(curso => curso.notas).flat();

console.log(notas);

const aprobadas = notas.filter(nota => nota >= 51);

console.log(aprobadas);

const suma = aprobadas.reduce((total, nota) => total + nota, 0);

const promedio = suma / aprobadas.length;

console.log("Promedio:", promedio);