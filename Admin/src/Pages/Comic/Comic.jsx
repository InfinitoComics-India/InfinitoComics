import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchComics, createComic, updateComic, deleteComic, getComicById } from '../../services/comicServices.js'
import { deleteChapter } from "../../services/comicChapServices.js";
import { showAlert } from "../../constants/sweetAlert";

const Comic = () => {
    const [comicData, setComicData] = useState({
        coverImg: "",
        bannerImg: "",
        title: "",
        authors: [""],
        releasedYear: ""
    });
    const [previewImg, setPreviewImg] = useState(null);
    const [previewBannerImg, setPreviewBannerImg] = useState(null);
    const [comics, setComics] = useState([]); 
    const [selectedComic, setSelectedComic] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedComicId, setSelectedComicId] = useState(null);

    const [visibleCount, setVisibleCount] = useState(4);
    const [chapters, setChapters] = useState([]);

    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setComicData({ ...comicData, [name]: value });
    };

    const handleAuthorsChange = (index, value) => {
        const updatedAuthors = [...comicData.authors];
        updatedAuthors[index] = value;
        setComicData({ ...comicData, authors: updatedAuthors });
    };

    const fetchAllComics = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchComics();
            setComics(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message || "Error in fetching the comics!");
            setComics([]); 
            toast.error("Error in fetching the comics!")
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!token) {
            toast.error("Authentication required");
            return;
        }
        
        try {
            const deletedComic = await deleteComic(id, token);
            console.log("Deleted Comic: ", deletedComic);
            toast.success("Comic deleted successfully!")
            fetchAllComics();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete comic");
        }
    };

    const handleEdit = (comic) => {
        setComicData({
            ...comic,
            coverImg: comic.coverImg,
            bannerImg: comic.bannerImg
        });
        setPreviewImg(comic.coverImg);
        setPreviewBannerImg(comic.bannerImg);
        setSelectedComic(comic);
        setSelectedComicId(comic._id);
    };

    const resetForm = () => {
        setComicData({
            coverImg: "",
            bannerImg: "",
            title: "",
            authors: [""],
            releasedYear: ""
        });
        setPreviewImg(null);
        setPreviewBannerImg(null);
        setSelectedComic(null);
        setSelectedComicId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comicData.title || !comicData.releasedYear || comicData.authors.length === 0 || !comicData.coverImg) {
            toast.error("Please fill in all the fields");
            return;
        }

        if (!token) {
            toast.error("Authentication required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", comicData.title);
            formData.append("releasedYear", comicData.releasedYear);
            
            const cleanAuthors = comicData.authors
                .map(a => typeof a === 'string' ? a.trim() : (a.name || '').trim())
                .filter(Boolean);
            
            console.log("Authors being sent:", cleanAuthors);
            
            formData.append("authors", JSON.stringify(cleanAuthors));

            if (comicData.coverImg instanceof File) {
                formData.append("coverImg", comicData.coverImg);
            } else if (typeof comicData.coverImg === "string") {
                formData.append("coverImg", comicData.coverImg);
            }
 
            if (comicData.bannerImg instanceof File) {
                formData.append("bannerImg", comicData.bannerImg);
            } else if (typeof comicData.bannerImg === "string") {
                formData.append("bannerImg", comicData.bannerImg);
            }

            console.log("FormData contents:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            if (selectedComic) {
                await updateComic(selectedComicId, formData, token);
                toast.success("Comic updated successfully!");
            } else {
                await createComic(formData, token);
                toast.success("Comic created successfully!");
            }

            fetchAllComics();
            resetForm();
        } catch (error) {
            console.error("Error in handleSubmit:", error);

            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                toast.error(`Error ${error.response.status}: ${error.response.data.message || 'Something went wrong!'}`);
            } else {
                toast.error("Network error or server unavailable!");
            }
        }
    };

    const addAuthorField = () => {
        setComicData({ ...comicData, authors: [...comicData.authors, ""] });
    };

    const removeAuthorField = (index) => {
        const updatedAuthors = [...comicData.authors];
        updatedAuthors.splice(index, 1);
        setComicData({ ...comicData, authors: updatedAuthors });
    };

    useEffect(() => {
        fetchAllComics();
    }, []);

    const handleDeleteChapter = async (comicId, chapterId) => {
        if (!window.confirm("Are you sure you want to delete this chapter?")) return;

        try {
            await deleteChapter(comicId, chapterId);
            setChapters((prevChapters) =>
                prevChapters.filter((chap) => chap._id !== chapterId)
            );
            setComics(prevComics => 
                prevComics.map(comic => 
                    comic._id === comicId 
                        ? { ...comic, chapters: comic.chapters?.filter(chap => chap._id !== chapterId) || [] }
                        : comic
                )
            );
            showAlert("deleted");
        } catch (err) {
            console.error("Error deleting chapter:", err);
            toast.error("Failed to delete chapter.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading comics...</p>
                </div>
            </div>
        );
    }

    if (error && comics.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button 
                        onClick={fetchAllComics}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-8 text-black pt-28">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-red-700 drop-shadow-md">
                        Comic Management Dashboard
                    </h1>
                    <p className="mt-2 text-lg md:text-xl text-gray-600">
                        Effortlessly manage your comic series — add, edit, preview and publish.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-40">
                    {/* Form Section */}
                    <div className="w-full lg:w-1/2 bg-white p-10 rounded-3xl shadow-2xl border border-red-200 space-y-8 animate-fade-in-up transition duration-500">

                        <h2 className="text-4xl font-extrabold text-red-600 mb-6 text-center tracking-tight">
                            {selectedComic ? "Edit Comic" : "Add New Comic"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Cover Upload */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Cover Image</label>

                                {previewImg ? (
                                    <div className="relative w-full">
                                        <img
                                            src={previewImg}
                                            alt="Cover Preview"
                                            className="w-full h-48 object-cover rounded-xl border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setComicData({ ...comicData, coverImg: "" });
                                                setPreviewImg(null);
                                            }}
                                            className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 shadow-md"
                                            title="Remove cover image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-red-300 rounded-xl cursor-pointer hover:bg-red-50 transition">
                                        <span className="text-red-600 font-medium">🖼️ Upload Cover</span>
                                        <input
                                            type="file"
                                            name="coverImg"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setComicData({ ...comicData, coverImg: file });
                                                    setPreviewImg(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Banner Upload */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Banner Image</label>

                                {previewBannerImg ? (
                                    <div className="relative w-full">
                                        <img
                                            src={previewBannerImg}
                                            alt="Banner Preview"
                                            className="w-full h-48 object-cover rounded-xl border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setComicData({ ...comicData, bannerImg: "" });
                                                setPreviewBannerImg(null);
                                            }}
                                            className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 shadow-md"
                                            title="Remove banner image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-red-300 rounded-xl cursor-pointer hover:bg-red-50 transition">
                                        <span className="text-red-600 font-medium">📁 Upload Banner</span>
                                        <input
                                            type="file"
                                            name="bannerImg"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setComicData({ ...comicData, bannerImg: file });
                                                    setPreviewBannerImg(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Comic Title */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Comic Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter comic title"
                                    value={comicData.title}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                />
                            </div>

                            {/* Released Year */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Released Year</label>
                                <input
                                    type="number"
                                    name="releasedYear"
                                    placeholder="e.g. 2024"
                                    value={comicData.releasedYear}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                />
                            </div>

                            {/* Authors */}
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-4">Author(s)</label>
                                <div className="space-y-3">
                                    {comicData.authors.map((author, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                placeholder={`Author ${index + 1}`}
                                                value={author}
                                                onChange={(e) => handleAuthorsChange(index, e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAuthorField(index)}
                                                    className="text-red-500 hover:text-red-700 font-bold transition text-xl"
                                                    title="Remove author"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addAuthorField}
                                        className="text-sm text-red-600 hover:underline hover:text-red-700 transition duration-200"
                                    >
                                        + Add Author
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-lg shadow-lg hover:bg-red-700 hover:shadow-xl transition duration-300 transform hover:scale-105 active:scale-95"
                            >
                                {selectedComic ? "Update Comic" : "Create Comic"}
                            </button>
                        </form>
                    </div>

                    {/* Live Preview */}
                    <div className="w-full lg:w-1/2 bg-white p-8 rounded-2xl shadow-2xl border border-red-200 space-y-6 animate-fade-in-up transition duration-500">

                        <h2 className="text-4xl font-extrabold text-red-600 mb-6 text-center tracking-tight">Live Preview</h2>

                        {/* Cover Preview Card */}
                        <div className="flex flex-col items-center space-t-3">
                            <img
                                src={
                                    previewImg ||
                                    (typeof comicData.coverImg === "string" && comicData.coverImg) ||
                                    "/fallback.jpg"
                                }
                                alt="Cover"
                                className="w-64 h-80 object-cover shadow border border-gray-300"
                            />
                            <div className="text-start w-[16rem]">
                                <div className="">
                                    <h3 className="text-md font-semibold mt-2 tracking-wide text-gray-800">
                                        {comicData.title || "Comic Title"}{" "}
                                        {comicData.releasedYear && (
                                            <span className="text-gray-600">({comicData.releasedYear})</span>
                                        )}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-400 mt-0 tracking-wide">
                                        {comicData.authors.filter(Boolean).length > 0
                                            ? comicData.authors.map((a) => a.name || a).join(", ")
                                            : "Author(s)"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Banner Preview */}
                        <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-md">
                            <p className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
                                Banner Image
                            </p>
                            {(previewBannerImg || comicData.bannerImg) ? (
                                <img
                                    src={
                                        previewBannerImg ||
                                        (typeof comicData.bannerImg === "string" && comicData.bannerImg)
                                    }
                                    alt="Banner"
                                    className="w-full h-64 object-cover"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                    No Banner Image
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Comics */}
                <div className="max-w-6xl mx-auto mt-16 bg-white p-8 rounded-xl shadow-lg border border-red-200">
                    <h2 className="text-2xl font-semibold text-red-700 mb-6">All Comics Preview</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-8">
                        {!comics || comics.length === 0 ? (
                            <div className="flex justify-center items-center flex-col mt-10">
                                <p className="text-gray-500 text-lg mb-4">No comics available.</p>
                                <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
                                    Add Comic
                                </button>
                            </div>
                        ) : (
                            [...comics].reverse().slice(0, visibleCount).map((comic) => (
                                <div key={comic._id} className="flex gap-8 justify-center items-start bg-gray-50 p-4">
                                    {/* card */}
                                    <div>
                                        <p className="bg-red-500 text-white rounded-full text-center mb-4 py-1 shadow">Card Image</p>
                                        <div className="w-[15.5rem]">
                                            <img
                                                src={comic.coverImg}
                                                alt="Cover"
                                                className="w-[15.5rem] h-[21rem] object-cover shadow-md"
                                            />
                                            <h3 className="text-sm font-semibold mt-2 tracking-wide">
                                                {comic.title}{" "}
                                                {comic.releasedYear && `(${comic.releasedYear})`}
                                            </h3>
                                            <p className="text-xs text-gray-600 font-medium">
                                                <span className="text-gray-700">Authors:</span> {comic.authors?.join(", ") || "Unknown"}
                                            </p>
                                            <div className="relative group inline-block">
                                                <div className="cursor-pointer transition-all duration-200 rounded-md pr-2 py-1 group-hover:bg-blue-50 inline-flex items-center">
                                                    <p className="text-xs text-gray-600 font-medium group-hover:text-blue-700 transition-colors">
                                                        <span className="text-gray-700 group-hover:text-blue-800">Chapters:</span> {comic.chapters?.length || 0}
                                                    </p>
                                                </div>
                                                {comic.chapters?.length > 1 && (
                                                    <div className="absolute top-0 right-full mr-3 bg-white shadow-xl border border-gray-400 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 whitespace-nowrap">
                                                        <button
                                                            onClick={() => navigate(`/comicChap/${comic._id}/chapters`, { state: { comic } })}
                                                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-500 text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center gap-1 "
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View All
                                                        </button>
                                                    </div>
                                                )}
                                                {comic.chapters?.length === 1 && (
                                                    <div className="absolute top-0 right-full mr-3 bg-white shadow-xl border border-gray-200 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-10 min-w-48">
                                                        <div className="space-y-2">
                                                            <button
                                                                onClick={() => {
                                                                    localStorage.setItem("selectedComic", JSON.stringify(comic));
                                                                    navigate(`/chapters/${comic.chapters[0]._id}/open`, {
                                                                        state: { chap: comic.chapters[0], comicId: comic._id }
                                                                    });
                                                                }}
                                                                className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Open Chapter
                                                            </button>

                                                            <button
                                                                onClick={() => navigate(`/chapters/${comic.chapters[0]._id}/edit`, { state: { chap: comic.chapters[0], comicId: comic._id } })}
                                                                className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Edit Chapter
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteChapter(comic._id, comic.chapters[0]._id);
                                                                }}
                                                                className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete Chapter
                                                            </button>
                                                        </div>
                                                        <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-1 mt-4 ">
                                                <button
                                                    onClick={() => handleEdit(comic)}
                                                    className="px-3 py-1 border-2 border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white font-semibold transition"
                                                >
                                                    Edit
                                                </button>
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => {
                                                            setShowPopup(true);
                                                            setSelectedComicId(comic._id);
                                                        }}
                                                        className="border-2 border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white font-semibold py-1 px-3 transition"
                                                    >
                                                        Delete
                                                    </button>

                                                    {/* POP UP  */}
                                                    {showPopup && selectedComicId === comic._id && (
                                                        <div className="absolute w-[14rem] -top-[18rem] -left-[3rem] rounded shadow-md p-3 z-50 bg-white/80 backdrop-blur-sm font-bold border-2 border-red-100">
                                                            <p className="text-sm text-red-500 mb-3">Are you sure you want to delete this comic?</p>
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        handleDelete(comic._id);
                                                                        setShowPopup(false);
                                                                    }}
                                                                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                                                                >
                                                                    Yes
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowPopup(false)}
                                                                    className="text-red-600 bg-white border-2 border-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-sm font-bold"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem("selectedComic", JSON.stringify(comic));
                                                        navigate(`/comic/${comic._id}/chapters`, {
                                                            state: { comic },
                                                        });
                                                    }}
                                                    className="flex-1 border-2 border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white font-semibold py-1 px-1 transition"
                                                >
                                                    Add Chapter
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* banner */}
                                    <div className="w-[50%]">
                                        <p className="bg-red-500 text-white rounded-full text-center mb-4 py-1 shadow">Banner Image</p>
                                        {comic.bannerImg && (
                                            <img
                                                src={comic.bannerImg}
                                                alt="Banner"
                                                className="w-full h-[22rem] pb-4 object-cover"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Load More / All Loaded Messages */}
                    {comics && comics.length > 0 && (
                        <>
                            {visibleCount < comics.length && (
                                <div className="flex justify-center mt-10">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 4)}
                                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
                                    >
                                        View More
                                    </button>
                                </div>
                            )}
                            {visibleCount >= comics.length && comics.length > 4 && (
                                <p className="italic text-gray-500 text-center mt-10">All comics loaded!</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Comic;