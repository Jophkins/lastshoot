"use client";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import useEmblaCarousel from "embla-carousel-react";

export default function Home() {
  const pizzaPics = [
    "https://upload.wikimedia.org/wikipedia/commons/9/91/Pizza-3007395.jpg",
    "https://www.tasteofhome.com/wp-content/uploads/2018/01/Homemade-Pizza_EXPS_FT23_376_EC_120123_3.jpg",
    "https://ca.ooni.com/cdn/shop/articles/20220211142645-margherita-9920.jpg?v=1737367039&width=1080",
  ];
  const [emblaRef] = useEmblaCarousel({ loop: true, containScroll: false }, [Autoplay(), Fade()]);

  return (
    <>
      <div className="mt-10 flex items-center justify-center text-amber-400 overflow-hidden">
        <div className="embla border-4 border-green-600" ref={emblaRef}>
          <div className="embla__container max-w-120 max-h-120 w-auto h-auto">
            <div className="embla__slide"><img src={pizzaPics[0]} alt="" /></div>
            <div className="embla__slide"><img src={pizzaPics[1]} alt="" /></div>
            <div className="embla__slide"><img src={pizzaPics[2]} alt="" /></div>
          </div>
        </div>
      </div>
    </>
  );
}
