// Konstanta Fisika
const G = 9.8; // Percepatan gravitasi (m/s^2)

// --- Variabel DOM ---
let canvas = null;
let ctx = null;

let massSlider = null;
let forceSlider = null;
let frictionCoeffSlider = null;
let massValueSpan = null;
let forceValueSpan = null;
let frictionCoeffValueSpan = null;
let actionButton = null;

let frictionForceOutput = null;
let netForceOutput = null;
let accelerationOutput = null;
let timeOutput = null;
let velocityOutput = null;
let positionOutput = null;

// --- Variabel Fisika & Animasi ---
let mass = 1; // Diubah dari 10 ke 1
let appliedForce = 1; // Diubah dari 50 ke 10
let mu_k = 0; // Diubah dari 0.15 ke 0.05

let F_gesek = 0;
let F_net = 0;
let acceleration = 0;

let t = 0;      // Waktu (s)
let v = 0;      // Kecepatan (m/s)
let x = 0;      // Posisi (m)

let isRunning = false;
let animationFrameId = null;
let startTime = 0;

// --- Variabel Skala dan Visualisasi ---
const BOX_SIZE = 50; // Ukuran kotak dalam piksel
const GROUND_HEIGHT = 50; // Tinggi tanah/lantai
let scaleX = 20; // 20 piksel per meter
let maxPos = 0;

// Variabel untuk simulasi
let boxX = 150; // Diubah dari 1500 ke 150
let boxY = 0; // Akan diset di init()

// --- FUNGSI PERHITUNGAN FISIKA ---

function calculateForcesAndAcceleration() {
    // Gaya Normal (N) = Gaya Gravitasi (W) karena bidang datar
    const N = mass * G;

    // Gaya Gesek Kinetis (F_gesek)
    F_gesek = mu_k * N;

    // Gaya Netto (F_net)
    if (appliedForce > F_gesek) {
        F_net = appliedForce - F_gesek;
    } else {
        // Jika gaya dorong lebih kecil atau sama dengan gaya gesek
        // dan objek belum bergerak (a=0), gaya netto 0.
        // Jika sudah bergerak, tapi F_dorong < F_gesek, F_net akan negatif,
        // yang berarti objek sedang melambat.
        if (v > 0) {
             F_net = appliedForce - F_gesek;
        } else {
             F_net = 0;
             F_gesek = appliedForce; // Gaya gesek statis max = F_dorong untuk menahan objek
        }
    }
    
    // Percepatan (a = F_net / m)
    acceleration = F_net / mass;

    // Update UI Teoritis
    if (frictionForceOutput) frictionForceOutput.textContent = F_gesek.toFixed(2);
    if (netForceOutput) netForceOutput.textContent = F_net.toFixed(2);
    if (accelerationOutput) accelerationOutput.textContent = acceleration.toFixed(2);
}

// --- FUNGSI VISUALISASI ---

function drawBox(canvasX) {
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(canvasX, boxY, BOX_SIZE, BOX_SIZE);
    
    // Border kotak
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvasX, boxY, BOX_SIZE, BOX_SIZE);
    
    // Label massa di dalam kotak
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(mass + ' kg', canvasX + BOX_SIZE/2, boxY + BOX_SIZE/2 + 6);
}

function drawArrow(ctx, fromX, fromY, toX, toY, headSize) {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headSize * Math.cos(angle - Math.PI / 6), toY - headSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headSize * Math.cos(angle + Math.PI / 6), toY - headSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
}

