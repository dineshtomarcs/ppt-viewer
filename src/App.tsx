import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import JSZip from "jszip";
import Canvas from "./components/Canvas";

interface TextElement {
  text: string;
  fontSize: number;
  left: number;
  top: number;
  color: string;
  bold: boolean;
}

interface ImageElement {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface SlideData {
  textElements: TextElement[];
  imageElements: ImageElement[];
}

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const slideData: SlideData[] = [];

    const slideFiles = Object.keys(loadedZip.files).filter((path) =>
      path.startsWith("ppt/slides/slide")
    );

    const imageFiles: { [key: string]: string } = {};
    const mediaFiles = Object.keys(loadedZip.files).filter((path) =>
      path.startsWith("ppt/media/")
    );

    // Load all media files as base64
    for (const mediaFile of mediaFiles) {
      const extension = mediaFile.split(".").pop();
      const mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/png";
      const base64Data = await loadedZip.files[mediaFile].async("base64");
      imageFiles[mediaFile] = `data:${mimeType};base64,${base64Data}`;
    }

    // Process each slide
    for (const slideFile of slideFiles) {
      const xmlContent = await loadedZip.files[slideFile].async("text");

      // Load slide relationships to map rId to media file path
      const relsPath = slideFile.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
      const relsContent = loadedZip.files[relsPath] ? await loadedZip.files[relsPath].async("text") : null;
      
      const rIdMap: { [key: string]: string } = {};
      if (relsContent) {
        const relsXml = new DOMParser().parseFromString(relsContent, "application/xml");
        const relationshipNodes = relsXml.getElementsByTagName("Relationship");
        
        for (let i = 0; i < relationshipNodes.length; i++) {
          const rId = relationshipNodes[i].getAttribute("Id");
          const target = relationshipNodes[i].getAttribute("Target");
          if (rId && target && target.startsWith("../media/")) {
            rIdMap[rId] = `ppt/media/${target.split("/").pop()}`;
          }
        }
      }

      slideData.push(parseSlide(xmlContent, imageFiles, rIdMap));
    }

    setSlides(slideData);
  };

  const parseSlide = (
    xmlContent: string,
    imageFiles: { [key: string]: string },
    rIdMap: { [key: string]: string }
  ): SlideData => {
    const textElements: TextElement[] = [];
    const imageElements: ImageElement[] = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

    // Parse text elements
    const textNodes = xmlDoc.getElementsByTagName("a:t");
    for (let i = 0; i < textNodes.length; i++) {
      const text = textNodes[i].textContent || "";
      textElements.push({
        text,
        fontSize: 20,
        left: 100 + i * 10,
        top: 100 + i * 30,
        color: "black",
        bold: false,
      });
    }

    // Parse image elements
    const imageNodes = xmlDoc.getElementsByTagName("a:blip");
    for (let i = 0; i < imageNodes.length; i++) {
      const embedAttr = imageNodes[i].getAttribute("r:embed");
      if (embedAttr && rIdMap[embedAttr]) {
        const imagePath = rIdMap[embedAttr];
        const imageSrc = imageFiles[imagePath];
        if (imageSrc) {
          imageElements.push({
            src: imageSrc,
            left: 150 + i * 50,
            top: 200 + i * 50,
            width: 100,
            height: 100,
          });
        } else {
          console.warn(`Image file ${imagePath} could not be found in loaded media files.`);
        }
      } else {
        console.warn(`No media file mapped for embedAttr ${embedAttr}`);
      }
    }

    return { textElements, imageElements };
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} style={{ border: "2px dashed gray", padding: "20px", cursor: "pointer" }}>
        <input {...getInputProps()} />
        <p>Drag and drop a PPTX file here, or click to select one</p>
      </div>
      {slides.length > 0 && (
        <div>
          <button onClick={() => setCurrentSlideIndex((current) => Math.max(current - 1, 0))}>Previous</button>
          <button onClick={() => setCurrentSlideIndex((current) => Math.min(current + 1, slides.length - 1))}>Next</button>
          <Canvas textElements={slides[currentSlideIndex].textElements} imageElements={slides[currentSlideIndex].imageElements} />
        </div>
      )}
    </div>
  );
};

export default App;
