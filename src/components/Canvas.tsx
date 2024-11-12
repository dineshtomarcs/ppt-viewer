import React, { useEffect } from "react";
import * as fabric from "fabric";

interface TextElement {
  text: string;
  left: number;
  top: number;
  fontSize: number;
  color: string;
  bold: boolean;
}

interface ImageElement {
  src: string; // Base64 encoded or URL of the image
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CanvasProps {
  textElements: TextElement[];
  imageElements: ImageElement[];
}

const Canvas: React.FC<CanvasProps> = ({ textElements, imageElements }) => {
  useEffect(() => {
    const canvas = new fabric.Canvas("pptxCanvas", {
      width: 1024, // Adjust according to your desired slide dimensions
      height: 768,
    });

    // Render text elements
    textElements.forEach((element) => {
      const text = new fabric.Text(element.text, {
        left: element.left,
        top: element.top,
        fontSize: element.fontSize,
        fill: element.color,
        fontWeight: element.bold ? "bold" : "normal",
        originX: "left",
        originY: "top",
      });
      canvas.add(text);
    });

    // Render image elements
    imageElements.forEach((element) => {
      // Check if image source is a valid base64 or URL
      fabric.Image.fromURL(element.src, (img) => {
        img.set({
          left: element.left,
          top: element.top,
          scaleX: element.width / img.width!, // Scale image to match specified width
          scaleY: element.height / img.height!, // Scale image to match specified height
          originX: "left",
          originY: "top",
        });
        canvas.add(img);
      });
    });

    return () => {
      canvas.dispose();
    };
  }, [textElements, imageElements]);

  return <canvas id="pptxCanvas" />;
};

export default Canvas;
