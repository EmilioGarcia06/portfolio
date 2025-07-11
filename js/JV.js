const filas = 50;
const columnas = 50;
const cuadro = document.getElementById("cuadricula");
   
    //1️ Una célula viva muere si tiene menos de 2 vecinos vivos (soledad).
    //2-Una célula viva sobrevive si tiene 2 o 3 vecinos vivos.
    //3-Una célula viva muere si tiene más de 3 vecinos vivos (superpoblación).
     //4-Una célula muerta nace si tiene exactamente 3 vecinos vivos.

//===================Creacion de cuadricula=========

function cuadricula(){
    cuadro.innerHTML =""; //limpia la cuadricula completa
    for(let f = 0; f < filas; f++){ // se inicia un cicloo de todas las filas (f) representa el espacio de la fila actual 
        for(let c = 0; c < columnas; c++){ //se inicia un segundo cicloo dentro del primero que recorra  todas las columnas (c) representa el espacio de la columna actual 
            const cell = document.createElement("div"); //cell se crea dinamicamente 
            cell.classList.add("dead"); //se agrega la clase "dead" a la celda que anteriormente la definimos en css como celada muerta 
            cuadro.appendChild(cell); // agrega el div como un hijo del contenedor (celda) para que la celda sea visible
        }
            
    }
}
//==============Llamado a funcion para iniciar cuadricula==============

cuadricula();

//==========Inicia en limpio arreglo y cuadricula==========

let celulas =[]; // Se resetea y crea el arreglo de celdas para almacenar celdas de la cuadricula

function inicializarCuadricula() {
    cuadro.innerHTML = ""; // Limpiar la cuadricula
    celulas =[];
    
    //==========Creacion de celdas============

    for (let f = 0; f < filas; f++) {// se crea un ciclo para recorrer cada fila
        const fila = [];
        for (let c = 0; c < columnas; c++) { //se crea un ciclo para recorrer cada  columna
            const cell = document.createElement("div");// crea una nueva celda como div
            cell.classList.add("dead"); // se inserta la clase dead a cada celda para que se innicializen muertas
            cell.addEventListener('click', () => estado(f, c, cell));//agrega un evento clic en cada celda para desear si esta viva o muerta con funcion estado 
            cuadro.appendChild(cell);
            fila.push(cell); // Guardar la celda en la fila
        }
        celulas.push(fila); // Con  push insertamos una fila comleta en celulas y se vuelve un arreglo bidimensionnal en el que guarda filas y columnas
    }
}

//==========Funcion para cambia el estado de una celda cuando el usuario hace clic==========
function estado(f, c, cell) {
    if (cell.classList.contains("alive")) {// se verifica si la celda tiene la clase alive as
        cell.classList.remove("alive");
        cell.classList.add("dead");
    } else {
        cell.classList.remove("dead");// si la celda esta viva la cambiamos a muerta
        cell.classList.add("alive");// si la celda esta muerta la cambiamos a viva
    }
}

//==========Funcion para saber cuantas celdas muertas o vivas hay==========

function contarVecinosVivos(f, c) {
    let vecinosVivos = 0; // almacena la cantidad de celulas vivas que estan alrededor de las celdas

    for (let df = -1; df <= 1; df++) { // Recorre -1, 0, 1 en filas(es mas facil comparar ceros y unos que clases)
        for (let dc = -1; dc <= 1; dc++) { // Recorre -1, 0, 1 en columnas
            if (df === 0 && dc === 0) continue; // Ignora la celda actual

            //Implementación de la cuadrícula toroidal 
            let filaVecino = (f + df + filas) % filas;  // Se calcula las coordenadas de cada celda vecina con el operador (%) se valora   el residuo de cada celda 
            let colVecino = (c + dc + columnas) % columnas; // para saber si es un Cero o un Uno (vivo o muerto)

            // Si la celda vecina está viva, aumentamos el contador
            if (celulas[filaVecino][colVecino].classList.contains("alive")) { // se verifica que el vecino este vivo y suma +1 al contador 
                vecinosVivos++;
            }
        }
    }

    return vecinosVivos;
}

