// Variable global para el estado actual del puzzle inicial
let estadoActualPuzzleInicial = [];

// Funciones para convertir cadenas a matrices y matrices a cadenas
function cadenaAMatriz(cadena) {
    let arreglo = cadena.split(',').map(Number);
    let matriz = [];
    for (let i = 0; i < 3; i++) {
        matriz.push(arreglo.slice(i * 3, i * 3 + 3));
    }
    return matriz;
}

function matrizACadena(matriz) {
    return matriz.flat().join(',');
}

// Función para calcular la heurística (distancia de Manhattan)
function heuristica(estado, estadoMeta) {
    let distancia = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (estado[i][j] !== 0) {
                let posicionMeta = encontrarPosicion(estadoMeta, estado[i][j]);
                distancia += Math.abs(i - posicionMeta[0]) + Math.abs(j - posicionMeta[1]);
            }
        }
    }
    return distancia;
}

// Función para encontrar la posición de un número en un estado
function encontrarPosicion(estado, numero) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (estado[i][j] === numero) {
                return [i, j];
            }
        }
    }
}

// Función para generar los estados sucesores
function obtenerSucesores(estado) {
    let sucesores = [];
    let posicionVacia = encontrarPosicion(estado, 0);
    let movimientos = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // [derecha], [izquierda], [abajo], [arriba]

    for (let movimiento of movimientos) {
        let nuevaFila = posicionVacia[0] + movimiento[0];
        let nuevaColumna = posicionVacia[1] + movimiento[1];

        if (nuevaFila >= 0 && nuevaFila < 3 && nuevaColumna >= 0 && nuevaColumna < 3) {
            let nuevoEstado = estado.map(fila => [...fila]); // Copia profunda
            // Intercambio de valores
            [nuevoEstado[posicionVacia[0]][posicionVacia[1]], nuevoEstado[nuevaFila][nuevaColumna]] = 
            [nuevoEstado[nuevaFila][nuevaColumna], nuevoEstado[posicionVacia[0]][posicionVacia[1]]];
            sucesores.push(nuevoEstado);
        }
    }
    return sucesores;
}

// Algoritmo A*
function aEstrella(estadoInicial, estadoMeta) {
    let hInicial = heuristica(estadoInicial, estadoMeta);
    let conjuntoAbierto = new Map(); // Nodos por explorar
    let conjuntoCerrado = new Map(); // Nodos ya visitados

    let nodoInicial = { estado: estadoInicial, g: 0, h: hInicial, f: hInicial, padre: null };
    conjuntoAbierto.set(JSON.stringify(estadoInicial), nodoInicial);

    while (conjuntoAbierto.size > 0) {
        // Obtener el nodo con menor f en conjuntoAbierto
        let actualClave = [...conjuntoAbierto.keys()].reduce((a, b) =>
            conjuntoAbierto.get(a).f < conjuntoAbierto.get(b).f ? a : b
        );
        let actual = conjuntoAbierto.get(actualClave);
        conjuntoAbierto.delete(actualClave);

        if (matricesIguales(actual.estado, estadoMeta)) {
            return reconstruirCamino(actual);
        }

        conjuntoCerrado.set(actualClave, actual);

        let sucesores = obtenerSucesores(actual.estado);
        for (let sucesor of sucesores) {
            let claveSucesor = JSON.stringify(sucesor);
            if (conjuntoCerrado.has(claveSucesor)) continue;

            let g = actual.g + 1;
            let h = heuristica(sucesor, estadoMeta);
            let f = g + h;

            if (conjuntoAbierto.has(claveSucesor)) {
                let nodoExistente = conjuntoAbierto.get(claveSucesor);
                if (nodoExistente.f > f) {
                    nodoExistente.g = g;
                    nodoExistente.h = h;
                    nodoExistente.f = f;
                    nodoExistente.padre = actual;
                }
            } else {
                conjuntoAbierto.set(claveSucesor, { estado: sucesor, g: g, h: h, f: f, padre: actual });
            }
        }
    }
    return null; // Si no se encuentra solución
}

