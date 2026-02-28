import React, { useState } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

export default function ImageSlider({ images = [] }) {
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images.length) return null;

  return (
    <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg">
        <img
          src={images[currentImage]}
          alt={`product-${currentImage}`}
          className="w-full h-full object-cover object-center"
        />

        {/* Left Arrow */}
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-2 sm:left-3 md:left-4 -translate-y-1/2 bg-black/40 text-white p-2 sm:p-3 md:p-4 rounded-full hover:bg-black/60 transition"
        >
          <AiOutlineLeft size={20} className="sm:text-[24px] md:text-[28px]" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-2 sm:right-3 md:right-4 -translate-y-1/2 bg-black/40 text-white p-2 sm:p-3 md:p-4 rounded-full hover:bg-black/60 transition"
        >
          <AiOutlineRight size={20} className="sm:text-[24px] md:text-[28px]" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-3 justify-center overflow-x-auto">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`flex-shrink-0 border-2 rounded-lg overflow-hidden ${
              currentImage === index ? "border-red-500" : "border-transparent"
            }`}
          >
            <img
              src={img}
              alt={`thumb-${index}`}
              className="w-16 h-16 object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