function draw(currentX) {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar lantai/tanah
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

    // Posisi kotak di Canvas
    const startX = 150; // Mulai dari 150px dari kiri
    const canvasX = startX + currentX * scaleX;
    
    drawBox(canvasX);

    // Gambar panah gaya dorong (merah)
    if (appliedForce > 0) {
        const arrowLength = Math.min(appliedForce * 2, 150); // Skala panah
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 3;
        drawArrow(ctx, canvasX + BOX_SIZE, boxY + BOX_SIZE/2, canvasX + BOX_SIZE + arrowLength, boxY + BOX_SIZE/2, 10);
        
        // Label gaya dorong
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('F_dorong: ' + appliedForce + ' N', canvasX + BOX_SIZE + arrowLength + 10, boxY + BOX_SIZE/2);
    }

    // Gambar panah gaya gesek (biru, ke kiri)
    if (F_gesek > 0 && v > 0) {
        const frictionArrowLength = Math.min(F_gesek * 2, 100);
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;
        drawArrow(ctx, canvasX, boxY + BOX_SIZE/2, canvasX - frictionArrowLength, boxY + BOX_SIZE/2, 10);
        
        // Label gaya gesek
        ctx.fillStyle = '#2196F3';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('F_gesek: ' + F_gesek.toFixed(1) + ' N', canvasX - frictionArrowLength - 10, boxY + BOX_SIZE/2 - 10);
    }
}

// --- FUNGSI SIMULASI DAN UI ---

function updatePhysics(deltaTime) {
    // v = v0 + a*t
    let newV = v + acceleration * deltaTime;

    // Jika objek melambat dan kecepatan menjadi negatif, hentikan objek
    if (newV < 0 && F_net < 0) {
        newV = 0;
        F_net = 0; // Gaya netto diatur ulang
        acceleration = 0;
    }
    
    // x = x0 + v_avg * t
    let newX = x + ((v + newV) / 2) * deltaTime;

    v = newV;
    x = newX;
}

let lastTimestamp = 0;

function animateLoop(timestamp) {
    if (!isRunning) return;

    if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
    }
    const deltaTime = (timestamp - lastTimestamp) / 1000; // Delta waktu dalam detik
    lastTimestamp = timestamp;
    
    t += deltaTime;

    // Hitung ulang gaya dan percepatan di setiap langkah (penting untuk F_gesek statis/kinetis)
    calculateForcesAndAcceleration(); 
    
    // Update fisika
    updatePhysics(deltaTime);

    // Update UI real-time
    if (timeOutput) timeOutput.textContent = t.toFixed(2);
    if (velocityOutput) velocityOutput.textContent = v.toFixed(2);
    if (positionOutput) positionOutput.textContent = x.toFixed(2);

    // Visualisasi
    draw(x);
    
    // Kondisi berhenti: jika percepatan 0 dan kecepatan 0 (objek berhenti)
    if (Math.abs(acceleration) < 1e-3 && Math.abs(v) < 1e-3 && t > 0.1) {
        stopSimulationAndResetUI(true);
        return;
    }

    // Jika objek sudah bergerak jauh keluar batas, hentikan (agar tidak membebani)
    if (x * scaleX > canvas.width * 2) {
        stopSimulationAndResetUI(true);
        return;
    }

    animationFrameId = requestAnimationFrame(animateLoop);
}

function stopSimulationAndResetUI(finished = false) {
    cancelAnimationFrame(animationFrameId);
    isRunning = false;
    
    if (!finished) {
        // Reset variabel jika di-stop, bukan selesai
        t = 0;
        v = 0;
        x = 0;
        lastTimestamp = 0;
    }

    updateParametersFromInput();
    calculateForcesAndAcceleration(); // Hitung F_net & a awal
    draw(x); 

    // Update UI
    if (timeOutput) timeOutput.textContent = t.toFixed(2);
    if (velocityOutput) velocityOutput.textContent = v.toFixed(2);
    if (positionOutput) positionOutput.textContent = x.toFixed(2);

    if (actionButton) {
        actionButton.textContent = 'Mulai Simulasi'; 
        actionButton.style.backgroundColor = 'var(--success-color)';
        actionButton.disabled = false;
    }
}

