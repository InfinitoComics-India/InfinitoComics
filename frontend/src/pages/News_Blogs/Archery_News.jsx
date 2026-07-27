import React, {useEffect, useState} from "react";
import { latestBlog } from "../../services/userServices";
import { Link } from "react-router-dom";
const ArcheryNews = () => {
    const [title, setTitle] = useState("WORLD ARCHERY CUP")
    const [subject, setSubject] = useState("Archery’s premier annual international circuit, the Hyundai Archery World Cup, enters its 19th season in 2025, with four stages in Centra Florida (USA), Shanghai (China), Antalya (Turkiye), and Madrid (Spain) from April to July, before the grand final in Nanjing (China) in October.")
    const [id, setId] = useState(":id");
    const [imageUrl, setImageUrl] = useState(null);
    useEffect(() => {
      const getblog = async () => {
        try {
         const latest = await latestBlog();
          if (latest) {
            setTitle(latest.title);
            setSubject(latest.subject);
            setId(latest._id);

            if (latest.news && latest.news.length > 0) {
              setImageUrl(latest.news[0].imageUrl);
            }
          }
        } catch (error) {
          console.error("Failed to fetch blog:", error.message);
        }
      }
      getblog();
    },[])
  return (
    <div className="py-6 w-11/12 lg:w-2/3 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold">LATEST UPDATES</h2>
        <Link to="/all-news" className="text-[#DD1215] tracking-widest font-bold text-xs sm:text-sm cursor-pointer mr-2 md::mr-50">
          VIEW MORE &gt;
        </Link>
      </div>
      <div className="flex flex-wrap md:flex-nowrap items-start gap-6">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Blog Visual"
            className="w-full md:w-[500px] h-[250px] object-fill"
          />
        )}
        <div className="flex flex-col gap-2 max-w-xl">
          <h1 className="text-[#DD1215] text-3xl">
            {title}
          </h1>
          <p className="text-gray-700 text-sm leading-relaxed mt-5">
            {subject}
          </p>
          <Link to={`/news/${id}`} className="text-red-600 font-semibold text-sm mt-10 cursor-pointer">
            READ MORE &gt;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArcheryNews;
