// ====== Configuration ======
const LAYER_SIZES = [4, 6, 6, 5, 3]; // input -> hidden layers -> output
const MAX_FANOUT = 3; // how many connections a firing neuron can trigger per layer transition
const ACTIVATION_DECAY = 0.94; // how fast a neuron's glow fades
const WAVE_INTERVAL_MS = 2200; // auto-trigger a new wave every N ms (if running)

// ====== Canvas setup ======
const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  width = rect.width;
  height = rect.height;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  layoutNetwork();
}

// ====== Network data structures ======
let neurons = []; // neurons[layer][index] = { x, y, activation }
let weights = []; // weights[layer][i][j] = connection weight from layer i-th neuron to layer+1 j-th neuron
let pulses = []; // active signals traveling along connections

function buildNetwork() {
  neurons = LAYER_SIZES.map((count) =>
    Array.from({ length: count }, () => ({ x: 0, y: 0, activation: 0 }))
  );

  weights = [];
  for (let l = 0; l < LAYER_SIZES.length - 1; l++) {
    const layerWeights = [];
    for (let i = 0; i < LAYER_SIZES[l]; i++) {
      const row = [];
      for (let j = 0; j < LAYER_SIZES[l + 1]; j++) {
        row.push(+(Math.random() * 2 - 1).toFixed(2)); // weight in [-1, 1]
      }
      layerWeights.push(row);
    }
    weights.push(layerWeights);
  }

  pulses = [];
  layoutNetwork();
}

function layoutNetwork() {
  const numLayers = LAYER_SIZES.length;
  const xPad = 50;
  const xStep = (width - xPad * 2) / (numLayers - 1);

  for (let l = 0; l < numLayers; l++) {
    const count = LAYER_SIZES[l];
    const yStep = height / (count + 1);
    for (let n = 0; n < count; n++) {
      neurons[l][n].x = xPad + l * xStep;
      neurons[l][n].y = (n + 1) * yStep;
    }
  }
}

// ====== Pulse / wave logic ======
function triggerWave() {
  // Activate every input neuron and spawn pulses toward layer 1
  for (let n = 0; n < neurons[0].length; n++) {
    neurons[0][n].activation = 1;
    spawnPulsesFrom(0, n);
  }
  passCount++;
  passCountEl.textContent = passCount;
}

function spawnPulsesFrom(layerIdx, neuronIdx) {
  if (layerIdx >= LAYER_SIZES.length - 1) return; // output layer, nothing to spawn

  const outWeights = weights[layerIdx][neuronIdx];

  // Pick the top connections by absolute weight (limited fanout for visual clarity)
  const ranked = outWeights
    .map((w, j) => ({ j, w }))
    .sort((a, b) => Math.abs(b.w) - Math.abs(a.w))
    .slice(0, MAX_FANOUT);

  ranked.forEach(({ j, w }) => {
    pulses.push({
      fromLayer: layerIdx,
      fromIndex: neuronIdx,
      toLayer: layerIdx + 1,
      toIndex: j,
      progress: 0,
      weight: w,
    });
  });
}

// ====== Animation loop ======
let running = true;
let speed = 1;
let passCount = 0;
let lastTime = performance.now();
let lastWaveTime = 0;

const passCountEl = document.getElementById("passCount");
const activeCountEl = document.getElementById("activeCount");

function update(dt) {
  // Decay all activations
  for (const layer of neurons) {
    for (const neuron of layer) {
      neuron.activation *= ACTIVATION_DECAY;
    }
  }

  // Move pulses along their connections
  const finished = [];
  for (const pulse of pulses) {
    pulse.progress += dt * 0.0009 * speed; // speed of travel
    if (pulse.progress >= 1) {
      finished.push(pulse);
    }
  }

  // Handle pulses that reached their destination neuron
  for (const pulse of finished) {
    const target = neurons[pulse.toLayer][pulse.toIndex];
    target.activation = Math.min(1, target.activation + Math.abs(pulse.weight));
    spawnPulsesFrom(pulse.toLayer, pulse.toIndex);
  }

  // Remove finished pulses
  pulses = pulses.filter((p) => p.progress < 1);

  activeCountEl.textContent = pulses.length;

  // Auto-trigger new waves periodically while running
  lastWaveTime += dt;
  if (lastWaveTime > WAVE_INTERVAL_MS) {
    triggerWave();
    lastWaveTime = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // Draw connections
  for (let l = 0; l < weights.length; l++) {
    for (let i = 0; i < weights[l].length; i++) {
      for (let j = 0; j < weights[l][i].length; j++) {
        const w = weights[l][i][j];
        const from = neurons[l][i];
        const to = neurons[l + 1][j];

        const alpha = 0.08 + Math.abs(w) * 0.25;
        ctx.strokeStyle =
          w >= 0
            ? `rgba(96, 165, 250, ${alpha})`
            : `rgba(244, 114, 182, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }

  // Draw pulses (traveling signals)
  for (const pulse of pulses) {
    const from = neurons[pulse.fromLayer][pulse.fromIndex];
    const to = neurons[pulse.toLayer][pulse.toIndex];
    const x = from.x + (to.x - from.x) * pulse.progress;
    const y = from.y + (to.y - from.y) * pulse.progress;

    const color = pulse.weight >= 0 ? "#60a5fa" : "#f472b6";
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw neurons
  for (let l = 0; l < neurons.length; l++) {
    for (const neuron of neurons[l]) {
      const baseRadius = 10;
      const radius = baseRadius + neuron.activation * 6;

      // Glow when active
      if (neuron.activation > 0.05) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(56, 189, 248, ${neuron.activation * 0.35})`;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 20 * neuron.activation;
        ctx.arc(neuron.x, neuron.y, radius + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Core circle
      ctx.beginPath();
      const lit = neuron.activation > 0.05;
      ctx.fillStyle = lit
        ? `rgba(${56 + neuron.activation * 100}, ${189}, ${248}, 1)`
        : "#1e293b";
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.arc(neuron.x, neuron.y, baseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function loop(now) {
  const dt = now - lastTime;
  lastTime = now;

  if (running) {
    update(dt);
  }
  draw();

  requestAnimationFrame(loop);
}

// ====== Controls ======
const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const playPauseText = document.getElementById("playPauseText");
const waveBtn = document.getElementById("waveBtn");
const regenBtn = document.getElementById("regenBtn");
const speedSlider = document.getElementById("speedSlider");

playPauseBtn.addEventListener("click", () => {
  running = !running;
  playIcon.style.display = running ? "none" : "block";
  pauseIcon.style.display = running ? "block" : "none";
  playPauseText.textContent = running ? "Pause" : "Play";
});

waveBtn.addEventListener("click", () => {
  triggerWave();
  lastWaveTime = 0;
});

regenBtn.addEventListener("click", () => {
  passCount = 0;
  passCountEl.textContent = passCount;
  buildNetwork();
});

speedSlider.addEventListener("input", (e) => {
  speed = parseFloat(e.target.value);
});

// ====== Init ======
window.addEventListener("resize", resizeCanvas);
buildNetwork();
resizeCanvas();
triggerWave();
requestAnimationFrame((t) => {
  lastTime = t;
  requestAnimationFrame(loop);
});
