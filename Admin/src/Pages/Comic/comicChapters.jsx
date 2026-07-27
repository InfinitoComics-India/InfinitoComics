import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllChapters, deleteChapter } from "../../services/comicChapServices";
import axios from "axios";
import { showAlert } from "../../constants/sweetAlert";
const ComicChapters = () => {
  const { state } = useLocation();
  const { comicId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comic, setComic] = useState(state?.comic || null);

  useEffect(() => {
    if (state) {
      localStorage.setItem("selectedComic", JSON.stringify(state));
    } else {
      const savedComic = localStorage.getItem("selectedComic");
      if (savedComic) {
        setComic(JSON.parse(savedComic));
      } else {
        axios.get(`/comic/${comicId}`).then((res) => setComic(res.data));
      }
    }
  }, [state, comicId]);

useEffect(() => {
  const fetchChapters = async () => {
    try {
      const res = await getAllChapters(comicId); 
      const sortedChapters = res.sort((a, b) => {
        const chapNumA = parseInt(a.chapNum) || 0;
        const chapNumB = parseInt(b.chapNum) || 0;
        return chapNumA - chapNumB;
      });
      setChapters(sortedChapters);
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchChapters();
}, [comicId]);

if (!comic) return <p>Loading...</p>;

const handleDelete = async (chapterId) => {
  if (!window.confirm("Are you sure you want to delete this chapter?")) return;
  try {
    await deleteChapter(comicId, chapterId);
    setChapters((prevChapters) =>
      prevChapters.filter((chap) => chap._id !== chapterId)
    );
    showAlert("deleted");
  } catch (err) {
    console.error("Error deleting chapter:", err);
    alert("Failed to delete chapter.");
  }
};

if (loading) return <p className="text-center text-gray-600">Loading chapters...</p>;

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
    <div className="max-w-6xl mx-auto p-3 sm:p-6 pt-16 sm:pt-24">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8 mt-6">
        <div className="flex sm:flex-row items-start justify-between">
          <div className="flex sm:flex-row items-center gap-2 sm:gap-6 w-full">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <img src={comic.coverImg} alt="Cover Image" className="w-full h-full object-cover border border-black" />
            </div>
            <div className="space-y-2 sm:space-y-3 text-center sm:text-left w-full">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
                    {comic.title} ({comic.releasedYear})
                </h1>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-2">
                <div className="flex items-center gap-2 bg-red-50 px-3 sm:px-4 py-2 rounded-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-semibold text-red-600 text-sm sm:text-base">
                    {chapters.length} Chapters
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            All Chapters
          </h2>
          <div className="text-xs sm:text-sm text-gray-500">
            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} available
          </div>
        </div>
        {chapters.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No chapters available</h3>
            <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base px-4">Start by adding your first chapter to this comic.</p>
            <button
              onClick={() => navigate(`/comics/${comicId}/add-chapter`)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 font-semibold mx-auto text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Chapter
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {chapters.map((chap, index) => (
              <div
                key={chap._id}
                className="group bg-gray-50 hover:bg-white border-2 border-gray-200 hover:border-red-200 rounded-xl p-3 sm:p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full">
                    <div className="w-16 h-23 sm:w-20 sm:h-25 bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 flex items-center justify-center shadow-md">
                      <div className="text-white text-xs text-center">
                          <img src={chap.chapImage} alt="chap Image" className="w-full h-full object-contain border border-black" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                          {chap.title}
                        </h3>
                      </div>                     
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span>Chapter {chap.chapNum}</span>
                        </div>
                        {chap.releaseDate && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(chap.releaseDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {chap.views && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{chap.views > 1000 ? (chap.views / 1000).toFixed(1) + 'K' : chap.views} views</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                      onClick={() =>
                        navigate(`/chapters/${chap._id}/open`, {
                          state: { chap, comicId: comic._id, comic },
                        })
                      }
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="sm:inline">Open</span>
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 font-medium shadow-sm hover:shadow-md group-hover:bg-red-600 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                      onClick={() => handleDelete(chap._id)}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className=" sm:inline">Delete</span>
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                      onClick={() => navigate(`/chapters/${chap._id}/edit`, { state: { chap, comicId: comic._id, comic }})}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className=" sm:inline">Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default ComicChapters;