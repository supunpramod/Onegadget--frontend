import React from "react";

// ✅ Import images from @/assets
import asus from "@/assets/2_main_1745994349.jpg";
import msi from "@/assets/1_main_1745994106.jpg";
import hp from "@/assets/13_main_1771319795.png";
import lenovo from "@/assets/3_main_1756703877.jpg";
import corsair from "@/assets/11_main_1768302244.png";
import adata from "@/assets/5_main_1758705634.png";
import ddlink from "@/assets/7_main_1765179441.png";

import banner1 from "@/assets/fwebp (1).webp";
import banner2 from "@/assets/LUDI-ASUS-WEB-BANNER-1900X540.jpg";

export default function OurBrands() {
  const brands = [
    { name: "ASUS", src: asus },
    { name: "MSI", src: msi },
    { name: "HP", src: hp },
    { name: "Lenovo", src: lenovo },
    { name: "Corsair", src: corsair },
    { name: "ADATA", src: adata },
    { name: "DDLink", src: ddlink },
  ];

  const banners = [
    { alt: "Banner 1", src: banner1 },
    { alt: "Banner 2", src: banner2 },
  ];

  return (
    <section className="w-full bg-white border-t border-slate-200 py-8">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="text-2xl font-semibold text-slate-900">Our Brands</h2>

        {/* Brands row */}
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-6 overflow-x-auto">
            {brands.map((b) => (
              <div
                key={b.name}
                className="flex h-20 min-w-[90px] items-center justify-center"
              >
                <img
                  src={b.src}
                  alt={b.name}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Banners */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {banners.map((bn) => (
            <div
              key={bn.alt}
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <img
                src={bn.src}
                alt={bn.alt}
                className="h-[170px] w-full object-cover sm:h-[190px] md:h-[210px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}