# Neural Network Visualizer

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

An interactive visualization of signal propagation through a multi-layer neural network, built with vanilla HTML, CSS, and JavaScript using the Canvas API. The project does not use any machine learning libraries — it is a pure front-end visualization of how activations and weighted connections behave in a network.

## Live Demo

*(Add your GitHub Pages link here after deploying)*

## Features

- Five-layer network (4-6-6-5-3 neurons) rendered on canvas
- Animated signal pulses traveling along weighted connections
- Neurons glow when activated, with brightness reflecting activation strength
- Connections are color-coded: blue for positive weights, pink for negative weights
- "New Network" control regenerates random weights and resets the visualization
- Play/Pause control and adjustable animation speed
- Live stats panel showing forward passes triggered and active signals
- Fully responsive layout

## Tech Stack

- HTML5 (Canvas API)
- CSS3 (gradients, glassmorphism, glow effects)
- Vanilla JavaScript

## Getting Started

1. Clone this repository
   ```bash
   git clone https://github.com/AliyaThabasum01/neural-network-visualizer.git
   ```
2. Open `index.html` in a browser. No build steps are required.

## Project Structure

```
neural-network-visualizer/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How It Works

Each forward pass activates the input layer neurons, which send signals along their strongest-weighted connections to the next layer. When a signal reaches a neuron, the neuron lights up and fires its own outgoing signals, creating a cascading animation that loosely mirrors how activations propagate through a real neural network.

## Future Improvements

- Adjustable network architecture (custom layer sizes via UI)
- Toggle between forward pass and backpropagation visualization
- Click a neuron to inspect its connections and weights
- Export network state as JSON

## Author

**Aliya Thabasum S**
GitHub: [AliyaThabasum01](https://github.com/AliyaThabasum01)
LinkedIn: [Aliya Thabasum](https://linkedin.com/in/aliya-thabasum-25097a395)
