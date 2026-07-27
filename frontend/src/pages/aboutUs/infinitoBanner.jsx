import banner from '../../../assets/Images/aboutUs/banner.png'
import bottom from '../../../assets/Images/aboutUs/Bottom.png'
const InfinitoBanner = () => {
  return (
    <>
      <div
        className="relative w-full bg-cover bg-center min-h-[60vh] flex items-center justify-center px-4 md:px-10 py-16"

      >

        {/* Black Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-opacity-70 z-0"
          style={{
            backgroundImage: `url(${banner})`,
          }}
        />

        {/* Centered Text Content */}
        <div className="relative z-10 max-w-5xl text-center text-white space-y-6">
          {/* Main Heading with Stretch Effect */}
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-widest text-red-600 uppercase scale-y-150"
          >
            INFINITO COMICS
          </h1>

          {/* Paragraph with Wider Letter Spacing */}
          <p className="text-sm md:text-lg font-medium tracking-wider leading-relaxed ">
            India’s Most Prominent Character Based Entertainment Company With Library Of More Than 2500+ Superheroes. <br />
            We Are Committed To Bringing You The Best In Comics, Animation, Games And Merchandise.
          </p>

          <p className="text-sm md:text-lg font-medium tracking-wide">
            Discover Our Passion, Expertise, And Mission To Revolutionize The World Of AVGC–XR!
          </p>
        </div>
      </div>
      <div className='w-full h-30 bg-cover bg-center bg-no-repeat -mt-1'
        style={{
          backgroundImage: `url(${bottom})`
        }}
      />

    </>
  );
};

export default InfinitoBanner;
