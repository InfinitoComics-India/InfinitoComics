import { ChevronRight } from "lucide-react";

const FoundationSection = () => {
  return (
    <section className="w-full pb-6">
      {/* Header (Mobile will hide this version) */}
      <div className="hidden lg:block text-left max-w-6xl mb-3 w-11/12 lg:w-2/3 mx-auto">
        <h2 className="uppercase tracking-widest font-extrabold font-['Dharma Gothic E'] text-black text-md md:text-xl transform scale-y-200 tracking-widest flex justify-start items-baseline">
          <p>Foundation Updates</p>
          <p className="text-[0.4rem] h-[12px] text-red-600 ml-4 flex justify-center items-baseline">
            GO TO FOUNDATION <ChevronRight className="h-[6px]" />
          </p>
        </h2>
      </div>

      {/* mobile view  */}
      <h2 className="lg:hidden pl-7 uppercase tracking-widest font-extrabold font-['Dharma Gothic E'] text-black text-2xl md:text-xl transform scale-y-200 tracking-widest flex justify-start items-baseline flex-col lg:flex-row bg-white pb-2">
        <p>Foundation Updates</p>
      </h2>

      <div className="relative flex flex-col md:flex-row items-center md:items-stretch bg-black mx-auto mb-6">
        {/* Text Section */}
        <div className="relative flex flex-col md:flex-row items-start md:items-stretch mx-auto w-11/12 lg:w-2/3">
          <div className="w-full  text-white py-2 md:py-12 z-10">
            {/* Header (Mobile only) */}

            <div className="lg:hidden mb-3">
              <h2 className="uppercase tracking-widest font-extrabold font-['Dharma Gothic E'] text-black text-md md:text-xl transform scale-y-200 tracking-widest text-start mb-4">
                <p className="text-[0.8rem] md:text-[0.6rem] lg:text-[0.8rem] h-[12px] text-red-600 flex justify-start items-center cursor-pointer">
                  GO TO FOUNDATION <ChevronRight className="h-[0.8rem] -ml-1" />
                </p>
              </h2>
            </div>

            <p
              className="pt-2 uppercase text-2xl md:text-xl lg:text-2xl font-['Dharma Gothic E'] font-bold mb-4 flex flex-wrap items-center transform scale-y-200"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="inline-block mr-2">infinito conducts</span>
              <span className="text-[#DD1215] inline-block">Tedx symbiosis</span>
            </p>

            <p className="text-md mb-8 leading-relaxed max-w-md pr-20">
              Anuj, is the keynote speaker at the legendary TedX Symbiosis, conducted by Infinito Comics. He is delivering 2 speeches about Economy and Management! Exciting?
              Read more by clicking the button below.
            </p>

            <a
              href="#"
              className="uppercase text-xs tracking-widest font-semibold text-white border-2 border-white px-4 py-2 hover:text-red-500 hover:border-red-500 transition duration-300 max-w-30"
            >
              See more &rsaquo;
            </a>
          </div>

        </div>

        {/* Image Section */}
        <div className="w-full md:w-auto md:absolute md:top-[-40px] right-6 lg:right-[16.7%] z-20 mt-6 md:mt-0 px-0">
          <img
            src="../../../assets/Images/archery.jpg"
            alt="Archers"
            className="w-full h-[26rem] md:w-[25rem] lg:w-[30rem] lg:h-[390px] object-cover "
          />
        </div>
      </div>
    </section>
  );
};

export default FoundationSection;
