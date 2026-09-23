// Realizar un closure de un carrito de compras que permita recibir por parametro la lista de productos
// Debe permitir agregar, eliminar, listar y calcular el total del carrito.

// Realizar la prueba de la función con las 3 listas




const listProductos = [
    { id: 1, nombre: "Lavadora", precio: 100 },
    { id: 2, nombre: "Licuadora", precio: 200 },
    { id: 3, nombre: "Computadora", precio: 300 },
    { id: 4, nombre: "Celular", precio: 400 },
    { id: 5, nombre: "Televisor", precio: 500 },
    { id: 6, nombre: "Refrigerador", precio: 600 },
    { id: 7, nombre: "Horno Microondas", precio: 700 },
    { id: 8, nombre: "Aspiradora", precio: 800 },
    { id: 9, nombre: "Plancha", precio: 900 },
    { id: 10, nombre: "Cafetera", precio: 1000 }
];

const utilesEscolares = [
  { id: 1, nombre: "Cuaderno universitario", precio: 18 },
  { id: 2, nombre: "Cuaderno espiral pequeño", precio: 12 },
  { id: 3, nombre: "Bolígrafo azul", precio: 3 },
  { id: 4, nombre: "Bolígrafo negro", precio: 3 },
  { id: 5, nombre: "Bolígrafo rojo", precio: 3 },
  { id: 6, nombre: "Lápiz grafito", precio: 2 },
  { id: 7, nombre: "Corrector líquido", precio: 7 },
  { id: 8, nombre: "Marcadores fluorescentes (pack x5)", precio: 25 },
  { id: 9, nombre: "Caja de colores (12 unidades)", precio: 28 },
  { id: 10, nombre: "Caja de colores (24 unidades)", precio: 48 },
  { id: 11, nombre: "Tijera escolar", precio: 10 },
  { id: 12, nombre: "Regla de 30 cm", precio: 5 },
  { id: 13, nombre: "Compás metálico", precio: 15 },
  { id: 14, nombre: "Juego de geometría", precio: 20 },
  { id: 15, nombre: "Pegamento en barra", precio: 6 },
  { id: 16, nombre: "Pegamento líquido", precio: 8 },
  { id: 17, nombre: "Cartulina blanca", precio: 2 },
  { id: 18, nombre: "Cartulina de colores", precio: 3 },
  { id: 19, nombre: "Mochila escolar básica", precio: 180 },
  { id: 20, nombre: "Mochila de marca", precio: 350 },
];

const muebles = [
  { id: 1, nombre: "Silla plástica", precio: 55 },
  { id: 2, nombre: "Mesa plástica", precio: 150 },
  { id: 3, nombre: "Mesa de comedor 4 puestos", precio: 1200 },
  { id: 4, nombre: "Mesa de comedor 6 puestos", precio: 1800 },
  { id: 5, nombre: "Silla de comedor (unidad)", precio: 250 },
  { id: 6, nombre: "Escritorio sencillo", precio: 600 },
  { id: 7, nombre: "Escritorio ejecutivo", precio: 1500 },
  { id: 8, nombre: "Silla de oficina básica", precio: 350 },
  { id: 9, nombre: "Silla ergonómica", precio: 1200 },
  { id: 10, nombre: "Cama de plaza y media", precio: 950 },
  { id: 11, nombre: "Cama de dos plazas", precio: 1500 },
  { id: 12, nombre: "Colchón de plaza y media", precio: 900 },
  { id: 13, nombre: "Colchón de dos plazas", precio: 1400 },
  { id: 14, nombre: "Ropero pequeño", precio: 850 },
  { id: 15, nombre: "Ropero grande", precio: 1800 },
  { id: 16, nombre: "Sofá de dos plazas", precio: 2500 },
  { id: 17, nombre: "Sofá de tres plazas", precio: 3500 },
  { id: 18, nombre: "Mueble de TV pequeño", precio: 600 },
  { id: 19, nombre: "Mueble de TV grande", precio: 1200 },
  { id: 20, nombre: "Estante para libros", precio: 700 },
];


const shoppingCart = (productos) => {
    let carrito = [];

    return {
        agregarProducto: (id) => {
            const producto = productos.find(p => p.id === id);
            if (producto) {
                carrito.push(producto);
                return "Producto agregado";
            }
            return "Producto no encontrado";
        },
        eliminarProducto: (id) => {
            carrito = carrito.filter(p => p.id !== id);
            return "Producto eliminado";
        },
        listarProductos: () => {
            return carrito;
        },
        calcularTotal: () => {
            return carrito.reduce(
                (total, producto) => { 
                    return total + producto.precio;
                }, 0
            );
        }
    };
};


const miCarrito = shoppingCart(listProductos);
console.log("ELECTRODOMENTICOS");

console.log(miCarrito.agregarProducto(1));
console.log(miCarrito.agregarProducto(2));
console.log(miCarrito.agregarProducto(5));

console.log("Antes de eliminar:");
console.log(miCarrito.listarProductos());

miCarrito.eliminarProducto(2);

console.log("despues de eliminar:");
console.log(miCarrito.listarProductos());

console.log("Total: ", miCarrito.calcularTotal());
//miCarrito.agregarProducto(1);
//miCarrito.agregarProducto(5);
