import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Upload, Eye, Calendar, FileText, ImageIcon, Book } from "lucide-react";
import { FiFileText, FiX } from "react-icons/fi";
import axios from "axios";
import { addChapter, updateChapter,getAllChapters } from "../../services/comicChapServices";
import { showAlert } from "../../constants/sweetAlert";

const ChapterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chap, comicId: passedComicId } = location.state || {};
  const { state } = useLocation();
  const { comicId: urlComicId } = useParams();

  const comicId = passedComicId || urlComicId;

  const [comic, setComic] = useState(location.state?.comic || null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingChapters, setExistingChapters] = useState([]);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

const [chapterData, setChapterData] = useState({
  comicId: passedComicId || urlComicId || "",
  title: "",
  chapterNumber: "",
  releaseDate: "",
  chapterImage: null,
  chapterPdf: null,
});

useEffect(() => {
  if (state?.comic) {
    setComic(state.comic);
    localStorage.setItem("selectedComic", JSON.stringify(state.comic));
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
    const res = await getAllChapters(comicId); 
    setExistingChapters(res.map(chap => chap.chapNum)); 
  };
  fetchChapters();
}, [comicId]);

useEffect(() => {
  if (chap) {
    const pdfName = chap.chapPdf.split("/").pop(); 
    const imgName = chap.chapImage.split("/").pop();

    setChapterData({
      comicId: passedComicId || urlComicId || "",
      title: chap.title || "",
      chapterNumber: chap.chapNum || "",
      releaseDate: chap.releaseDate ? chap.releaseDate.split("T")[0] : "",
      chapterImage: { url: chap.chapImage, name: imgName },
      chapterPdf: { url: chap.chapPdf, name: pdfName },
    });
  }
}, [chap, passedComicId, urlComicId]);

useEffect(() => {
  if (state?.comic) {
    setComic(state.comic);
    localStorage.setItem("selectedComic", JSON.stringify(state.comic));
  } else {
    const savedComic = localStorage.getItem("selectedComic");
    if (savedComic) {
      setComic(JSON.parse(savedComic));
    } else {
      axios.get(`/comic/${comicId}`).then((res) => setComic(res.data));
    }
  }
}, [state, comicId]);

const mode = chap ? (window.location.pathname.includes("/open") ? "view" : "update") : "create";
console.log(mode);

const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (files) {
    const file = files[0];
    setChapterData((prev) => ({
      ...prev,
      [name]: file,
    }));
    return;
  }
  if (name === "chapterNumber") {
    if (existingChapters.includes(value)) {
      setError("Chapter number already exists. Enter another number.");
    } else {
      setError("");
    }
  }
  setChapterData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!window.confirm("Are you sure you want to create this chapter?")) return;
  try {
    setLoading(true);
    const result = await addChapter(comic._id, chapterData);
    if (result.data.success) {
      showAlert('published');
      setChapterData({
        comicId: comic._id,
        title: "",
        chapterNumber: "",
        releaseDate: "",
        chapterImage: null,
        chapterPdf: null,
      });
    } else {
      alert(result.data.message || "Failed to create chapter.");
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      alert(error.response.data.message); 
    } else {
      alert("Something went wrong. Please try again.");
    }
    console.error("Error creating chapter:", error);
  } finally {
    setLoading(false);
  }
};

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
};

const handleUpdateChapter = async (e) => {
  e.preventDefault();
  if (
    existingChapters.includes(chapterData.chapterNumber) &&
    chapterData.chapterNumber !== chap?.chapNum?.toString()
  ) {
    alert("Chapter number already exists. Enter another number.");
    return;
  }

  const isSameTitle = chapterData.title.trim() === (chap?.title || "");
  const isSameChapterNum =
    chapterData.chapterNumber === chap?.chapNum?.toString();
  const isSameReleaseDate =
    chapterData.releaseDate === chap?.releaseDate?.split("T")[0];

  const isSameImage =
    (chap?.chapImage && chapterData.chapterImage?.url === chap.chapImage) ||
    (!chap?.chapImage && !chapterData.chapterImage);

  const isSamePdf =
    (chap?.chapPdf && chapterData.chapterPdf?.url === chap.chapPdf) ||
    (!chap?.chapPdf && !chapterData.chapterPdf);

  const isUnchanged = 
    isSameTitle &&
    isSameChapterNum &&
    isSameReleaseDate &&
    isSameImage &&  
    isSamePdf;   

  if (isUnchanged) {
    alert("Please update something before updating this chapter.");
    return;
  }

  if (!window.confirm("Are you sure you want to update this chapter?")) return;
  
  try {
    const result = await updateChapter(comic._id, chap._id, chapterData);
    if (result.success) {
       showAlert("updated", () => {
        navigate(`/comicChap/${comic._id}/chapters`, { replace: true }); 
      });
    }
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update chapter");
  }
};

