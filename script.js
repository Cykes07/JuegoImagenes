const URL = "https://teachablemachine.withgoogle.com/models/us2_YUu0t/";
let model, webcam, maxPredictions;
let currentStep = 0;

const tasks = [
    { 
        message: "Verificando identidad de daylight", 
        target: "angie", 
        code: "val",
        footer: "Comezando con el amor de mi vida",
        hint: "Eres tu"
    },
    { 
        message: "Muestra primera cita (entre comilas) te di regale recipiente muy especial para ti", 
        target: "vaso", 
        code: "et",
        footer: "La verdad ame pasa este dia contigo, fue muy especial y divertido en todos los aspectos, desde el concierto hasta el final de la noche que comimos", 
        hint: "Es un vaso del cine"
    },
    { 
        message: "Muestra el regalo de papel que siempre te daba para tu mano", 
        target: "anillo", 
        code: "in",
        footer: "Siempre hacia esto para relajarme de pequeño, cuando te conoci me volvi adicto a hacerlo, y siempre te lo daba para que lo tuvieras en tu mano y saber si tienes confianza hacia mi",
        hint: "Hay una cancion de Taylor Swift de lover en la cual su titulo lo indica"
    },
    { 
        message: "Nuestro hijo desde tu cumple del año pasado", 
        target: "agro", 
        code: "14",
        footer: "No me acuerdo quien fue que me dio la idea, pero la verdad es el mejor regalo que te he podido dar y espero que te acompañe cuando yo no este, cual es su proposito de porque decidi darte esto",
        hint: "Agro"
    }
];

document.getElementById("start-button").addEventListener("click", async () => {
    document.getElementById("instructions").style.display = "none";
    document.getElementById("game-container").style.display = "flex";
    await init();
});

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    updateGameUI();
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

let isProcessing = false; // Evita múltiples detecciones seguidas

async function predict() {
    if (isProcessing) return; // Si ya está procesando, no hacer nada

    const prediction = await model.predict(webcam.canvas);
    const correctPrediction = prediction.find(p => p.className === tasks[currentStep].target && p.probability > 0.8);
    
    if (correctPrediction) {
        isProcessing = true; // Evita que se vuelva a predecir rápidamente

        if (currentStep === 0) {  
            // Primera pista: Mostrar "Procesando..." con retraso
            document.getElementById("result-text").innerText = "";
            document.getElementById("loading").style.display = "block";
            document.getElementById("next-button").style.display = "none"; 

            setTimeout(() => {
                document.getElementById("loading").style.display = "none";
                document.getElementById("result-text").innerText = `¡Correcto! Código: ${tasks[currentStep].code}`;
                document.getElementById("next-button").style.display = "block";
            }, 7000);
        } else {
            // Resto de las pistas: Mostrar resultado inmediatamente
            document.getElementById("result-text").innerText = `¡Correcto! Código: ${tasks[currentStep].code}`;
            document.getElementById("next-button").style.display = "block";
        }
    }
}

document.getElementById("next-button").addEventListener("click", () => {
    currentStep++;
    isProcessing = false; // Permite nuevas detecciones

    if (currentStep < tasks.length) {
        updateGameUI();
    } else {
        document.getElementById("pista").innerText = "¡Felicidades! Se acabó el juego.";
        document.getElementById("result-text").innerText = "";
        document.getElementById("next-button").style.display = "none";
        document.getElementById("footer-text").innerText = "Recuerdas los códigos, bueno en el link cambia JuegoImagenes por el codigo en orden de aparecion";
        document.getElementById("hint-container").style.display = "none";
    }
});

document.getElementById("hint-button").addEventListener("click", () => {
    document.getElementById("hint-container").innerText = tasks[currentStep].hint;
    document.getElementById("hint-container").style.display = "block";
});

function updateGameUI() {
    document.getElementById("pista").innerText = tasks[currentStep].message;
    document.getElementById("result-text").innerText = "";
    document.getElementById("next-button").style.display = "none";
    document.getElementById("footer-text").innerText = tasks[currentStep].footer;
    document.getElementById("hint-container").style.display = "none";
}
