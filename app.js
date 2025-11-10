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
  { nombre: "Jugador 2", x: 450, y: 400, color: 'red' },
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

function dibujarOrtocentro(A, B, C) {
  // --- Cálculo del ortocentro mediante ecuaciones generales ---

  // Ecuaciones de los lados (Ax + By + C = 0)
  const A1 = B.y - C.y;
  const B1 = C.x - B.x;
  const C1 = B.x * C.y - C.x * B.y;

  const A2 = A.y - C.y;
  const B2 = C.x - A.x;
  const C2 = A.x * C.y - C.x * A.y;

  // Altura desde A (perpendicular a BC)
  const AA = B1;
  const BA = -A1;
  const CA = -(AA * A.x + BA * A.y);

  // Altura desde B (perpendicular a AC)
  const AB = B2;
  const BB = -A2;
  const CB = -(AB * B.x + BB * B.y);

  // Intersección de las dos alturas → ortocentro
  const det = AA * BB - AB * BA;
  if (Math.abs(det) < 1e-6) return; // Evita división por cero (triángulo degenerado)

  const Ox = (BB * (-CA) - BA * (-CB)) / det;
  const Oy = (AA * (-CB) - AB * (-CA)) / det;

  // --- Dibujar las alturas extendidas ---
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.6)';
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 1.5;

  // Dibuja una altura extendida desde un vértice, perpendicular a un lado
  function dibujarAlturaExtendida(px, py, P1, P2) {
    // Ecuación del lado base P1P2
    const A_ = P1.y - P2.y;
    const B_ = P2.x - P1.x;

    // Ecuación de la altura (perpendicular a P1P2 que pasa por (px, py))
    const Aalt = B_;
    const Balt = -A_;
    const Calt = -(Aalt * px + Balt * py);

    // Dibujar la altura como una línea larga que cruza el canvas
    const puntos = [];
    for (let x of [0, canvas.width]) {
      const y = (-Aalt * x - Calt) / Balt;
      puntos.push({ x, y });
    }
    for (let y of [0, canvas.height]) {
      const x = (-Balt * y - Calt) / Aalt;
      puntos.push({ x, y });
    }

    // Filtra los puntos que están dentro del canvas
    const dentro = puntos.filter(p =>
      p.x >= 0 && p.x <= canvas.width && p.y >= 0 && p.y <= canvas.height
    );

    if (dentro.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(dentro[0].x, dentro[0].y);
      ctx.lineTo(dentro[1].x, dentro[1].y);
      ctx.stroke();
    }
  }

  // Dibuja las tres alturas extendidas
  dibujarAlturaExtendida(A.x, A.y, B, C);
  dibujarAlturaExtendida(B.x, B.y, A, C);
  dibujarAlturaExtendida(C.x, C.y, A, B);

  ctx.setLineDash([]);
  ctx.restore();

  // --- Dibujar punto del ortocentro ---
  ctx.beginPath();
  ctx.arc(Ox, Oy, 5, 0, 2 * Math.PI);
  ctx.fillStyle = 'blue';
  ctx.fill();

  // Etiqueta “H”
  ctx.fillStyle = 'black';
  ctx.font = '12px Verdana';
  ctx.fillText('H', Ox + 8, Oy - 8);
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
      // Ortocentro
      // Ortocentro
      if (chkOrtocentro.checked) {
        dibujarOrtocentro(seleccionados[0], seleccionados[1], seleccionados[2]);
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


// --- Fin del clic/tap ---
let touchTimer = null;
let lastTapTime = 0;
let lastTouchEnd = 0;
let isTouchDevice = false;
lastTap = 0;
let tapTimeout = null;
//let lastTouchEnd = 0;
let touchStartPos = null;  // posición inicial del toque
let holdTimer = null; // 🔥 para detectar toque prolongado

window.addEventListener("touchstart", () => {
  isTouchDevice = true;
});


function handlePointerEnd(e, pos) {
 // e.preventDefault();
 // const pos = e.touchStartPos || obtenerPosicion(e) || { offsetX: 0, offsetY: 0 };
  //if (!pos) return;
  const { offsetX, offsetY } = pos || { offsetX: 0, offsetY: 0 };
  const currentTime = Date.now();
  const tapDelay = 300;

  // Evita dobles ejecuciones por el sistema

  //lastTouchEnd = currentTime;
  if (e.type === "touchend" && currentTime - lastTouchEnd < 30) return;
  lastTouchEnd = currentTime;


  if (!arrastrando) {
    if (currentTime - lastTap < tapDelay) {
      // 🔥 Doble tap → agregar jugador
      clearTimeout(tapTimeout);
      agregarJugador(offsetX, offsetY);
      lastTap = 0;
    } else {
      // 🔹 Tap simple → seleccionar / deseleccionar
      clearTimeout(tapTimeout);
      tapTimeout = setTimeout(() => {
        const j = jugadores.find(j => Math.hypot(j.x - offsetX, j.y - offsetY) < 12);
        if (j) {
          if (seleccionados.includes(j))
            seleccionados = seleccionados.filter(s => s !== j);
          else if (seleccionados.length < 3)
            seleccionados.push(j);
          dibujar();
        }
      }, tapDelay);
    }
  }

  soltarJugador();
  lastTap = currentTime;
  //e.preventDefault();
}


// --- Eventos mouse ---
// --- Eventos MOUSE (solo PC) ---
// --- PC ---
if (!("ontouchstart" in window)) {
  canvas.addEventListener("mousedown", iniciarArrastre);
  canvas.addEventListener("mousemove", moverJugador);
  canvas.addEventListener("mouseup", e => {
    const pos  = obtenerPosicion(e);
    handlePointerEnd(e, pos);
  });

canvas.addEventListener('click', e => {
   if (arrastrando) return;
   const { offsetX, offsetY } = obtenerPosicion(e);
   const j = jugadores.find(j => Math.hypot(j.x - offsetX, j.y - offsetY) < 12);
   if (j) {
     if (seleccionados.includes(j))
       seleccionados = seleccionados.filter(s => s !== j);
     else if (seleccionados.length < 3)
       seleccionados.push(j);
     dibujar();
   }
 });

 // --- Eliminar jugador con clic derecho ---
canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  const { offsetX, offsetY } = obtenerPosicion(e);
  const idx = jugadores.findIndex(j => Math.hypot(j.x - offsetX, j.y - offsetY) < 12);
  if (idx >= 0) {
    jugadores.splice(idx, 1);
    seleccionados = seleccionados.filter(s => jugadores.includes(s));
    dibujar();
  }
});
}



