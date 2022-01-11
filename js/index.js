const draw = (img) => {
  const canvas = document.getElementById("my-canvas");
  const context = canvas.getContext("2d");

  // context.fillStyle  = "red";
  // context.fillRect(0, 0, 50, 50);
  const width = img.width;
  const height = img.height;
  const cellSize = 50;
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

async function main() {
  const lib = await import("../pkg/index.js");
  console.log(lib);
  const img = new lib.Image(10, 10);
  draw(img);
}

main().catch(console.error);
