document.addEventListener("DOMContentLoaded", () => {
    // Capturar el contenedor de navegación de la barra lateral
    const sidebarNav = document.getElementById("sidebar-nav");

    if (sidebarNav) {
        sidebarNav.addEventListener("click", (e) => {
            // Identificar si el clic fue en un botón con la clase .nav-btn
            const button = e.target.closest(".nav-btn");
            if (!button) return;

            // Obtener el ID de la sección a mostrar
            const targetId = button.getAttribute("data-target");

            // 1. Quitar la clase 'active' de todos los botones y secciones
            document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));

            // 2. Agregar la clase 'active' al botón clickeado y a la sección correspondiente
            button.classList.add("active");
            const targetTab = document.getElementById(targetId);
            if (targetTab) {
                targetTab.classList.add("active");
            }
        });
    }
});
// LÓGICA DEL CHATBOT
document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send-btn");
    const toggleBtn = document.getElementById("chat-toggle-btn");
    const chatWidget = document.querySelector(".chat-widget");

    // Eventos de envío
    sendBtn.addEventListener("click", procesarMensajeChat);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") procesarMensajeChat();
    });

    // Minimizar / Maximizar widget
    toggleBtn.addEventListener("click", () => {
        chatWidget.classList.toggle("minimized");
        toggleBtn.innerText = chatWidget.classList.contains("minimized") ? "+" : "−";
    });

    async function procesarMensajeChat() {
        const mensaje = chatInput.value.trim();
        if (!mensaje) return;

        // 1. Mostrar mensaje del usuario
        agregarMensaje(mensaje, "user-msg");
        chatInput.value = "";

        // 2. Intentar respuesta local o backend
        try {
            // Petición al backend en Python (Si está activo)
            const respuesta = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: mensaje })
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                agregarMensaje(data.reply, "bot-msg");
            } else {
                throw new Error("Sin respuesta del servidor");
            }
        } catch (error) {
            // Fallback: Respuestas locales si el backend no está corriendo
            const respuestaLocal = obtenerRespuestaLocal(mensaje.toLowerCase());
            setTimeout(() => agregarMensaje(respuestaLocal, "bot-msg"), 400);
        }
    }

    function agregarMensaje(texto, claseCss) {
        const chatBox = document.getElementById("chat-box");
        const msgDiv = document.createElement("div");
        msgDiv.className = claseCss;
        msgDiv.innerText = texto;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Respuestas predeterminadas cuando no hay conexión al backend en Python
    function obtenerRespuestaLocal(msg) {
        if (msg.includes("convocatoria") || msg.includes("requisito")) {
            return "Las convocatorias requieren promedio acumulado superior a 4.0 y estar cursando al menos 3er semestre.";
        } else if (msg.includes("arl")) {
            return "El trámite de la ARL se realiza tras la selección subiendo el documento de identidad y certificado EPS en la pestaña de Evidencias.";
        } else if (msg.includes("reserva") || msg.includes("cupo")) {
            return "Puedes reservar cupo navegando a la sección 'Reservas' del menú lateral.";
        } else if (msg.includes("hola") || msg.includes("buenas")) {
            return "¡Hola! ¿En qué puedo orientarte sobre las monitorías?";
        } else {
            return "Puedo ayudarte con información sobre 'convocatorias', 'requisitos', 'ARL', 'reserva de cupos' o 'estado de postulación'.";
        }
    }
});