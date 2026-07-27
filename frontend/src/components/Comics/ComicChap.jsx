import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchChapter } from "../../services/ComicService.js"; 

const ComicChap = () => {
  const { comicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const isReaderView =
    location.pathname.includes("/comicChap/") && location.pathname.includes("/pdfView");

  useEffect(() => {
    const getChapters = async () => {
      try {
        const data = await fetchChapter(comicId);
        setChapters(data);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      }
    };
    getChapters();
  }, [comicId]);

  if (isReaderView && selectedPdf) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col">
        <div className="bg-[#2c2c2c] text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/comicChap/${comicId}/chapters`)}
              className="text-white hover:text-gray-300 text-lg sm:text-xl"
            >
              &#8592;
            </button>
            <span className="text-sm sm:text-base font-medium">
              {selectedPdf.title}
            </span>
          </div>
        </div>
        <iframe
          src={`${selectedPdf.url}#toolbar=0&navpanes=0&scrollbar=0`}
          title="Chapter PDF"
          className="flex-1 w-full"
          frameBorder="0"
        ></iframe>
      </div>
    );
  }
return (
  <div className="bg-white p-2 sm:p-8 max-w-5xl mx-auto mt-10">
    <div>
      {chapters.map((chap) => (
        <div
          key={chap._id}
          className="group bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-300 hover:shadow-lg"
          onClick={() => {
            setSelectedPdf({ url: chap.chapPdf, title: chap.title });
            navigate(`/comicChap/${comicId}/chapters/pdfView`);
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center w-full">
              <div className="w-32 h-[68px] sm:w-32 sm:h-[68px] flex-shrink-0 flex items-center justify-center shadow-md">
                <img
                  src={chap.chapImage}
                  alt="Chapter"
                  className="w-full h-full object-fill"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full ml-4 sm:ml-6 mt-2 sm:mt-0">
                <h3 className="text-xl font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">
                  {chap.title}
                </h3>
                {chap.releaseDate && (
                  <span className="text-base font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-auto whitespace-nowrap mr-8">
                    {new Date(chap.releaseDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default ComicChap;
