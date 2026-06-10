let recognition;
let isListening = false;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusText = document.getElementById('status');
const resultDiv = document.getElementById('result');

// Verificar si el navegador soporta reconocimiento de voz nativo
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    statusText.innerText = "Estado: Tu navegador no soporta reconocimiento de voz nativo. Usá Chrome o Edge.";
    startBtn.disabled = true;
} else {
    // Inicializar el motor nativo
    recognition = new SpeechRecognition();
    
    // Configuración
    recognition.lang = 'es-AR';
    recognition.continuous = true;
    recognition.interimResults = false;
    
    // AGREGA ESTAS DOS LÍNEAS:
    recognition.maxAlternatives = 1;
    
    // Cambiamos el comportamiento del onend para asegurarnos de que reviva al instante
    recognition.onend = () => {
        if (isListening) {
            try {
                recognition.start();
            } catch(e) {
                // Evita que tire error si intenta reabrir mientras se está cerrando
            }
        }
    };
    // Qué hacer cuando escucha algo
    recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const textDetected = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        const confidence = event.results[lastResultIndex][0].confidence;

        // Mostramos el resultado en pantalla
        resultDiv.innerText = `🗣️ Escuché: "${textDetected}" (Confianza: ${Math.round(confidence * 100)}%)`;
    };

    // Controlar errores o desconexiones
    recognition.onerror = (event) => {
        console.error("Error en reconocimiento:", event.error);
        if (event.error === 'not-allowed') {
            statusText.innerText = "Estado: Permiso de micrófono denegado.";
            stopListening();
        }
    };

    recognition.onend = () => {
        // Si se corta por inactividad pero el usuario no tocó "Detener", relanzamos
        if (isListening) {
            recognition.start();
        }
    };
}

function startListening() {
    if (!recognition) return;
    
    isListening = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.innerText = "Estado: Escuchando nativamente (Hablá ahora)...";
    resultDiv.innerText = "";
    
    try {
        recognition.start();
    } catch (e) {
        console.error(e);
    }
}

function stopListening() {
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.innerText = "Estado: Detenido.";
    if (recognition) {
        recognition.stop();
    }
}

startBtn.addEventListener('click', startListening);
stopBtn.addEventListener('click', stopListening);