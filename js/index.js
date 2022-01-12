const getCanvas = () => document.getElementById("my-canvas");
const get2DContext = () => getCanvas().getContext("2d");
const cellSize = 50;
const [colorRed, colorGreen, colorBlue] = [
  [255, 0, 0],
  [200, 255, 200],
  [0, 0, 255],
];

const draw = (state) => {
  const context = get2DContext();
  const image = state.internal.image();

  const width = image.width;
  const height = image.height;

  const cells = image.cells();

  // we flat the rgb tuple into a fat array, this steps build the original colors
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 3;
      const color = `rgb(${cells[index + 0]}, ${cells[index + 1]}, ${
        cells[index + 2]
      })`;
      context.fillStyle = color;
      context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  for (let x = 0; x <= width; x++) {
    context.beginPath();
    context.moveTo(x * cellSize, 0);
    context.lineTo(x * cellSize, height * cellSize);
    context.stroke();
  }

  for (let y = 0; y <= height; y++) {
    context.beginPath();
    context.moveTo(0, y * cellSize);
    context.lineTo(width * cellSize, y * cellSize);
    context.stroke();
  }
};

const setupCanvas = (state) => {
  const image  = state.internal.image();
  const canvas = getCanvas();
  canvas.addEventListener("click", (event) => {
    console.log(event);
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    console.log("(x, y) = ", x, y);

    console.log(state);
    state.internal.brush(x, y, state.currentColor);
    draw(state);
  });

  canvas.addEventListener("mousedown", (event) => {
    state.dragging = true;
  });
  canvas.addEventListener("mouseup", (event) => {
    state.dragging = false;
  });
  canvas.addEventListener("mousemove", (event) => {
    if (!state.dragging) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    state.internal.brush(x, y, state.currentColor);
    draw(state);
  });

  document.getElementById("red").addEventListener("click", (event) => {
    state.currentColor = colorRed;
    console.log(state);
  });
  document.getElementById("green").addEventListener("click", (event) => {
    state.currentColor = colorGreen;
    console.log(state);
  });
  document.getElementById("blue").addEventListener("click", (event) => {
    state.currentColor = colorBlue;
    console.log(state);
  });
};

async function main() {
  const lib = await import("../pkg/index.js");
  console.log(lib);
  const internalState = lib.InternalState.new(10, 10);
  const state = {
    internal: internalState,
    currentColor: [200, 255, 200],
  };
  draw(state);
  setupCanvas(state);
}

main().catch(console.error);