// --- Eventos TOUCH (solo móvil/tablet) ---
// --- MÓVIL / TABLET ---
if ("ontouchstart" in window) {
  let moved = false; // para detectar movimiento durante el toque
  let arrastreIniciado = false; // 👈 nuevo flag para iniciar arrastre solo si hay movimiento real

  canvas.addEventListener("touchstart", e => {
    touchStartPos = obtenerPosicion(e);
    moved = false; // reiniciar moved al iniciar el toque
    //iniciarArrastre(e);
    arrastreIniciado = false; // reiniciar flag de arrastre

    // 🔥 Si mantiene el toque más de 600 ms → eliminar jugador
    holdTimer = setTimeout(() => {
      const { offsetX, offsetY } = touchStartPos;
      const idx = jugadores.findIndex(j => Math.hypot(j.x - offsetX, j.y - offsetY) < 12);
      if (idx >= 0) {
        jugadores.splice(idx, 1);
        seleccionados = seleccionados.filter(s => jugadores.includes(s));
        dibujar();
      }
    }, 600);
  }, { passive: false });

  canvas.addEventListener("touchmove", e => {
    const pos = obtenerPosicion(e);
    if (!touchStartPos || !pos) return;

    const distancia = Math.hypot(pos.offsetX - touchStartPos.offsetX, pos.offsetY - touchStartPos.offsetY);
    const umbral = Math.max(2, canvas.width / 300); // dinámico: entre 2 y 4 px aprox.

    if (distancia > umbral) {
      moved = true;
      clearTimeout(holdTimer); // cancelar eliminación si se mueve
      if (!arrastreIniciado) {
        iniciarArrastre(e);
        arrastreIniciado = true; // marcar que el arrastre ha comenzado
      }
      moverJugador(e);
    }

    //if (Math.hypot(pos.offsetX - touchStartPos.offsetX, pos.offsetY - touchStartPos.offsetY) > 5) {
     // moved = true;
     // clearTimeout(holdTimer); // cancelar eliminación si se mueve
      //iniciarArrastre(e);
     // moverJugador(e);
    //}
  }, { passive: false });

  canvas.addEventListener("touchend", e => {

    clearTimeout(holdTimer);
    const pos = obtenerPosicion(e);
    if (!moved &&pos) {
      // 🔹 Si no se movió → selección o doble tap
      handlePointerEnd(e, pos);
    }
    soltarJugador();
    touchStartPos = null;    
    moved = false;
    arrastreIniciado = false;
  }, { passive: false });
}





// --- Botones y checkboxes ---
btnLimpiar.addEventListener('click', ()=>{ seleccionados=[]; dibujar(); });
[chkUnionesTodos, chkVoronoiTodos, chkVoronoiGlobal, chkSeleccionados, chkNombres].forEach(chk=>chk.addEventListener('change', dibujar));

function colorAleatorio(){
  const colores = ['blue','red','green','orange','purple','cyan','magenta','brown'];
  return colores[Math.floor(Math.random()*colores.length)];
}
const chkIncentro = document.getElementById('mostrarIncentro');
chkIncentro.addEventListener('change', dibujar);

const chkOrtocentro = document.getElementById('mostrarOrtocentro');
chkOrtocentro.addEventListener('change', dibujar);

// --- Inicializar ---
dibujar();

