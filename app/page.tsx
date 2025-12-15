"use client";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import React from "react";

export default function Home() {
  const pizzaPics = [
    "https://picsum.photos/seed/29/800/1200",
    "https://picsum.photos/seed/129/800/1200",
    "https://picsum.photos/seed/229/800/1200",
  ];
  const [emblaRef] = useEmblaCarousel({ loop: true, containScroll: false }, [Autoplay(), Fade()]);

  return (
    <>
      <div className="mt-10 flex items-center justify-center text-amber-400 overflow-hidden">
        <div className="embla border-4 border-green-600" ref={emblaRef}>
          <div className="embla__container min-w-100 min-h-100 max-w-120 max-h-120 w-auto h-auto">
            <div className="embla__slide"><Image fill src={pizzaPics[0]} alt="" /></div>
            <div className="embla__slide"><Image fill src={pizzaPics[1]} alt="" /></div>
            <div className="embla__slide"><Image fill src={pizzaPics[2]} alt="" /></div>
          </div>
        </div>
      </div>
    </>
  );
}
