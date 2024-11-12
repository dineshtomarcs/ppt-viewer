// src/components/SlideNavigator.tsx
import React from "react";

interface SlideNavigatorProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
}

const SlideNavigator: React.FC<SlideNavigatorProps> = ({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
}) => {
  return (
    <div>
      <button onClick={onPrevious} disabled={currentSlide === 0}>
        Previous
      </button>
      <span>
        Slide {currentSlide + 1} of {totalSlides}
      </span>
      <button onClick={onNext} disabled={currentSlide === totalSlides - 1}>
        Next
      </button>
    </div>
  );
};

export default SlideNavigator;
