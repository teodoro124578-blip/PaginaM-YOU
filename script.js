// =========================
// URLS
// =========================
const API_URL = "https://script.google.com/macros/s/AKfycbyLM82xZPvEFLRSMj1DwGuOxN4tHNpOrASMJHLRAUCSejChXK8Pw2AtW6ENQmDJ2IHlOA/exec"; // login/registro
const API_PEDIDOS = "https://script.google.com/macros/s/AKfycbyRoPzcHZVxBjI14BEb7EAt-lys9Y-YePwHiNP0Jh5vS_XLMnDcF13YBELIcOUTpbf7tg/exec"; // pedidos
const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxyYDYl0iN40fbvoBXjSviuAf1P62Cv23TmtG0NDNS_IGjdwb0NW9R40AcmuRLbyEiuHQ/exec"; // subir imagen
const URL_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbz-yPwu0eaHgbx030J1RGEEPpxV21ysj9jjHwTQue91LQ0dIWyizmq0cGKK7I_2zwM4KQ/exec"; // Mirar Pedidos


// =========================
// DATOS DEL USUARIO
// =========================
let usuarioActual = { id:null, nombre:null, usuario:null };

// =========================
// MOSTRAR / OCULTAR FORMULARIOS
// =========================
function mostrarRegistro(){
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("registro-form").classList.remove("hidden");
}

function mostrarLogin(){
  document.getElementById("registro-form").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
}

// =========================
// MOSTRAR CONTRASEÑA
// =========================
function togglePassword(id){
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// =========================
// LOGIN
// =========================
function login(){
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      usuario: document.getElementById("login-usuario").value,
      clave: document.getElementById("login-clave").value
    })
  })
  .then(r => r.json())
  .then(res => {
    if(!res.ok){
      alert(res.mensaje);
      return;
    }

    usuarioActual = res.usuario;
    document.getElementById("bienvenida").innerText = "Bienvenida, " + usuarioActual.nombre;

    document.getElementById("auth").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  });
}

// =========================
// REGISTRO
// =========================
function registrar(){
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "registro",
      usuario: document.getElementById("reg-usuario").value,
      clave: document.getElementById("reg-clave").value,
      nombre: document.getElementById("reg-nombre").value,
      email: document.getElementById("reg-email").value
    })
  })
  .then(r => r.json())
  .then(res => alert(res.mensaje));
}

// =========================
// SIDEBAR
// =========================
function toggleMenu(){
  document.getElementById("sidebar").classList.toggle("open");
}

function cambiarSeccion(nombre){
  document.getElementById("titulo-seccion").innerText = "Bienvenida a " + nombre;

  // Ocultar todas las secciones de contenido
  document.querySelectorAll('.contenido > div[id^="seccion-"]').forEach(div => div.classList.add("hidden"));

  // Mostrar solo la sección seleccionada
  switch(nombre) {

    case "Solicitar Arreglo":
  document.getElementById("seccion-solicitar-arreglo").classList.remove("hidden");

  const nombreInput = document.getElementById("nombre_cliente");
  nombreInput.value = usuarioActual.nombre;

  // Evita que el usuario pueda escribir
  nombreInput.setAttribute("readonly", true); // readonly para que no pueda escribir
  nombreInput.addEventListener("keydown", function(e) {
    e.preventDefault(); // bloquea cualquier tecla
  });

  

  break;


case "Mis Arreglos":
  document.getElementById("seccion-mis-arreglos").classList.remove("hidden");

  const nombreMisArreglos = document.getElementById("nombre");
  nombreMisArreglos.value = usuarioActual.nombre; // coloca nombre fijo
  nombreMisArreglos.setAttribute("readonly", true); // no editable
  nombreMisArreglos.style.backgroundColor = "#f0f0f0"; // opcional visual

  break;

    case "Promociones":
      document.getElementById("seccion-promociones").classList.remove("hidden");
      break;
  }

  toggleMenu();
}

