const G = 9.8;
const SCALE = 5;

let canvas = null;
let ctx = null;
let groundLevel = 0;

let velocitySlider = null;
let angleSlider = null;
let velocityValueSpan = null;
let angleValueSpan = null;
let actionButton = null;

let xmaxOutput = null;
let ymaxOutput = null;
let ttotalOutput = null;

let v0 = 10; // Diubah dari 1 ke 10
let angleDeg = 15; // Diubah dari 1 ke 15
let angleRad = angleDeg * (Math.PI / 180);

let t = 0;
let isRunning = false;
let animationFrameId = null;

let maxReachedX = 0;
let maxReachedY = 0;
let totalTime = 0;

function getPosition(time) {
    const vx = v0 * Math.cos(angleRad);
    const vy0 = v0 * Math.sin(angleRad);
    const x = vx * time;
    const y = vy0 * time - 0.5 * G * time * time;
    return { x: x, y: y };
}

function calculateTheoreticalResults() {
    const v0_sq = v0 * v0;
    const sin2theta = Math.sin(2 * angleRad);
    const sinTheta_sq = Math.pow(Math.sin(angleRad), 2);

    const R = (v0_sq * sin2theta) / G; 
    const H = (v0_sq * sinTheta_sq) / (2 * G); 
    const T = (2 * v0 * Math.sin(angleRad)) / G; 

    if (xmaxOutput) xmaxOutput.textContent = R.toFixed(2);
    if (ymaxOutput) ymaxOutput.textContent = H.toFixed(2);
    if (ttotalOutput) ttotalOutput.textContent = T.toFixed(2);

    maxReachedX = R;
    maxReachedY = H;
    totalTime = T;
}

function draw() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(canvas.width, groundLevel);
    ctx.strokeStyle = 'lightgrey';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, groundLevel);
    ctx.strokeStyle = 'lightgrey';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#ff9800'; 
    ctx.setLineDash([5, 5]); 

    if (isFinite(totalTime) && totalTime > 0) {
        for (let currentT = 0; currentT < totalTime; currentT += 0.1) {
        const pos = getPosition(currentT);
        const canvasX = pos.x * SCALE;
        const canvasY = groundLevel - (pos.y * SCALE);

        if (currentT === 0) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
        }
    }
    ctx.stroke();
    ctx.setLineDash([]); 

    if (isRunning) {
        const pos = getPosition(t);
        const canvasX = pos.x * SCALE;
        const canvasY = groundLevel - (pos.y * SCALE);
        
        if (pos.y <= 0 && t > 0) {
            isRunning = false;
            cancelAnimationFrame(animationFrameId);
            if (actionButton) {
                actionButton.textContent = 'Mulai Simulasi';
                actionButton.style.backgroundColor = 'var(--primary-color)';
                actionButton.disabled = false;
            }
            updateParametersFromInput();
            calculateTheoreticalResults();
            draw();
            return;
        }

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 7, 0, Math.PI * 2); 
        ctx.fillStyle = '#ff3366'; 
        ctx.fill();

        t += 0.05; 
    }
}

function animateLoop() {
    draw();
    if (isRunning) {
        animationFrameId = requestAnimationFrame(animateLoop);
    }
}

function stopSimulationAndResetUI() {
    cancelAnimationFrame(animationFrameId);
    isRunning = false;
    
    t = 0;
    
    if (actionButton) {
        actionButton.textContent = 'Mulai Simulasi'; 
        actionButton.style.backgroundColor = 'var(--primary-color)';
        actionButton.disabled = false;
    }
    
    updateParametersFromInput(); 
    calculateTheoreticalResults();
    draw(); 
}

function handleActionButton() {
    if (isRunning) {
        stopSimulationAndResetUI();
    } else {
        updateParametersFromInput();
        
        isRunning = true;
        actionButton.textContent = 'Stop'; 
        actionButton.style.backgroundColor = '#dc3545';
        
        t = 0; 
        calculateTheoreticalResults();
        animateLoop();
    }
}

function updateParametersFromInput() {
    if (velocitySlider) v0 = parseFloat(velocitySlider.value) || v0;
    if (angleSlider) angleDeg = parseFloat(angleSlider.value) || angleDeg;

    if (velocityValueSpan) velocityValueSpan.textContent = v0.toFixed(0) + ' m/s';
    if (angleValueSpan) angleValueSpan.textContent = angleDeg.toFixed(0) + ' \u00B0';
    
    angleRad = angleDeg * (Math.PI / 180);
}

function init() {
    canvas = document.getElementById('parabolaCanvas');
    if (!canvas) {
        console.error('Canvas #parabolaCanvas not found — aborting init');
        return;
    }
    ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth || canvas.width;
    canvas.height = canvas.clientHeight || canvas.height;
    groundLevel = canvas.height;

    velocitySlider = document.getElementById('velocity');
    angleSlider = document.getElementById('angle');
    velocityValueSpan = document.getElementById('velocityValue');
    angleValueSpan = document.getElementById('angleValue');
    actionButton = document.getElementById('startButton');

    xmaxOutput = document.getElementById('xmax_output');
    ymaxOutput = document.getElementById('ymax_output');
    ttotalOutput = document.getElementById('ttotal_output');

    if (actionButton) actionButton.addEventListener('click', handleActionButton);

    if (velocitySlider) {
        velocitySlider.addEventListener('input', () => {
            if (velocityValueSpan) velocityValueSpan.textContent = velocitySlider.value + ' m/s';
            stopSimulationAndResetUI();
        });
    }

    if (angleSlider) {
        angleSlider.addEventListener('input', () => {
            if (angleValueSpan) angleValueSpan.textContent = angleSlider.value + ' \u00B0';
            stopSimulationAndResetUI();
        });
    }

    if (velocitySlider) v0 = parseFloat(velocitySlider.value) || v0;
    if (angleSlider) angleDeg = parseFloat(angleSlider.value) || angleDeg;
    angleRad = angleDeg * (Math.PI / 180);

    stopSimulationAndResetUI();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}