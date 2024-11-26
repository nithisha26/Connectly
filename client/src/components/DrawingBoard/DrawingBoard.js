import React, { useRef, useEffect, useState } from "react";
import "./DrawingBoard.css";

const DrawingBoard = ({ socket, room }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(5);

  // Setup canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushWidth;
    ctxRef.current = ctx;
  }, []);

  // Listen for drawing events from the server
  useEffect(() => {
    if (!socket) return;

    socket.on("drawing-data", ({ x0, y0, x1, y1, color, brushWidth }) => {
      const ctx = ctxRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushWidth;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.closePath();
    });

    return () => {
      socket.off("drawing-data");
    };
  }, [socket]);

  // Emit drawing data
  const draw = (x0, y0, x1, y1) => {
    if (!socket) return;

    socket.emit("drawing", { x0, y0, x1, y1, color, brushWidth, room });
    const ctx = ctxRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushWidth;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  };

  // Mouse events
  const handleMouseDown = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lastX = offsetX; // Initialize the last position
    ctxRef.current.lastY = offsetY; // Initialize the last position
  };
  
  const handleMouseMove = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent; // Correctly access offsetX and offsetY
    draw(ctxRef.current.lastX || offsetX, ctxRef.current.lastY || offsetY, offsetX, offsetY);
  
    // Save the current position for the next movement
    ctxRef.current.lastX = offsetX;
    ctxRef.current.lastY = offsetY;
  };
  
  const handleMouseUp = () => {
    setDrawing(false);
    ctxRef.current.lastX = null;
    ctxRef.current.lastY = null; // Reset last position after drawing ends
  };
  

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Notify others to clear their canvas
    socket.emit("clear-canvas", room);
  };

  // Listen for "clear canvas" event
  useEffect(() => {
    if (!socket) return;

    socket.on("clear-canvas", () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("clear-canvas");
    };
  }, [socket]);

  return (
    <div className="drawing-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
      ></canvas>
      <div className="controls">
        <label>
          Brush Color: 
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <label>
          Brush Width: 
          <input
            type="range"
            min="1"
            max="50"
            value={brushWidth}
            onChange={(e) => setBrushWidth(e.target.value)}
          />
        </label>
        <button className="clear-button" onClick={clearCanvas}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default DrawingBoard;