// Funciones para comparar matrices y reconstruir el camino
function matricesIguales(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function reconstruirCamino(nodo) {
    let camino = [];
    while (nodo) {
        camino.unshift(nodo.estado);
        nodo = nodo.padre;
    }
    return camino;
}

// Función para mostrar el puzzle en el HTML
// Ahora toma un tercer parámetro 'interactivo' para saber si añadir el listener
function mostrarPuzzle(estado, idPuzzle, interactivo = false) {
    let divPuzzle = document.getElementById(idPuzzle);
    divPuzzle.innerHTML = ''; // Limpiar el contenido existente

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let ficha = document.createElement('div');
            ficha.classList.add('tile');
            if (estado[i][j] === 0) {
                ficha.classList.add('empty');
            } else {
                ficha.textContent = estado[i][j];
            }
            // Almacenar la posición de la ficha para la interactividad
            ficha.dataset.fila = i;
            ficha.dataset.columna = j;

            if (interactivo) {
                ficha.addEventListener('click', manejarClickFicha);
            }
            divPuzzle.appendChild(ficha);
        }
    }
}

// *** NUEVA FUNCIÓN: Manejar el clic en una ficha para moverla ***
function manejarClickFicha(event) {
    const clickedTile = event.target;
    const clickedFila = parseInt(clickedTile.dataset.fila);
    const clickedColumna = parseInt(clickedTile.dataset.columna);

    const posicionVacia = encontrarPosicion(estadoActualPuzzleInicial, 0);
    const vaciaFila = posicionVacia[0];
    const vaciaColumna = posicionVacia[1];

    // Verificar si la ficha clicada es adyacente al espacio vacío
    const esAdyacente = (
        (Math.abs(clickedFila - vaciaFila) === 1 && clickedColumna === vaciaColumna) || // Mismo columna, fila adyacente
        (Math.abs(clickedColumna - vaciaColumna) === 1 && clickedFila === vaciaFila)    // Misma fila, columna adyacente
    );

    if (esAdyacente) {
        // Crear una copia del estado actual para modificarla
        let nuevoEstado = estadoActualPuzzleInicial.map(fila => [...fila]);

        // Intercambiar la ficha clicada con el espacio vacío
        [nuevoEstado[clickedFila][clickedColumna], nuevoEstado[vaciaFila][vaciaColumna]] = 
        [nuevoEstado[vaciaFila][vaciaColumna], nuevoEstado[clickedFila][clickedColumna]];
        
        // Actualizar el estado global
        estadoActualPuzzleInicial = nuevoEstado;

        // Redibujar el puzzle inicial con el nuevo estado (y mantener la interactividad)
        mostrarPuzzle(estadoActualPuzzleInicial, 'puzzle-inicial', true);
    }
}

// Función async para esperar antes de mostrar el siguiente estado
async function mostrarSolucion(solucion) {
    const puzzleMetaDiv = document.getElementById('puzzle-meta-estatico'); // Usar el div del meta estático para la animación
    // Guardar el estado meta para restaurarlo después
    const estadoMetaGuardado = cadenaAMatriz(document.getElementById('configuracion-meta').value);

    if (solucion) {
        // Ocultar el estado meta fijo durante la animación
        puzzleMetaDiv.innerHTML = ''; // Limpiar temporalmente

        for (let estado of solucion) {
            mostrarPuzzle(estado, 'puzzle-meta-estatico'); // Mostrar cada paso de la solución en el div de meta
            await new Promise(resolve => setTimeout(resolve, 800)); // Menos tiempo para una animación más rápida
        }
        // Una vez terminada la animación, restaurar el estado meta fijo
        mostrarPuzzle(estadoMetaGuardado, 'puzzle-meta-estatico');
    } else {
        alert('No se encontró solución para la configuración actual.');
    }
}