function cerrarSesion(){
  usuarioActual = { id:null, nombre:null, usuario:null };

  document.getElementById("app").classList.add("hidden");
  document.getElementById("auth").classList.remove("hidden");

  document.getElementById("sidebar").classList.remove("open");
}

// =========================
// CÓDIGO #2: Registrar pedido y subir imagen (ARREGLADO + Mis Arreglos automático)
// =========================
const tipoArregloContainer = document.getElementById("tipo_arreglo_container");
const btnRegistrar = document.getElementById("btnRegistrar");
const resultadosMisArreglos = document.getElementById("resultadosMisArreglos"); // para sección Mis Arreglos
const resultados = document.getElementById("resultados"); // para registrar pedido

// --- CONSULTAR MIS ARREGLOS ---
function consultar() {
  const nombre = document.getElementById("nombre").value.trim();
  if (!nombre) {
    alert("Nombre vacío");
    return;
  }

  resultadosMisArreglos.innerHTML = "<p>Consultando...</p>";

  // Usamos JSONP para mantener la velocidad y compatibilidad
  const script = document.createElement("script");
  script.src = URL_APPS_SCRIPT +
    "?nombre=" + encodeURIComponent(nombre) +
    "&callback=procesarPedidos";
  document.body.appendChild(script);
}

function procesarPedidos(data) {
  resultadosMisArreglos.innerHTML = "";

  if (!data.ok || data.pedidos.length === 0) {
    resultadosMisArreglos.innerHTML = "<p>❌ No se encontraron pedidos con ese nombre.</p>";
    return;
  }

  data.pedidos.forEach(p => {
    const fecha = new Date(p.FechaDeArreglo);
    fecha.setDate(fecha.getDate() + 1);
    const fechaEntrega = fecha.toISOString().split("T")[0];

    const imgLink = p.linkDrive.replace("/view", "/preview");

    resultadosMisArreglos.innerHTML += `
      <div class="resultado">
        <p><b>ID Pedido:</b> ${p.id_pedido}</p>
        <p><b>Fecha de entrega:</b> ${fechaEntrega}</p>
        <p><b>Estado:</b> ${p.estado}</p>
        <iframe src="${imgLink}" width="100%" height="400"></iframe>
        <hr>
      </div>
    `;
  });
}

// --- FUNCIONES AUXILIARES ---
function agregarArreglo(valor = "") {
  const div = document.createElement("div");
  div.className = "arreglo";
  div.innerHTML = `<input type="text" placeholder="Ej: chaqueta" value="${valor}">
                   <button type="button" onclick="eliminarArreglo(this)">X</button>`;
  tipoArregloContainer.appendChild(div);
}

function eliminarArreglo(btn) {
  tipoArregloContainer.removeChild(btn.parentNode);
}

function mostrarDireccion() {
  const tipo = document.getElementById("tipo_entrega").value;
  document.getElementById("direccion_container").style.display = tipo === "Casa" ? "block" : "none";
}

function actualizarFechaPrevia() {
  const fechaInicio = document.getElementById("fecha_inicio").value;
  const urgencia = document.getElementById("urgencia").value;
  const contenedor = document.getElementById("fecha_previa");

  if (!fechaInicio) {
    contenedor.innerText = "";
    return;
  }

  let diasSumar = urgencia === "Urgente" ? 3 : urgencia === "Moderado" ? 6 : 9;

  const fecha = new Date(fechaInicio);
  fecha.setDate(fecha.getDate() + diasSumar + 1);

  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');

  contenedor.innerText = "Tu prenda estaría lista para: " + `${yyyy}-${mm}-${dd}`;
}

