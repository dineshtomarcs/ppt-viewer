// src/services/pptxParser.ts
import JSZip from "jszip";

export interface SlideElement {
  type: string;
  text?: string;
  position: { left: number; top: number };
}

export interface SlideData {
  elements: SlideElement[];
}

export async function parsePptxFile(file: File): Promise<SlideData[]> {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files).filter((fileName) =>
    fileName.startsWith("ppt/slides/slide")
  );

  const slides: SlideData[] = [];

  for (const slideFile of slideFiles) {
    const slideXml = await zip.file(slideFile)?.async("text");
    if (slideXml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXml, "application/xml");

      // Extract text elements
      const textElements = xmlDoc.getElementsByTagName("a:t");
      const slideElements: SlideElement[] = Array.from(textElements).map((el) => ({
        type: "text",
        text: el.textContent || "",
        position: { left: 100, top: 100 }, // Placeholder positioning
      }));

      slides.push({ elements: slideElements });
    }
  }

  return slides;
}
