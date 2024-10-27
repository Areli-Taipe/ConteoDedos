const video = document.getElementById('videoInput');  
const canvas = document.getElementById('canvasOutput');  
const context = canvas.getContext('2d');  
const fingerCountDisplay = document.getElementById('fingerCount');  

let hands;  

async function setupCamera() {  
    return navigator.mediaDevices.getUserMedia({ video: true })  
        .then((stream) => {  
            video.srcObject = stream;  
            return new Promise((resolve) => {  
                video.onloadedmetadata = () => { resolve(video); };  
            });  
        });  
}  

function countFingers(hand) {  
    let fingers = 0;  
    const tipIds = [4, 8, 12, 16, 20]; // IDs de los puntos de los dedos  

    tipIds.forEach((tipId, index) => {  
        const tipY = hand.landmark[tipId].y;  
        const bottomY = index === 0 ? hand.landmark[3].y : hand.landmark[tipId - 2].y; // Dedos excepto el pulgar  
        if (tipY < bottomY) {  
            fingers++;  
        }  
    });  

    return fingers;  
}  

async function main() {  
    await setupCamera();  
    video.play();  

    hands = new mpHands.Hands({   
        minDetectionConfidence: 0.7,   
        minTrackingConfidence: 0.5   
    });  

    canvas.width = video.videoWidth;  
    canvas.height = video.videoHeight;  

    function detectHands() {  
        context.drawImage(video, 0, 0, canvas.width, canvas.height);  

        // Obtener la imagen del canvas para procesarla  
        const image = cv.imread(canvas);  
        const results = hands.process(image);  

        if (results.multiHandLandmarks) {  
            results.multiHandLandmarks.forEach((hand) => {  
                const count = countFingers(hand);  
                fingerCountDisplay.innerText = `Dedos levantados: ${count}`;  
            });  
        }  

        image.delete(); // Limpiar memoria  
        requestAnimationFrame(detectHands);  
    }  

    detectHands();  
}  

video.addEventListener('loadeddata', main);
