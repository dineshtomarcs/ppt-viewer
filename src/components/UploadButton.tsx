// src/components/UploadButton.tsx
import React, { ChangeEvent } from "react";

interface UploadButtonProps {
  onUpload: (file: File) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
  };

  return <input type="file" accept=".pptx" onChange={handleFileChange} />;
};

export default UploadButton;