//==========Actualiza las celdas cada 500 milisegundos==========
let generaciones = 0; // Contador de generaciones

function actualizar() {
    if (celulas.length == 0) return;
    const nuevaCelulas = [];
    
    for (let f = 0; f < filas; f++){ //Se hace un barrido a toda la cuadricula para las filas y columnas 
        if (!celulas[f]) continue;
        for (let c = 0; c < columnas; c++) {
            const cell = celulas[f][c];// almacena la celda en variabe cell
            if (!cell) continue; // Evita erroress
            const vecinosVivos = contarVecinosVivos(f, c);

            //==========Aplicacion de reglas de juego de la vida==========

            if (cell.classList.contains("alive")) {
                // Célula viva
                if (vecinosVivos < 2 || vecinosVivos > 3) {
                    nuevaCelulas.push({ f, c, estado: "dead" });
                } else {
                    nuevaCelulas.push({ f, c, estado: "alive" });
                }
            } else {
                // Célula muerta
                if (vecinosVivos === 3) {
                    nuevaCelulas.push({ f, c, estado: "alive" });
                } else {
                    nuevaCelulas.push({ f, c, estado: "dead" });
                }
            }
        }
    }

    // Actualizar las celdas con el nuevo estado
    nuevaCelulas.forEach(({ f, c, estado }) => {// arreglo que se declaro arriba que contiene fila, objeto y el estado de la celda
                                                //Foreach hace un barrido de cada objeto y ejecuta la verificacion de cada celda
        const cell = celulas[f][c];// Accede a la celda dentro del arreglo de celdas 
        
        //Despues de obtener la celda se verifica el estado y cambian el colo de la celda con la clase de CSS
        if (estado === "alive") {//Verifica el estado de la celda que se obtuvo
            cell.classList.add("alive");//Añade la clase alive a la celda para que que cambie de estado
            cell.classList.remove("dead");//Remueve la clase dead de la  celda para que que cambie de estado
        } else {
            cell.classList.add("dead");
            cell.classList.remove("alive");
        }
    });
    generaciones++; // Incrementa la generación
    document.getElementById("gene").value = `Generación: ${generaciones}`; // Muestra el contador de generaciones
}

//========== FUNCION PARA GENERAR UN AUTOMATA ALEATORIO  ==========

function aleatorio() {
    for (let f = 0; f < filas; f++) { // Este for anidado recorreo filas y columnas de toda la cuadricula 
        for (let c = 0; c < columnas; c++) { 
            let cell = celulas[f][c];  // obtiene la celula del barrido de toda la cuadricula 
            if (Math.random() > 0.5) { //se crea de forma aleatoria un numero entre 0 y 0.999 por eso la condicion
                cell.classList.add("alive");
                cell.classList.remove("dead");
            } else {
                cell.classList.add("dead");
                cell.classList.remove("alive");
            }
        }
    }
}

//========== Funciones de los botones INICIAR, DETENER Y LIMPIAR ==========

let intervalo; // Variable para el intervalo de actualización
let corriendo = false; // Bandera para saber si el juego está corriendo


document.getElementById("iniciar").addEventListener("click", () => {
    if (!corriendo) {
        intervalo = setInterval(actualizar, 100);
        corriendo = true;
    }
});

document.getElementById("detener").addEventListener("click", () => {
    clearInterval(intervalo);
    corriendo = false;
});

document.getElementById("limpiar").addEventListener("click", () => {
    clearInterval(intervalo);

    corriendo = false;
    inicializarCuadricula(); // Reinicia la cuadricula
    document.getElementById("gene").value="";
});

document.getElementById("aleatorio").addEventListener("click", aleatorio);