// Función para reiniciar el puzzle
function reiniciarPuzzle() {
    let { estadoInicial, estadoMeta } = obtenerConfiguracionesInicialesYMeta(true); // Pasar true para que no muestre alertas en el reinicio

    // Si la entrada es válida, actualizamos el estado global y mostramos
    if (estadoInicial && estadoMeta) {
        estadoActualPuzzleInicial = estadoInicial; // Sincronizar el estado global
        mostrarPuzzle(estadoActualPuzzleInicial, 'puzzle-inicial', true); // Mostrar el inicial interactivo
        mostrarPuzzle(estadoMeta, 'puzzle-meta-estatico'); // Mostrar el meta estático
    } else {
        // En caso de configuraciones iniciales inválidas, cargar valores predeterminados seguros
        estadoActualPuzzleInicial = cadenaAMatriz("1,2,3,4,0,5,6,7,8");
        mostrarPuzzle(estadoActualPuzzleInicial, 'puzzle-inicial', true);
        mostrarPuzzle(cadenaAMatriz("1,2,3,4,5,6,7,8,0"), 'puzzle-meta-estatico');
        // También actualizar los inputs a los valores predeterminados
        document.getElementById('configuracion-inicial').value = "1,2,3,4,0,5,6,7,8";
        document.getElementById('configuracion-meta').value = "1,2,3,4,5,6,7,8,0";
    }
}

// Función para validar la entrada del usuario
function entradaValida(cadenaEntrada, showAlert = true) {
    let arreglo = cadenaEntrada.split(',').map(Number);

    if (arreglo.length !== 9) {
        if (showAlert) alert('La configuración debe contener 9 números separados por comas.');
        return false;
    }

    let vistos = new Set();
    for (let numero of arreglo) {
        if (isNaN(numero) || numero < 0 || numero > 8 || vistos.has(numero)) {
            if (showAlert) alert('La configuración debe contener números únicos del 0 al 8.');
            return false;
        }
        vistos.add(numero);
    }
    return true;
}

// Obtener configuraciones iniciales y meta del usuario (con validación)
function obtenerConfiguracionesInicialesYMeta(suppressAlerts = false) {
    let cadenaConfiguracionInicial = document.getElementById('configuracion-inicial').value;
    let cadenaConfiguracionMeta = document.getElementById('configuracion-meta').value;

    if (!entradaValida(cadenaConfiguracionInicial, !suppressAlerts) || !entradaValida(cadenaConfiguracionMeta, !suppressAlerts)) {
        return null;
    }

    let estadoInicial = cadenaAMatriz(cadenaConfiguracionInicial);
    let estadoMeta = cadenaAMatriz(cadenaConfiguracionMeta);

    return { estadoInicial, estadoMeta };
}

// Función para verificar si un puzzle es resoluble
function esResoluble(matriz) {
    let arreglo = matriz.flat();
    let inversiones = 0;

    for (let i = 0; i < arreglo.length; i++) {
        for (let j = i + 1; j < arreglo.length; j++) {
            if (arreglo[i] !== 0 && arreglo[j] !== 0 && arreglo[i] > arreglo[j]) {
                inversiones++;
            }
        }
    }
    // Para el puzzle de 8 (3x3), un puzzle es resoluble si el número de inversiones es par.
    return inversiones % 2 === 0;
}


// Evento para el botón de resolver
document.getElementById('resolver').addEventListener('click', function() {
    let configuraciones = obtenerConfiguracionesInicialesYMeta();
    if (!configuraciones) {
        return; // Salir si la entrada no es válida
    }

    let { estadoInicial, estadoMeta } = configuraciones;

    // Actualizar el estado inicial global con lo que el usuario ha introducido o movido
    estadoActualPuzzleInicial = estadoInicial;

    // Mostrar el estado inicial actual antes de resolver
    mostrarPuzzle(estadoActualPuzzleInicial, 'puzzle-inicial', true); 
    mostrarPuzzle(estadoMeta, 'puzzle-meta-estatico'); // Asegurarse de que el meta estático esté visible

    // Validar si ambos estados son resolubles
    if (!esResoluble(estadoActualPuzzleInicial)) {
        alert("La configuración inicial que ingresaste no es resoluble. Por favor, intenta con otra.");
        return;
    }
    if (!esResoluble(estadoMeta)) {
        alert("La configuración meta que ingresaste no es resoluble. Por favor, intenta con otra.");
        return;
    }

    let solucion = aEstrella(estadoActualPuzzleInicial, estadoMeta);
    mostrarSolucion(solucion);
});

// Evento para el botón de reiniciar
document.getElementById('reiniciar').addEventListener('click', reiniciarPuzzle);

// Mostrar la configuración inicial y meta al cargar la página
reiniciarPuzzle();