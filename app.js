const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');

// --- Controles ---
const chkUnionesTodos = document.getElementById('unionesTodos');
const chkVoronoiTodos = document.getElementById('voronoiTodos');
const chkVoronoiGlobal = document.getElementById('voronoiGlobal');
const chkSeleccionados = document.getElementById('seleccionados');
const chkNombres = document.getElementById('mostrarNombres');
const btnLimpiar = document.getElementById('limpiarSeleccion');

// --- Jugadores iniciales ---
let jugadores = [
  { nombre: "Jugador 1", x: 200, y: 250, color: 'blue' },
  { nombre: "Jugador 2", x: 700, y: 250, color: 'red' },
  { nombre: "Jugador 3", x: 450, y: 100, color: 'green' }
];

let seleccionados = [];
let jugadorMovido = null;
let arrastrando = false;

// --- Dibujar campo ---
function dibujarCampo() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#6DBF3B');
  grad.addColorStop(1, '#5AA837');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, 800, 400);

  // Medio campo
  ctx.beginPath();
  ctx.moveTo(450, 50);
  ctx.lineTo(450, 450);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(450, 250, 60, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeRect(50, 200, 60, 100);
  ctx.strokeRect(790, 200, 60, 100);

  ctx.beginPath();
  ctx.arc(80, 250, 30, Math.PI/2, 3*Math.PI/2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(820, 250, 30, -Math.PI/2, Math.PI/2);
  ctx.stroke();
}

// --- Dibujar circuncentro ---
function dibujarCircuncentro(A,B,C){
  const D = 2*(A.x*(B.y-C.y)+B.x*(C.y-A.y)+C.x*(A.y-B.y));
  if(D===0) return;
  const Ux = ((A.x**2+A.y**2)*(B.y-C.y)+(B.x**2+B.y**2)*(C.y-A.y)+(C.x**2+C.y**2)*(A.y-B.y))/D;
  const Uy = ((A.x**2+A.y**2)*(C.x-B.x)+(B.x**2+B.y**2)*(A.x-C.x)+(C.x**2+C.y**2)*(B.x-A.x))/D;
  const r = Math.hypot(A.x-Ux, A.y-Uy);

  ctx.beginPath();
  ctx.arc(Ux, Uy, r, 0, 2*Math.PI);
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(Ux, Uy, 6, 0, 2*Math.PI);
  ctx.fillStyle = 'yellow';
  ctx.fill();
}

function dibujarIncentro(A,B,C){
  // Longitudes de los lados opuestos
  const a = Math.hypot(B.x-C.x, B.y-C.y); // lado opuesto a A
  const b = Math.hypot(A.x-C.x, A.y-C.y); // lado opuesto a B
  const c = Math.hypot(A.x-B.x, A.y-B.y); // lado opuesto a C

  // Coordenadas del incentro
  const Ix = (a*A.x + b*B.x + c*C.x) / (a + b + c);
  const Iy = (a*A.y + b*B.y + c*C.y) / (a + b + c);

  // Radio de la circunferencia inscrita
  const s = (a + b + c) / 2; // semiperímetro
  const area = Math.sqrt(s*(s-a)*(s-b)*(s-c));
  const r = area / s;

  // Dibujar circunferencia
  ctx.beginPath();
  ctx.arc(Ix, Iy, r, 0, 2*Math.PI);
  ctx.strokeStyle = 'pink';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibujar punto central
  ctx.beginPath();
  ctx.arc(Ix, Iy, 6, 0, 2*Math.PI);
  ctx.fillStyle = 'pink';
  ctx.fill();
}


// --- Dibujar todo ---
function dibujar(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  dibujarCampo();

  if(jugadores.length>1){
    const puntos = jugadores.map(j => [j.x,j.y]);
    const delaunay = d3.Delaunay.from(puntos);
    const voronoi = delaunay.voronoi([0,0,canvas.width,canvas.height]);

    // Uniones todos
    if(chkUnionesTodos.checked){
      ctx.strokeStyle = '#003300';
      ctx.lineWidth = 1;
      const triangles = delaunay.triangles;
      for(let i=0; i<triangles.length; i+=3){
        const p0 = jugadores[triangles[i]];
        const p1 = jugadores[triangles[i+1]];
        const p2 = jugadores[triangles[i+2]];
        ctx.beginPath();
        ctx.moveTo(p0.x,p0.y);
        ctx.lineTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // --- Voronoi todos ---
    if(chkVoronoiTodos.checked){
    ctx.strokeStyle = '#747272ff';
    ctx.lineWidth = 1;
    for(let i=0; i<puntos.length; i++){
        const cell = voronoi.cellPolygon(i);
        if(cell){
        ctx.beginPath();
        ctx.moveTo(cell[0][0], cell[0][1]);
        for(let j=1;j<cell.length;j++){
            ctx.lineTo(cell[j][0], cell[j][1]);
        }
        ctx.closePath();
        ctx.stroke();
        }
    }
    }

    // Voronoi todos
  //if(chkVoronoiTodos.checked){
  //  ctx.strokeStyle = '#333';
  //  voronoi.render(ctx);
  //}

  //// Todas las líneas de Voronoi (solo si está marcado)
  //if(chkVoronoiGlobal.checked){
  //  ctx.strokeStyle = 'orange';
  //  ctx.lineWidth = 1;
  //  voronoi.render(ctx);
  //}
    //
    // Voronoi global (todas las líneas)
    if(chkVoronoiGlobal.checked){
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 1;
      for(let i=0; i<puntos.length; i++){
        const cell = voronoi.cellPolygon(i);
        if(cell){
          ctx.beginPath();
          ctx.moveTo(cell[0][0], cell[0][1]);
          for(let j=1;j<cell.length;j++){
            ctx.lineTo(cell[j][0], cell[j][1]);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    // Seleccionados
    // Seleccionados
    if(seleccionados.length === 3 && chkSeleccionados.checked){
    // Triángulo
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(seleccionados[0].x, seleccionados[0].y);
    ctx.lineTo(seleccionados[1].x, seleccionados[1].y);
    ctx.lineTo(seleccionados[2].x, seleccionados[2].y);
    ctx.closePath();
    ctx.stroke();

    // Circuncentro
    dibujarCircuncentro(seleccionados[0], seleccionados[1], seleccionados[2]);

    // Voronoi de los seleccionados
    const selPuntos = seleccionados.map(j => [j.x, j.y]);
    const selDelaunay = d3.Delaunay.from(selPuntos);
    const selVoronoi = selDelaunay.voronoi([0,0,canvas.width,canvas.height]);
    
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    for(let i=0; i<selPuntos.length; i++){
        const cell = selVoronoi.cellPolygon(i);
        if(cell){
        ctx.beginPath();
        ctx.moveTo(cell[0][0], cell[0][1]);
        for(let j=1; j<cell.length; j++){
            ctx.lineTo(cell[j][0], cell[j][1]);
        }
        ctx.closePath();
        ctx.stroke();
        }
    }
    
      // Incentro
      if(chkIncentro.checked){
        dibujarIncentro(seleccionados[0], seleccionados[1], seleccionados[2]);
    }
    }

  }
// --- Todas las líneas de Voronoi (solo si la casilla está marcada) ---
if(chkVoronoiGlobal.checked && jugadores.length > 1){
  const puntos = jugadores.map(j => [j.x,j.y]);
  const delaunayGlobal = d3.Delaunay.from(puntos);
  const voronoiGlobal = delaunayGlobal.voronoi([0,0,canvas.width,canvas.height]);
  
  ctx.save();  // Guardamos estado
  ctx.strokeStyle = 'orange';
  ctx.lineWidth = 1;
  for(let i=0; i<puntos.length; i++){
    const cell = voronoiGlobal.cellPolygon(i);
    if(cell){
      ctx.beginPath();
      ctx.moveTo(cell[0][0], cell[0][1]);
      for(let j=1; j<cell.length; j++){
        ctx.lineTo(cell[j][0], cell[j][1]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore(); // Restauramos estilo original
}

  // Dibujar jugadores
  for(let j of jugadores){
    ctx.beginPath();
    ctx.arc(j.x,j.y,12,0,2*Math.PI);
    ctx.fillStyle = j.color;
    ctx.fill();
    ctx.strokeStyle = seleccionados.includes(j)?'yellow':'black';
    ctx.lineWidth = seleccionados.includes(j)?3:1;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font='bold 12px Verdana';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    const num=j.nombre.split(' ')[1];
    ctx.fillText(num,j.x,j.y);

    if(chkNombres.checked){
      ctx.fillStyle='black';
      ctx.font='12px Verdana';
      ctx.textAlign='left';
      ctx.fillText(j.nombre,j.x+15,j.y-10);
    }
  }
}

// --- Variables arrastrar y doble tap ---
//let jugadorMovido = null;
//let arrastrando = false;
let lastTap = 0;

// --- Función para obtener posición (mouse o touch) ---
//function obtenerPosicion(e){
//  if(e.touches && e.touches.length>0){
//    const rect = canvas.getBoundingClientRect();
//    return {
//      offsetX: e.touches[0].clientX - rect.left,
//      offsetY: e.touches[0].clientY - rect.top
//    };
//  } else {
//    return { offsetX: e.offsetX, offsetY: e.offsetY };
//  }
//}
// --- Obtener posición del evento ---
function obtenerPosicion(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches && e.touches.length > 0) {
    return {
      offsetX: e.touches[0].clientX - rect.left,
      offsetY: e.touches[0].clientY - rect.top
    };
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    return {
      offsetX: e.changedTouches[0].clientX - rect.left,
      offsetY: e.changedTouches[0].clientY - rect.top
    };
  } else {
    // fallback para mouse
    return {
      offsetX: e.offsetX ?? e.clientX - rect.left,
      offsetY: e.offsetY ?? e.clientY - rect.top
    };
  }
}


// --- Funciones de arrastre ---
//function iniciarArrastre(e){
//  const {offsetX, offsetY} = obtenerPosicion(e);
//  jugadorMovido = jugadores.find(j => Math.hypot(j.x-offsetX, j.y-offsetY) < 12);
//  if(jugadorMovido) arrastrando = true;
//  e.preventDefault();
//}
// --- Arrastre ---
function iniciarArrastre(e) {
  const { offsetX, offsetY } = obtenerPosicion(e);
  jugadorMovido = jugadores.find(j => Math.hypot(j.x - offsetX, j.y - offsetY) < 12);
  arrastrando = !!jugadorMovido;
  e.preventDefault();
}


function moverJugador(e){
  if(!arrastrando || !jugadorMovido) return;
  const {offsetX, offsetY} = obtenerPosicion(e);
  jugadorMovido.x = offsetX;
  jugadorMovido.y = offsetY;
  dibujar();
  e.preventDefault();
}

function soltarJugador(e){
  arrastrando = false;
  jugadorMovido = null;
  //e.preventDefault();
}

// --- Seleccionar jugador ---
//function seleccionarJugador(x, y){
//  const j = jugadores.find(j=>Math.hypot(j.x-x,j.y-y)<12);
//  if(j){
//    if(seleccionados.includes(j)) seleccionados = seleccionados.filter(s=>s!==j);
//    else if(seleccionados.length<3) seleccionados.push(j);
//    dibujar();
//  }
//}

// --- Selección ---
function seleccionarJugador(x, y) {
  const j = jugadores.find(j => Math.hypot(j.x - x, j.y - y) < 12);
  if (j) {
    if (seleccionados.includes(j)) {
      seleccionados = seleccionados.filter(s => s !== j);
    } else if (seleccionados.length < 3) {
      seleccionados.push(j);
    }
    dibujar();
  }
}

// --- Función agregar jugador ---
//function agregarJugador(e){
//  const {offsetX, offsetY} = obtenerPosicion(e);
//  const nuevo = {
//    nombre: `Jugador ${jugadores.length+1}`,
//    x: offsetX,
//    y: offsetY,
//    color: colorAleatorio()
//  };
//  jugadores.push(nuevo);
//  dibujar();
//}
// --- Agregar jugador ---
function agregarJugador(x, y){
  const nuevo = {
    nombre: `Jugador ${jugadores.length+1}`,
    x: x,
    y: y,
    color: colorAleatorio()
  };
  jugadores.push(nuevo);
  dibujar();
}


// --- Eventos unificados ---
//function handlePointerEnd(e){
//  const {offsetX, offsetY} = obtenerPosicion(e);
//  
//  // Selección
//  if(!arrastrando) seleccionarJugador(offsetX, offsetY);
//
//  // Doble tap/doble click
//  const currentTime = new Date().getTime();
//  if(currentTime - lastTap < 300){
//    agregarJugador(offsetX, offsetY);
//  }
//  lastTap = currentTime;
//
//  soltarJugador(e);
//}

// --- Fin del clic/tap ---
function handlePointerEnd(e) {
  const { offsetX, offsetY } = obtenerPosicion(e);

  if (!arrastrando) {
    // click o tap simple
    //seleccionarJugador(offsetX, offsetY);
    const currentTime = Date.now();

    // doble clic o doble tap
    //const currentTime = Date.now();
    if (currentTime - lastTap < 300) {
      agregarJugador(offsetX, offsetY);
    } else {
      seleccionarJugador(offsetX, offsetY);
    }
    lastTap = currentTime;
  }

  soltarJugador();
  e.preventDefault();
}

// --- Eventos mouse ---
canvas.addEventListener('mousedown', iniciarArrastre);
canvas.addEventListener('mousemove', moverJugador);
//canvas.addEventListener('mouseup', soltarJugador);
//canvas.addEventListener('mouseup', e=>{
//  if(!arrastrando){
//    const {offsetX, offsetY} = obtenerPosicion(e);
//    seleccionarJugador(offsetX, offsetY);
//  }
//  soltarJugador(e);
//});
//
canvas.addEventListener('mouseup', handlePointerEnd);


canvas.addEventListener('click', e=>{
  if(arrastrando) return;
  const {offsetX, offsetY} = obtenerPosicion(e);
  const j = jugadores.find(j=>Math.hypot(j.x-offsetX,j.y-offsetY)<12);
  if(j){
    if(seleccionados.includes(j)) seleccionados = seleccionados.filter(s=>s!==j);
    else if(seleccionados.length<3) seleccionados.push(j);
    dibujar();
  }
});
//canvas.addEventListener('dblclick', agregarJugador);
//
//canvas.addEventListener('dblclick', e=>{
//  const {offsetX, offsetY} = obtenerPosicion(e);
//  agregarJugador(offsetX, offsetY);
//});

// --- Touch ---
canvas.addEventListener('touchstart', iniciarArrastre, {passive:false});
canvas.addEventListener('touchmove', moverJugador, {passive:false});
canvas.addEventListener('touchend', handlePointerEnd, {passive:false});

// --- Eliminar con clic derecho ---
canvas.addEventListener('contextmenu', e=>{
  e.preventDefault();
  const {offsetX, offsetY} = obtenerPosicion(e);
  const idx = jugadores.findIndex(j=>Math.hypot(j.x-offsetX,j.y-offsetY)<12);
  if(idx>=0){
    jugadores.splice(idx,1);
    seleccionados = seleccionados.filter(s=>jugadores.includes(s));
    dibujar();
  }
});

// --- Eventos touch (móviles) ---
//canvas.addEventListener('touchstart', iniciarArrastre, {passive:false});
//canvas.addEventListener('touchmove', moverJugador, {passive:false});
//canvas.addEventListener('touchend', e=>{
//  soltarJugador(e);
//  const currentTime = new Date().getTime();
//  const tapLength = currentTime - lastTap;
//  if(tapLength < 300 && tapLength > 0){
//    // Doble tap detectado
//    agregarJugador(e);
//    e.preventDefault();
//  }
//  lastTap = currentTime;
//}, {passive:false});


//canvas.addEventListener('touchend', e=>{
//  const {offsetX, offsetY} = obtenerPosicion(e);
//  
//  if(!arrastrando){
//    // Selección simple
//    seleccionarJugador(offsetX, offsetY);
//
//    // Doble tap
//    const currentTime = new Date().getTime();
//    const tapLength = currentTime - lastTap;
//    if(tapLength < 300 && tapLength > 0){
//      agregarJugador(offsetX, offsetY);
//      e.preventDefault();
//    }
//    lastTap = currentTime;
//  }
//  
//  soltarJugador(e);
//}, {passive:false});

// --- Botones y checkboxes ---
btnLimpiar.addEventListener('click', ()=>{ seleccionados=[]; dibujar(); });
[chkUnionesTodos, chkVoronoiTodos, chkVoronoiGlobal, chkSeleccionados, chkNombres].forEach(chk=>chk.addEventListener('change', dibujar));

function colorAleatorio(){
  const colores = ['blue','red','green','orange','purple','cyan','magenta','brown'];
  return colores[Math.floor(Math.random()*colores.length)];
}
const chkIncentro = document.getElementById('mostrarIncentro');
chkIncentro.addEventListener('change', dibujar);

// --- Inicializar ---
dibujar();

//// --- Eventos ---
//canvas.addEventListener('mousedown', e=>{
//  const {offsetX, offsetY} = e;
//  jugadorMovido = jugadores.find(j=>Math.hypot(j.x-offsetX,j.y-offsetY)<12);
//  if(jugadorMovido) arrastrando=true;
//});
//
//canvas.addEventListener('mousemove', e=>{
//  if(arrastrando && jugadorMovido){
//    jugadorMovido.x = e.offsetX;
//    jugadorMovido.y = e.offsetY;
//    dibujar();
//  }
//});
//
//canvas.addEventListener('mouseup', ()=>{ arrastrando=false; jugadorMovido=null; });
//
//canvas.addEventListener('click', e=>{
//  if(arrastrando) return;
//  const {offsetX, offsetY} = e;
//  const j = jugadores.find(j=>Math.hypot(j.x-offsetX,j.y-offsetY)<12);
//  if(j){
//    if(seleccionados.includes(j)) seleccionados = seleccionados.filter(s=>s!==j);
//    else if(seleccionados.length<3) seleccionados.push(j);
//    dibujar();
//  }
//});
//
//canvas.addEventListener('dblclick', e=>{
//  const nuevo = {nombre:`Jugador ${jugadores.length+1}`, x:e.offsetX, y:e.offsetY, color:colorAleatorio()};
//  jugadores.push(nuevo);
//  dibujar();
//});
//
//canvas.addEventListener('contextmenu', e=>{
//  e.preventDefault();
//  const {offsetX, offsetY} = e;
//  const idx = jugadores.findIndex(j=>Math.hypot(j.x-offsetX,j.y-offsetY)<12);
//  if(idx>=0){
//    jugadores.splice(idx,1);
//    seleccionados = seleccionados.filter(s=>jugadores.includes(s));
//    dibujar();
//  }
//});