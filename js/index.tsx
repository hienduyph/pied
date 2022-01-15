import React, { useState, useRef } from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect } from "react-konva";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

import { InternalState } from "../pkg";

const cellSize = 50;
const [colorRed, colorGreen, colorBlue] = [
  [255, 0, 0],
  [200, 255, 200],
  [0, 0, 255],
];

const state = { dragging: false };

function App() {
  const [internalState, setInternalState] = useState(InternalState.new(10, 10));
  const [currentColor, setCurrentColor] = useState(colorGreen);
  const shapeRef = useRef();

  const sceneFunc = (context, shape) => {
    const image = internalState.image();
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
    context.fillStrokeShape(shape);
  };

  const undo = () => {
    internalState.undo();
    setInternalState(internalState.copy());
  };

  const redo = () => {
    internalState.redo();
    setInternalState(internalState.copy());
  };

  const canvasClick = (reactEvent) => {
    const event = reactEvent.evt;
    const rect = shapeRef.current.getClientRect({
      skipTransform: true,
      skipStroke: true,
    });
    let x = event.clientX - rect.x;
    let y = event.clientY - rect.y;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    console.log("(x, y) = ", x, y);

    internalState.brush(x, y, currentColor);
    setInternalState(internalState.copy());
  };

  const canvasMousedown = (_) => {
    state.dragging = true;
    console.log("Mouse Down", state.dragging);
  };
  const canvasMouseup = (_) => {
    state.dragging = false;
    console.log("Mouse up", state.dragging);
  };
  const canvasMousemove = (reactEvent) => {
    if (!state.dragging) {
      return;
    }

    const event = reactEvent.evt;
    const rect = shapeRef.current.getClientRect({
      skipTransform: true,
      skipStroke: true,
    });
    let x = event.clientX - rect.x;
    let y = event.clientY - rect.y;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    internalState.brush(x, y, currentColor);
    setInternalState(internalState.copy());
  };

  return (
    <div>
      <Stage width={500} height={500} onClick={canvasClick}>
        <Layer>
          <Rect
            ref={shapeRef}
            sceneFunc={sceneFunc}
            fill="#00D2FF"
            stroke="black"
            strokeWidth={4}
            onMouseDown={canvasMousedown}
            onMouseUp={canvasMouseup}
            onMouseMove={canvasMousemove}
          />
        </Layer>
      </Stage>
      <div>
        <Button variant="danger" onClick={() => setCurrentColor(colorRed)}>
          Red
        </Button>
        <Button variant="success" onClick={() => setCurrentColor(colorGreen)}>
          Green
        </Button>
        <Button variant="primary" onClick={() => setCurrentColor(colorBlue)}>
          Blue
        </Button>

        <Button variant="secondary" onClick={undo}>
          Undo
        </Button>
        <Button variant="info" onClick={redo}>
          Redo
        </Button>
      </div>
    </div>
  );
}

render(<App />, document.querySelector("#root"));
