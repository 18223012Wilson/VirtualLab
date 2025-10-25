(function(){
const canvas = document.getElementById('vectorCanvas');
if (!canvas) { console.error('vectorCanvas not found'); return; }
const ctx = canvas.getContext('2d');
if (!ctx) { console.error('2D context not available'); return; }

const resXEl = document.getElementById('resX');
const resYEl = document.getElementById('resY');
const resMagEl = document.getElementById('resMag');
const resAngleEl = document.getElementById('resAngle');

const xInput = document.getElementById('xCoord');
const yInput = document.getElementById('yCoord');
const colorInput = document.getElementById('color');
const addBtn = document.getElementById('addVectorBtn');
const clearBtn = document.getElementById('clearBtn');
const showGridCheckbox = document.getElementById('showGrid');

const vectorsListEl = document.getElementById('vectorsList');

console.log('Canvas:', canvas, 'Context:', ctx);
console.log('Inputs:', xInput, yInput, colorInput);
console.log('Buttons:', addBtn, clearBtn);

let DPR = window.devicePixelRatio || 1;

function resizeCanvas(){
    const container = document.querySelector('#visualization');
    if (!container) return;
    const w = Math.max(400, container.clientWidth - 40);
    const h = Math.max(360, container.clientHeight - 60);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w;
    canvas.height = h;
    console.log('Canvas resized to:', w, 'x', h);
    draw();
}

window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

function origin(){
    return { x: canvas.width / 2, y: canvas.height / 2 };
}

let vectors = [];

let idCounter = 1;

function addVectorFromControls(){
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);
    console.log('Adding vector:', x, y, colorInput.value);
    if (isNaN(x) || isNaN(y)) {
        alert('Masukkan koordinat X dan Y yang valid!');
        return;
    }
    vectors.push({ x: x, y: y, color: colorInput.value, id: idCounter++ });
    console.log('Vectors array:', vectors);
    rebuildList();
    draw();
}

function clearVectors(){
    vectors = [];
    rebuildList();
    draw();
}

if (addBtn) addBtn.addEventListener('click', addVectorFromControls);
if (clearBtn) clearBtn.addEventListener('click', clearVectors);

function drawGrid(){
    if (!showGridCheckbox || !showGridCheckbox.checked) return;
    const o = origin();
    const step = 25;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;

    for(let x = o.x % step; x < canvas.width; x += step){
        ctx.beginPath(); 
        ctx.moveTo(x, 0); 
        ctx.lineTo(x, canvas.height); 
        ctx.stroke();
    }

    for(let y = o.y % step; y < canvas.height; y += step){
        ctx.beginPath(); 
        ctx.moveTo(0, y); 
        ctx.lineTo(canvas.width, y); 
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;

    ctx.beginPath(); 
    ctx.moveTo(0, o.y); 
    ctx.lineTo(canvas.width, o.y); 
    ctx.stroke();

    ctx.beginPath(); 
    ctx.moveTo(o.x, 0); 
    ctx.lineTo(o.x, canvas.height); 
    ctx.stroke();

    ctx.fillStyle = '#fff'; 
    ctx.beginPath(); 
    ctx.arc(o.x, o.y, 4, 0, Math.PI*2); 
    ctx.fill();
    ctx.restore();
}

function drawArrow(x1, y1, x2, y2, color, width=3, head=10){
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head*Math.cos(angle - Math.PI/6), y2 - head*Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2 - head*Math.cos(angle + Math.PI/6), y2 - head*Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function draw(){
    const w = canvas.width;
    const h = canvas.height;
    console.log('Drawing... Canvas size:', w, 'x', h, 'Vectors:', vectors.length);
    
    ctx.clearRect(0, 0, w, h);
    drawGrid();
    const o = origin();

    vectors.forEach((v, idx) => {
        const x2 = o.x + v.x;
        const y2 = o.y - v.y;
        console.log(`Drawing vector ${idx}:`, v, 'to', x2, y2);
        drawArrow(o.x, o.y, x2, y2, v.color, 3, 10);
    
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.arc(x2, y2, 5, 0, Math.PI*2);
        ctx.fill();
    
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        const mag = Math.hypot(v.x, v.y);
        const ang = Math.atan2(v.y, v.x) * 180 / Math.PI;
        ctx.fillText(`${mag.toFixed(1)}px @ ${ang.toFixed(0)}°`, x2 + 8, y2 - 8);
    });

    if (vectors.length >= 2) {
        const R = resultant();
        const rx = o.x + R.x;
        const ry = o.y - R.y;
        drawArrow(o.x, o.y, rx, ry, '#00E676', 4, 12);
        ctx.fillStyle = '#00E676';
        ctx.beginPath(); 
        ctx.arc(rx, ry, 6, 0, Math.PI*2); 
        ctx.fill();
    
        ctx.font = 'bold 13px Arial';
        ctx.fillStyle = '#00E676';
        ctx.fillText(`R: ${R.mag.toFixed(1)}px`, rx + 10, ry - 10);
    }
}

function resultant(){
    let sx = 0, sy = 0;
    vectors.forEach(v => { sx += v.x; sy += v.y; });
    return { x: sx, y: sy, mag: Math.hypot(sx, sy), angle: Math.atan2(sy, sx) };
}

function toDeg(v){
    return (Math.atan2(v.y, v.x) * 180 / Math.PI);
}

function updateResultUI(){
    const R = resultant();
    if (resXEl) resXEl.textContent = R.x.toFixed(2);
    if (resYEl) resYEl.textContent = R.y.toFixed(2);
    if (resMagEl) resMagEl.textContent = R.mag.toFixed(2);
    let angDeg = R.angle * 180 / Math.PI;
    if (isNaN(angDeg)) angDeg = 0;
    if (resAngleEl) resAngleEl.textContent = angDeg.toFixed(2) + '°';
}

function rebuildList(){
    if (!vectorsListEl) return;
    vectorsListEl.innerHTML = '';
    vectors.forEach((v, idx) => {
        const el = document.createElement('div');
        el.className = 'vector-item';
        const left = document.createElement('div');
        left.style.display = 'flex'; 
        left.style.alignItems = 'center';
        const colorBox = document.createElement('span'); 
        colorBox.className='vector-color'; 
        colorBox.style.background = v.color;
        left.appendChild(colorBox);
        const txt = document.createElement('div');
        const mag = Math.hypot(v.x, v.y).toFixed(1);
        const ang = toDeg(v).toFixed(0);
        txt.innerHTML = `<strong>v${idx+1}</strong><div class="small">(${v.x.toFixed(1)}, ${v.y.toFixed(1)}) • ${mag}px • ${ang}°</div>`;
        left.appendChild(txt);
        const right = document.createElement('div');
        const del = document.createElement('button'); 
        del.textContent='Hapus'; 
        del.className='btn';
        del.style.padding='6px 10px'; 
        del.style.fontSize='0.85rem';
        del.style.background='linear-gradient(135deg,#F44336,#d32f2f)';
        del.onclick = ()=> { 
            vectors.splice(idx, 1); 
            rebuildList(); 
            draw(); 
        };
        right.appendChild(del);
        el.appendChild(left); 
        el.appendChild(right);
        vectorsListEl.appendChild(el);
    });
    updateResultUI();
}

let dragging = null;
canvas.addEventListener('pointerdown', (e)=>{
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    const o = origin();

    let found = null;
    for(let i = vectors.length - 1; i >= 0; i--){
        const v = vectors[i];
        const tx = o.x + v.x;
        const ty = o.y - v.y;
        const d = Math.hypot(tx - x, ty - y);
        if (d < 15) { 
            found = i; 
            break; 
        }
    }
    if (found !== null){
        dragging = { idx: found };
        canvas.setPointerCapture(e.pointerId);
    }
});

canvas.addEventListener('pointermove', (e)=>{
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    const o = origin();
    const vx = x - o.x;
    const vy = o.y - y;
    vectors[dragging.idx].x = vx;
    vectors[dragging.idx].y = vy;
    rebuildList();
    draw();
});

canvas.addEventListener('pointerup', (e)=>{
    if (dragging) {
        try { canvas.releasePointerCapture(e.pointerId); } catch(ex){ /* ignore */ }
        dragging = null;
    }
});

if (showGridCheckbox) {
    showGridCheckbox.addEventListener('change', draw);
}

rebuildList();
draw();

console.log('Vector lab initialized');

})();