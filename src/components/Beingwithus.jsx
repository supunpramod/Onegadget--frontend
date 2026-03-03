import React from "react";

// ✅ banners import (ඔයාගේ actual asset names දාන්න)
import bannerLeft from "@/assets/1731560650_banner.jpg";
import bannerRight from "@/assets/1727170959_banner.jpg";

export default function Beingwithus() {
  const banners = [
    { alt: "MSI Banner", src: bannerLeft },
    { alt: "HP Banner", src: bannerRight },
  ];

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* ✅ Title */}
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Being with US
        </h2>

        {/* ✅ Subtitle */}
        <p className="mt-2 text-center text-sm text-slate-600">
          We Full Fill Your Every Tech Needs. We Are Here With You
        </p>

        {/* ✅ Two banners like screenshot */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {banners.map((bn) => (
            <div
              key={bn.alt}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <img
                src={bn.src}
                alt={bn.alt}
                className="h-[170px] w-full object-cover sm:h-[190px] md:h-[210px]"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}