if (!comic) return <p>Loading...</p>;

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 sm:p-4 mt-12 sm:mt-16">
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-8 mt-8">
        <div className="flex  sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Book className="text-white text-lg sm:text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
              {mode === "create" && "Add New Chapter"}
              {mode === "update" && "Update Chapter"}
              {mode === "view" && "View Chapter"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {mode === "create" && "Create and publish your latest chapter"}
              {mode === "update" && "Edit details of your chapter and update it"}
              {mode === "view" && "View the chapter you have created"}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 sm:p-6 border-l-4 border-red-500">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            {comic?.title || "Loading..."} ({comic?.releasedYear || "N/A"})
          </h2>
          <p className="text-sm sm:text-base text-gray-700">
            <span className="font-medium">Authors:</span>{" "}
            {Array.isArray(comic?.authors) ? comic.authors.join(", ") : comic?.authors || "N/A"}
          </p>
          <p className="text-sm sm:text-lg text-gray-700 mt-1">
            <span className="font-medium">Chapter :</span> <span className="text-red-600 font-medium">#{chapterData.chapterNumber || "Not specified"}</span>
          </p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comic ID
              </label>
              <input
                type="text"
                name="comicId"
                value={comic?._id || ""}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors bg-gray-50 text-sm sm:text-base"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chapter Cover Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="chapterImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="chapterImage"
                />
                <label
                  htmlFor="chapterImage"
                  className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 transition-colors cursor-pointer flex sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-gray-50 hover:bg-red-50"
                >
                  <ImageIcon className="text-gray-500" size={20} />
                  <span className="text-gray-600 text-sm sm:text-base text-center">
                    {chapterData.chapterImage ? chapterData.chapterImage.name : "Upload Chapter Image"}
                  </span>
                  <Upload className="text-gray-500" size={16} />
                </label>
              </div>
              {chapterData.chapterImage && (
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (chapterData.chapterImage instanceof File) {
                        setPreviewImage(URL.createObjectURL(chapterData.chapterImage));
                      } else if (chapterData.chapterImage?.url) {
                        setPreviewImage(chapterData.chapterImage.url); 
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition border border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white text-sm sm:text-base"
                  >
                    View Image
                  </button>
                  {mode !== "view" && (
                    <button
                      type="button"
                      onClick={() => {
                        setChapterData((prev) => ({ ...prev, chapterImage: null }));
                        document.getElementById("chapterImage").value = "";
                        setPreviewImage(null);
                      }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition border border-red-500 bg-red-100 text-red-700 hover:bg-red-500 hover:text-white text-sm sm:text-base"
                    >
                      <FiX size={16} /> Remove
                    </button>
                  )}
                </div>
              )}
            </div>
            {previewImage && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setPreviewImage(null)}
              >
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-full rounded-lg shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-5 right-5 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chapter Title
              </label>
              <input
                type="text"
                name="title"
                placeholder="Chapter title"
                value={chapterData.title}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chapter Number
              </label>
              <input
                type="number"
                name="chapterNumber"
                placeholder="Enter chapter number"
                value={chapterData.chapterNumber}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Release Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="date"
                  name="releaseDate"
                  value={chapterData.releaseDate}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 pl-10 sm:pl-12 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chapter PDF
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="chapterPdf"
                  accept=".pdf"
                  onChange={handleChange}
                  className="hidden"
                  id="chapterPdf"
                />
                <label
                  htmlFor="chapterPdf"
                  className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 transition-colors cursor-pointer flex sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-gray-50 hover:bg-red-50"
                >
                  <FileText className="text-gray-500" size={20} />
                  <span className="text-gray-600 text-sm sm:text-base text-center">
                      {chapterData.chapterPdf ? chapterData.chapterPdf.name : "Upload Chapter PDF"}
                  </span>
                  <Upload className="text-gray-500" size={16} />
                </label>
              </div>
              {chapterData.chapterPdf && (  
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (chapterData.chapterPdf instanceof File) {
                        const pdfUrl = URL.createObjectURL(chapterData.chapterPdf);
                        window.open(pdfUrl, "_blank");
                      } else if (chapterData.chapterPdf?.url) {
                        window.open(chapterData.chapterPdf.url, "_blank"); 
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition border border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white text-sm sm:text-base"
                  >
                    <FiFileText size={16} /> View PDF
                  </button>
                  {mode !== "view" && (
                    <button
                      type="button"
                      onClick={() => {
                      setChapterData((prev) => ({ ...prev, chapterPdf: null }));
                      document.getElementById("chapterPdf").value = "";
                    }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition border border-red-500 bg-red-100 text-red-700 hover:bg-red-500 hover:text-white text-sm sm:text-base"
                    >
                      <FiX size={16} /> Remove
                    </button>
                  )}
                </div>
              )}
            </div>
            {mode !== "view" && (
              <button
                type="submit"
                onClick={mode === "update" ? handleUpdateChapter : undefined}
                className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all transform hover:scale-[1.02] ${
                  mode === "update"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                }`}
              >
                {mode === "update" ? "Update Chapter" : "Create Chapter"}
              </button>
            )}
          </form>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Preview</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              <Eye size={16} />
              <span>{showPreview ? "Hide" : "Show"} Preview</span>
            </button>
          </div>
          {showPreview && (
            <div className="space-y-4">
              {!showPdfPreview ? (
                <div
                  className="flex sm:flex-row bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    if (
                      chapterData.chapterPdf &&
                      chapterData.title?.trim() &&
                      chapterData.releaseDate &&
                      chapterData.chapterImage
                    ) {
                      setShowPdfPreview(true);
                    } else {
                      alert("Please fill all fields before viewing the PDF.");
                    }
                  }}
                >
                  <div className="flex m:flex-row items-center w-full">
                    <div className=" sm:w-40 h-32 sm:h-20 bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 overflow-hidden sm:mr-4">
                      {chapterData.chapterImage ? (
                        <img
                          src={
                            chapterData.chapterImage instanceof File
                              ? URL.createObjectURL(chapterData.chapterImage) // For newly uploaded file
                              : chapterData.chapterImage?.url || "" // For already uploaded file
                          }
                          alt="Chapter cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-white text-xs text-center">
                            <div className="w-8 h-10 bg-red-400 rounded mb-1 mx-auto"></div>
                            <div className="w-6 h-2 bg-red-400 rounded mx-auto"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex  flex-col sm:flex-row justify-between items-center w-full  sm:p-0">
                      <h4 className="font-medium text-gray-900 text-base sm:text-lg truncate text-center sm:text-left mb-2 sm:mb-0 max-w-full sm:max-w-[50%]">
                        {chapterData.title || "Chapter Title"}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-500 whitespace-nowrap sm:mr-5">
                        {formatDate(chapterData.releaseDate) || "Release date not set"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowPdfPreview(false)}
                    className="absolute top-2 right-2 sm:right-5 text-white px-2 py-1 z-10"
                  >
                  <span className="text-black"> <FiX size={20} /> </span> 
                  </button>
                  <div className="border border-gray-800 rounded-md overflow-hidden">
                    <iframe
                    src={
                      (chapterData.chapterPdf instanceof File
                        ? URL.createObjectURL(chapterData.chapterPdf)
                        : chapterData.chapterPdf?.url || "") + "#toolbar=0&navpanes=0&scrollbar=0"
                    }
                    title="PDF Preview"
                    className="w-full h-[300px] sm:h-[500px] border-0"
                  />
                  </div>
                </div>
              )}
            </div>
          )}
          {!showPreview && (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <Eye size={40} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">Click "Show Preview" to see how your chapter will look</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
export default ChapterDashboard;