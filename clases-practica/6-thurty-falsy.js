/*var name = "Jose";
let valor2 = "Torres";
const valor3s = "Torres";

function sumar(a, b) { 
    let valor2 = "Nuevo valor";
    this.valor2 = "### nuevo valor";
    return valor2;
}

console.log(sumar(4, 2))*/



/*'use strict';

var name = "Jose";
let valor2 = "Torres";
const valor3 = "Torres";

function sumar(a, b) {
    let valor2 = "Nuevo valor";
    return valor2;
}

console.log(sumar(4, 2));

function billetera() {
    let saldo = 0;
    return function (monto) {
        saldo += monto;
        return saldo;
    }
}

const billeteraJuan = billetera();
const billeteraAna = billetera();

console.log("Juan");
console.log(billeteraJuan(5));
console.log(billeteraJuan(15));
console.log("Ana");
console.log(billeteraAna(25));
console.log(billeteraAna(2));*/

const billetera2 = () => {
    let saldo = 0;
    let bloqueado = false;
    return {
        incrementar: (monto) => {
            saldo = saldo + monto;
            return saldo;
        },
        decrementar: (monto) => {
            if (bloqueado) { 
                return "La billetera esta bloqueada";
            }
            saldo = saldo - monto;
            return saldo;
        },
        bloquear: () => {
            bloqueado = true;
            return "Billetera bloqueada"
        },
        desbloquear: () => {
            bloqueado = false;
            return "Billetera desbloqueada"
        }
    }
}

const billeteraJuan2 = billetera2();
const billeteraAna2 = billetera2();

console.log("Juan");
console.log(billeteraJuan2.incrementar(25));
console.log(billeteraJuan2.bloquear());
console.log(billeteraJuan2.decrementar(15));
//console.log(billeteraJuan2.desbloquear());
console.log(billeteraJuan2.decrementar(15));
console.log("Ana");
console.log(billeteraAna2.incrementar(25));
console.log(billeteraAna2.decrementar(2));