function handleActionButton() {
    if (isRunning) {
        stopSimulationAndResetUI();
    } else {
        updateParametersFromInput();
        calculateForcesAndAcceleration();

        if (F_net <= 0 && v === 0) {
            console.warn("Gaya Dorong tidak cukup untuk mengatasi Gaya Gesek. F_net \u2264 0. Simulasi tidak dimulai.");
            alert("Gaya Dorong (" + appliedForce + " N) terlalu kecil untuk mengatasi Gaya Gesek (" + F_gesek.toFixed(2) + " N). Tingkatkan Gaya Dorong atau kurangi Koefisien Gesek.");
            return;
        }

        isRunning = true;
        actionButton.textContent = 'Stop'; 
        actionButton.style.backgroundColor = 'var(--stop-color)';
        
        // Reset waktu dan kecepatan sebelum start
        t = 0;
        v = 0;
        x = 0;
        lastTimestamp = 0; 
        
        animateLoop(performance.now());
    }
}

function updateParametersFromInput() {
    if (massSlider) {
        const m = parseFloat(massSlider.value);
        if (!isNaN(m)) mass = m;
    }
    if (forceSlider) {
        const f = parseFloat(forceSlider.value);
        if (!isNaN(f)) appliedForce = f;
    }
    if (frictionCoeffSlider) {
        const mu = parseFloat(frictionCoeffSlider.value);
        if (!isNaN(mu)) mu_k = mu / 100;
    }

    if (massValueSpan) massValueSpan.textContent = mass.toFixed(0) + ' kg';
    if (forceValueSpan) forceValueSpan.textContent = appliedForce.toFixed(0) + ' N';
    if (frictionCoeffValueSpan) frictionCoeffValueSpan.textContent = mu_k.toFixed(2);
}

function init() {
    // Inisialisasi DOM
    canvas = document.getElementById('newtonCanvas');
    if (!canvas) return; 
    ctx = canvas.getContext('2d');
    
    // Set dimensi awal canvas agar responsif
    const visualizationContainer = document.querySelector('#visualization');
    if (visualizationContainer) {
        canvas.width = visualizationContainer.clientWidth - 50; 
        canvas.height = Math.max(350, Math.floor(canvas.width / 1.7));
    }

    // Set posisi Y kotak setelah canvas height diketahui
    boxY = canvas.height - GROUND_HEIGHT - BOX_SIZE;

    massSlider = document.getElementById('mass');
    forceSlider = document.getElementById('appliedForce');
    frictionCoeffSlider = document.getElementById('frictionCoeff');
    massValueSpan = document.getElementById('massValue');
    forceValueSpan = document.getElementById('appliedForceValue');
    frictionCoeffValueSpan = document.getElementById('frictionCoeffValue');
    actionButton = document.getElementById('startButton');

    frictionForceOutput = document.getElementById('frictionForce_output');
    netForceOutput = document.getElementById('netForce_output');
    accelerationOutput = document.getElementById('acceleration_output');
    timeOutput = document.getElementById('time_output');
    velocityOutput = document.getElementById('velocity_output');
    positionOutput = document.getElementById('position_output');

    // Listener
    if (actionButton) actionButton.addEventListener('click', handleActionButton);

    const inputHandler = () => {
        stopSimulationAndResetUI(); 
    };

    if (massSlider) massSlider.addEventListener('input', inputHandler);
    if (forceSlider) forceSlider.addEventListener('input', inputHandler);
    if (frictionCoeffSlider) frictionCoeffSlider.addEventListener('input', inputHandler);
    
    window.addEventListener('resize', () => {
        stopSimulationAndResetUI(); 
    });

    // Setup Awal
    updateParametersFromInput(); 
    calculateForcesAndAcceleration(); 
    draw(x); 
}

// Implementasi fungsi alert kustom karena penggunaan alert() dilarang di lingkungan ini
function alert(message) {
    const existingModal = document.getElementById('customAlertModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'customAlertModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.6); display: flex;
        justify-content: center; align-items: center; z-index: 1000;
    `;
    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 25px; border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); max-width: 400px;
        text-align: center;
    `;
    const messageP = document.createElement('p');
    messageP.textContent = message;
    messageP.style.marginBottom = '20px';
    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.style.cssText = `
        padding: 10px 20px; background-color: var(--primary-color); 
        color: white; border: none; border-radius: 5px; cursor: pointer;
    `;
    closeButton.onclick = () => modal.remove();
    
    content.appendChild(messageP);
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
