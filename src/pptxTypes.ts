// pptxTypes.ts
export interface TextElement {
    text: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    color?: string;
    left: number;
    top: number;
    textAlign?: "left" | "center" | "right";
  }
  
  export interface Shape {
    left: number;
    top: number;
    width: number;
    height: number;
    color: string;
  }
  
  export interface Image {
    src: string;
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
  }
  
  export interface SlideData {
    textElements: TextElement[];
    shapes?: Shape[];
    images?: Image[];
  }
  