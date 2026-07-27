import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ChipField from "./ChipField";
import { toast } from 'react-toastify';

const AdminPanel = ({
  editingCharacter,
  setEditingCharacter,
  onCharacterSaved,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      knownAs: "",
      originalName: "",
      birthDate: "",
      character: [],
      placeOfOrigin: "",
      interest: [],
      weapon: [],
      capability: [],
      powers: [],
      height: "",
      weight: "",
      age: "",
      species: "",
      eyes: "",
      hair: "",
      limitation: [],
      description: "",
      storylineText: "",
      storylineImage: null,
      originText: "",
      originImage: null,
      about: "",
      gender: "",
      mainImage: null,
      mainLandscapeImage: null,
      power1Image: null,
      power2Image: null,
      power3Image: null,
    },
  });

  // State for chip input fields
  const [powerInput, setPowerInput] = useState("");
  const [characterInput, setCharacterInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [weaponInput, setWeaponInput] = useState("");
  const [capabilityInput, setCapabilityInput] = useState("");
  const [limitationInput, setLimitationInput] = useState("");

  // State for existing images (when editing)
  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingStoryLineImage, setExistingStoryLineImage] = useState(null);
  const [existingOriginImage, setExistingOriginImage] = useState(null);
  const [existingMainLandscapeImage, setExistingMainLandscapeImage] = useState(null);
  const [existingPower1Image, setExistingPower1Image] = useState(null);
  const [existingPower2Image, setExistingPower2Image] = useState(null);
  const [existingPower3Image, setExistingPower3Image] = useState(null);

  // Watch for images to display previews
  const mainImageFile = watch("mainImage");
  const storylineImageFile = watch("storylineImage");
  const originImageFile = watch("originImage");
  const mainLandscapeImageFile = watch("mainLandscapeImage");
  const power1ImageFile = watch("power1Image");
  const power2ImageFile = watch("power2Image");
  const power3ImageFile = watch("power3Image");

  // Create URLs for image previews
  const mainImageURL =
    mainImageFile && mainImageFile[0]
      ? URL.createObjectURL(mainImageFile[0])
      : null;
  const storylineImageURL =
    storylineImageFile && storylineImageFile[0]
      ? URL.createObjectURL(storylineImageFile[0])
      : null;
  const originImageURL =
    originImageFile && originImageFile[0]
      ? URL.createObjectURL(originImageFile[0])
      : null;
  const mainLandscapeImageURL =
    mainLandscapeImageFile && mainLandscapeImageFile[0]
      ? URL.createObjectURL(mainLandscapeImageFile[0])
      : null;
  const power1ImageURL =
    power1ImageFile && power1ImageFile[0]
      ? URL.createObjectURL(power1ImageFile[0])
      : null;
  const power2ImageURL =
    power2ImageFile && power2ImageFile[0]
      ? URL.createObjectURL(power2ImageFile[0])
      : null;
  const power3ImageURL =
    power3ImageFile && power3ImageFile[0]
      ? URL.createObjectURL(power3ImageFile[0])
      : null;

  // Populate form with editing character data when available
  useEffect(() => {
    if (editingCharacter) {
      Object.keys(editingCharacter).forEach((key) => {
        if (key === "mainImage") {
          setExistingMainImage(editingCharacter.mainImage);
        } else if (key === "storylineImage") {
          setExistingStoryLineImage(editingCharacter.storylineImage);
        } else if (key === "originImage") {
          setExistingOriginImage(editingCharacter.originImage);
        } else if (key === "mainLandscapeImage") {
          setExistingMainLandscapeImage(editingCharacter.mainLandscapeImage);
        } else if (key === "power1Image") {
          setExistingPower1Image(editingCharacter.power1Image);
        } else if (key === "power2Image") {
          setExistingPower2Image(editingCharacter.power2Image);
        } else if (key === "power3Image") {
          setExistingPower3Image(editingCharacter.power3Image);
        } else if (Array.isArray(editingCharacter[key])) {
          setValue(key, editingCharacter[key]);
        } else {
          setValue(key, editingCharacter[key]);
        }
      });
    } else {
      setExistingMainImage(null);
      setExistingStoryLineImage(null);
      setExistingOriginImage(null);
      setExistingMainLandscapeImage(null);
      setExistingPower1Image(null);
      setExistingPower2Image(null);
      setExistingPower3Image(null);
    }
  }, [editingCharacter, setValue]);

  // Handle form submission
  const onSubmit = (data) => {
    const characterData = { ...data };
    if (mainImageFile && mainImageFile[0]) {
      characterData.mainImage = mainImageFile[0];
    } else if (existingMainImage) {
      characterData.mainImage = existingMainImage;
    }
    if (storylineImageFile && storylineImageFile[0]) {
      characterData.storylineImage = storylineImageFile[0];
    } else if (existingStoryLineImage) {
      characterData.storylineImage = existingStoryLineImage;
    }
    if (originImageFile && originImageFile[0]) {
      characterData.originImage = originImageFile[0];
    } else if (existingOriginImage) {
      characterData.originImage = existingOriginImage;
    }
    if (mainLandscapeImageFile && mainLandscapeImageFile[0]) {
      characterData.mainLandscapeImage = mainLandscapeImageFile[0];
    } else if (existingMainLandscapeImage) {
      characterData.mainLandscapeImage = existingMainLandscapeImage;
    }
    if (power1ImageFile && power1ImageFile[0]) {
      characterData.power1Image = power1ImageFile[0];
    } else if (existingPower1Image) {
      characterData.power1Image = existingPower1Image;
    }
    if (power2ImageFile && power2ImageFile[0]) {
      characterData.power2Image = power2ImageFile[0];
    } else if (existingPower2Image) {
      characterData.power2Image = existingPower2Image;
    }
    if (power3ImageFile && power3ImageFile[0]) {
      characterData.power3Image = power3ImageFile[0];
    } else if (existingPower3Image) {
      characterData.power3Image = existingPower3Image;
    }
    if (characterData.storyLine) delete characterData.storyLine;
    if (characterData.origin) delete characterData.origin;
    if (editingCharacter) {
      characterData._id = editingCharacter._id;
      onCharacterSaved(characterData, true);
      console.log(characterData);
    } else {
      onCharacterSaved(characterData, false);
      toast.success("Character created successfully!");
    }
    reset();
    setEditingCharacter(null);
  };

  const handleCancel = () => {
    // Use toast.info() for confirm dialog with custom buttons
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      setEditingCharacter(null);
      reset();
      toast.info("Changes discarded");
    }
  };

  // Define form fields configuration (only required fields have validation)
  const formFields = [
    {
      name: "knownAs",
      label: "Known As",
      type: "text",
      validation: { required: "Known As is required" },
    },
    {
      name: "originalName",
      label: "Original Name",
      type: "text",
      validation: {},
    }, // not required
    {
      name: "birthDate",
      label: "Birth Date",
      type: "date",
      validation: { required: "Birth Date is required" },
    },
    { name: "height", label: "Height", type: "text", validation: {} }, // not required
    { name: "weight", label: "Weight", type: "text", validation: {} }, // not required
    {
      name: "age",
      label: "Age",
      type: "number",
      validation: {
        required: "Age is required",
        valueAsNumber: true,
        min: { value: 1, message: "Age must be at least 1" },
      },
    },
    { name: "species", label: "Species", type: "text", validation: {} }, // not required
    { name: "eyes", label: "Eyes", type: "text", validation: {} }, // not required
    { name: "hair", label: "Hair", type: "text", validation: {} }, // not required
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
      validation: { required: "Gender is required" },
    },
  ];

  return (
    <div className="bg-gray-800 p-6 md:p-10 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {editingCharacter
          ? `Edit Character: ${editingCharacter.knownAs}`
          : "Create New Character"}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Main Character Image and Landscape Image in one row */}
        <div className="col-span-1">
          <label className="block text-gray-300 font-medium mb-2">
            Main Character Image
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("mainImage", {
              required: !editingCharacter && "Main character image is required",
            })}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
          {errors.mainImage && (
            <span className="text-red-500 text-sm mt-1">
              {errors.mainImage.message}
            </span>
          )}
          {mainImageURL ? (
            <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
              <img
                src={mainImageURL}
                alt="Main character preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            existingMainImage && (
              <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
                <img
                  src={existingMainImage}
                  alt="Current character"
                  className="w-full h-full object-cover"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Current image (upload a new one to change)
                </p>
              </div>
            )
          )}
        </div>

        <div className="col-span-1">
          <label className="block text-gray-300 font-medium mb-2">
            Main Landscape Image
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("mainLandscapeImage", {
              required: !editingCharacter && "Main landscape image is required",
            })}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
          {errors.mainLandscapeImage && (
            <span className="text-red-500 text-sm mt-1">
              {errors.mainLandscapeImage.message}
            </span>
          )}
          {mainLandscapeImageURL ? (
            <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
              <img
                src={mainLandscapeImageURL}
                alt="Main landscape preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            existingMainLandscapeImage && (
              <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
                <img
                  src={existingMainLandscapeImage}
                  alt="Current landscape"
                  className="w-full h-full object-cover"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Current image (upload a new one to change)
                </p>
              </div>
            )
          )}
        </div>

        {/* Horizontal Rule */}
        <hr className="col-span-1 md:col-span-2 border-gray-600 my-2" />

        {/* Power Images in one row */}
        <div className="col-span-1 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Power 1 Image
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("power1Image", {
                  required: !editingCharacter && "Power 1 image is required",
                })}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {errors.power1Image && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.power1Image.message}
                </span>
              )}
              {power1ImageURL ? (
                <div className="mt-4 w-full h-32 overflow-hidden rounded-lg border-2 border-gray-700">
                  <img
                    src={power1ImageURL}
                    alt="Power 1 preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                existingPower1Image && (
                  <div className="mt-4 w-full h-32 overflow-hidden rounded-lg border-2 border-gray-700">
                    <img
                      src={existingPower1Image}
                      alt="Current power 1 image"
                      className="w-full h-full object-cover"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Current image (upload a new one to change)
                    </p>
                  </div>
                )
              )}
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Power 2 Image
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("power2Image", {
                  required: !editingCharacter && "Power 2 image is required",
                })}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {errors.power2Image && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.power2Image.message}
                </span>
              )}
              {power2ImageURL ? (
                <div className="mt-4 w-full h-32 overflow-hidden rounded-lg border-2 border-gray-700">
                  <img
                    src={power2ImageURL}
                    alt="Power 2 preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                existingPower2Image && (
                  <div className="mt-4 w-full h-32 overflow-hidden rounded-lg border-2 border-gray-700">
                    <img
                      src={existingPower2Image}
                      alt="Current power 2 image"
                      className="w-full h-full object-cover"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Current image (upload a new one to change)
                    </p>
                  </div>
                )
              )}
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Power 3 Image
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("power3Image", {
                  required: !editingCharacter && "Power 3 image is required",
                })}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {errors.power3Image && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.power3Image.message}
                </span>
              )}
              {power3ImageURL ? (
                <div className="mt-4 w-full h-32 overflow-hidden rounded-lg border-2 border-gray-700">
                  <img
                    src={power3ImageURL}
                    alt="Power 3 preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                existingPower3Image && (
                  <div className="mt-4 w-full h-32 overflow-hidden rounded-lg border-2 border-gray-700">
                    <img
                      src={existingPower3Image}
                      alt="Current power 3 image"
                      className="w-full h-full object-cover"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Current image (upload a new one to change)
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Rest of the form remains unchanged */}
        {formFields.slice(0, 3).map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="block text-gray-300 font-medium">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                {...register(field.name, field.validation)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a {field.label}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name, field.validation)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              />
            )}
            {errors[field.name] && (
              <span className="text-red-500 text-sm mt-1">
                {errors[field.name].message}
              </span>
            )}
          </div>
        ))}

        {/* Place of Origin Field (manual input, required) */}
        <div className="flex flex-col gap-1">
          <label className="block text-gray-300 font-medium">
            Place of Origin
          </label>
          <input
            type="text"
            {...register("placeOfOrigin", {
              required: "Place of Origin is required",
            })}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            placeholder="Enter place of origin"
          />
          {errors.placeOfOrigin && (
            <span className="text-red-500 text-sm mt-1">
              {errors.placeOfOrigin.message}
            </span>
          )}
        </div>

        {/* Continue rendering the rest of the fields */}
        {formFields.slice(3).map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="block text-gray-300 font-medium">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                {...register(field.name, field.validation)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a {field.label}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name, field.validation)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              />
            )}
            {errors[field.name] && (
              <span className="text-red-500 text-sm mt-1">
                {errors[field.name].message}
              </span>
            )}
          </div>
        ))}

        {/* Array of Strings (Chips) Fields */}
        <ChipField
          fieldName="powers"
          label="Powers"
          inputState={powerInput}
          setInputState={setPowerInput}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
        <ChipField
          fieldName="characteristics"
          label="characteristics"
          inputState={characterInput}
          setInputState={setCharacterInput}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
        <ChipField
          fieldName="interests"
          label="Interest"
          inputState={interestInput}
          setInputState={setInterestInput}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
        <ChipField
          fieldName="weapon"
          label="Weapon"
          inputState={weaponInput}
          setInputState={setWeaponInput}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
        <ChipField
          fieldName="capabilities"
          label="Capability"
          inputState={capabilityInput}
          setInputState={setCapabilityInput}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
        <ChipField
          fieldName="limitations"
          label="Limitations"
          inputState={limitationInput}
          setInputState={setLimitationInput}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />

        {/* Text Area Fields */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-gray-300 font-medium mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows="4"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          ></textarea>
          {errors.description && (
            <span className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-gray-300 font-medium mb-1">About</label>
          <textarea
            {...register("about", { required: "About section is required" })}
            rows="4"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          ></textarea>
          {errors.about && (
            <span className="text-red-500 text-sm mt-1">
              {errors.about.message}
            </span>
          )}
        </div>

        {/* Story Line Fields */}
        <div className="col-span-1 md:col-span-2 border-t border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-3">Story Line</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Story Line Text
              </label>
              <textarea
                {...register("storylineText", {
                  required: "Story line text is required",
                })}
                rows="4"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              ></textarea>
              {errors.storylineText && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.storylineText.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Story Line Image
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("storylineImage")}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {errors.storylineImage && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.storylineImage.message}
                </span>
              )}
              {storylineImageURL ? (
                <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
                  <img
                    src={storylineImageURL}
                    alt="Story Line preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                existingStoryLineImage && (
                  <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
                    <img
                      src={existingStoryLineImage}
                      alt="Current storyline"
                      className="w-full h-full object-cover"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Current image (upload a new one to change)
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Origin Fields */}
        <div className="col-span-1 md:col-span-2 border-t border-gray-700 pt-6">
          <h2 className="text-xl font-semibold mb-3">Origin</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Origin Text
              </label>
              <textarea
                {...register("originText", {
                  required: "Origin text is required",
                })}
                rows="4"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              ></textarea>
              {errors.originText && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.originText.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Origin Image
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("originImage")}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              {errors.originImage && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.originImage.message}
                </span>
              )}
              {originImageURL ? (
                <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
                  <img
                    src={originImageURL}
                    alt="Origin preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                existingOriginImage && (
                  <div className="mt-4 w-40 h-40 overflow-hidden rounded-lg border-2 border-gray-700">
                    <img
                      src={existingOriginImage}
                      alt="Current origin"
                      className="w-full h-full object-cover"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Current image (upload a new one to change)
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 mt-8 pt-4 border-t border-gray-700 flex gap-4">
          {editingCharacter && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors focus:outline-none"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors focus:outline-none"
          >
            {editingCharacter ? "Update Character" : "Create Character"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;