// --- REGISTRAR PEDIDO Y SUBIR IMAGEN ---
async function registrarYSubir() {
  btnRegistrar.disabled = true;
  resultados.textContent = "⏳ Procesando registro de pedido...";

  try {
    const nombreCliente = document.getElementById("nombre_cliente").value;
    const telefono = document.getElementById("telefono").value;
    const tipoEntrega = document.getElementById("tipo_entrega").value;
    const direccion = document.getElementById("direccion").value;
    const fechaInicio = document.getElementById("fecha_inicio").value;
    const urgencia = document.getElementById("urgencia").value;

    const arrInputs = tipoArregloContainer.querySelectorAll("input");
    if (arrInputs.length === 0) {
      alert("Agrega al menos una prenda");
      btnRegistrar.disabled = false;
      return;
    }

    const tipoArreglo = Array.from(arrInputs).map(i => i.value.trim()).filter(v => v.length > 0).join("||");
    const cantidadArreglos = arrInputs.length;

    let diasSumar = urgencia === "Urgente" ? 3 : urgencia === "Moderado" ? 6 : 9;
    const fechaConsulta = new Date(fechaInicio);
    fechaConsulta.setDate(fechaConsulta.getDate() + diasSumar);

    const yyyyC = fechaConsulta.getFullYear();
    const mmC = String(fechaConsulta.getMonth() + 1).padStart(2, '0');
    const ddC = String(fechaConsulta.getDate()).padStart(2, '0');
    const fechaConsultaStr = `${yyyyC}-${mmC}-${ddC}`;

    const resDisponibilidad = await fetch(`${API_PEDIDOS}?action=check_disponibilidad&fecha=${fechaConsultaStr}`);
    const disponibilidad = await resDisponibilidad.json();

    if (disponibilidad.cantidad < cantidadArreglos) {
      resultados.textContent = `⚠ No hay cupo suficiente para ${cantidadArreglos} arreglos.\nCupos disponibles: ${disponibilidad.cantidad}`;
      btnRegistrar.disabled = false;
      return;
    }

    const resId = await fetch(`${API_PEDIDOS}?action=get_last_id`);
    const lastId = await resId.json();
    const idPedido = lastId.last_id + 1;

    const params = new URLSearchParams({
      action: "add_pedido",
      id_pedido: idPedido,
      nombre: nombreCliente,
      tipo_arreglo: tipoArreglo,
      telefono,
      urgencia,
      tipo_entrega: tipoEntrega,
      direccion: tipoEntrega === "Casa" ? direccion : "",
      EntregaLocal: fechaInicio,
      FechaDeArreglo: fechaConsultaStr,
      cantidad: cantidadArreglos
    });

    const resAdd = await fetch(`${API_PEDIDOS}?${params.toString()}`);
    const dataAdd = await resAdd.json();

    if (!dataAdd.ok) {
      resultados.textContent = `⚠ ${dataAdd.mensaje}` + (dataAdd.disponibles !== undefined ? `\nCupos disponibles: ${dataAdd.disponibles}` : "");
      btnRegistrar.disabled = false;
      return;
    }

    resultados.textContent = "✅ Pedido registrado correctamente.\n⏳ Subiendo imagen...";

    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files[0]) {
      resultados.textContent += "\n⚠ No se seleccionó ninguna imagen.";
      btnRegistrar.disabled = false;
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64 = e.target.result.split(",")[1];
      const data = new URLSearchParams();
      data.append("idPedido", idPedido);
      data.append("file", base64);
      data.append("mimeType", file.type);

      try {
        const resp = await fetch(WEBAPP_URL, { method: "POST", body: data });
        const text = await resp.text();
        resultados.textContent = `✅ Pedido registrado correctamente.\n${text}`;
        btnRegistrar.disabled = false;
      } catch (err) {
        resultados.textContent = "⚠ Pedido registrado, pero error al subir imagen: " + err.message;
        btnRegistrar.disabled = false;
      }
    };
    reader.readAsDataURL(file);

  } catch (err) {
    resultados.textContent = "Error general: " + err.message;
    btnRegistrar.disabled = false;
  }
}