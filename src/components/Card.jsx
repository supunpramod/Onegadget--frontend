import React from "react";
import { Link } from "react-router-dom";

export default function Card({
  productId,
  lastPrices, // current price
  images = [],
  productName,
  price, // old price
  stock, // නව අංගය: stock ප්‍රමාණය මෙතැනට එවන්න
}) {
  const firstImageUrl = images.length > 0 ? images[0] : null;

  const nowPriceNum = lastPrices ? Number(lastPrices) : null;
  const oldPriceNum = Number(price);

  const isSale = oldPriceNum && oldPriceNum > nowPriceNum;
  const isOutOfStock = stock <= 0; // Stock එක පරීක්ෂා කිරීම

  const discountPercentage = isSale
    ? Math.round(((oldPriceNum - nowPriceNum) / oldPriceNum) * 100)
    : 0;

  return (
    <Link to={isOutOfStock ? "#" : `/productoverview/${productId}`} className={isOutOfStock ? "cursor-not-allowed" : ""}>
      <div className={`max-w-xs mx-auto my-4 bg-white rounded-xl w-[300px] h-[480px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 relative ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : ""}`}>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 z-10 flex items-center justify-center pointer-events-none">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-black text-xl shadow-2xl transform -rotate-12 border-2 border-white">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
          {firstImageUrl ? (
            <img
              src={firstImageUrl}
              alt={`Image of ${productName}`}
              className={`w-full h-full object-cover transition-transform duration-500 ${!isOutOfStock && "group-hover:scale-110"}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
              No Image
            </div>
          )}
          
          {/* Discount Badge on Image */}
          {!isOutOfStock && isSale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
              {discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-5 flex flex-col justify-between h-[224px]">
          <div>
            <h3
              className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors"
              title={productName}
            >
              {productName}
            </h3>
            
            {/* Stock Status Small Label */}
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${stock <= 5 && stock > 0 ? "text-orange-500" : "text-gray-400"}`}>
              {isOutOfStock ? "Out of Stock" : stock <= 5 ? `Only ${stock} items left!` : "In Stock"}
            </p>
          </div>

          <div className="mt-auto">
            {/* Price Section */}
            <div className="mb-4">
              {isSale ? (
                <div className="flex flex-col">
                  <span className="text-gray-400 line-through text-xs font-medium">
                    Rs.{oldPriceNum.toLocaleString()}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    Rs.{nowPriceNum.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-black text-slate-900">
                  Rs.{nowPriceNum?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Button */}
            <button 
              disabled={isOutOfStock}
              className={`w-full font-bold py-3 rounded-xl transition-all duration-300 shadow-md ${
                isOutOfStock 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-slate-900 text-white hover:bg-black hover:shadow-xl active:scale-95"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "View Product"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}