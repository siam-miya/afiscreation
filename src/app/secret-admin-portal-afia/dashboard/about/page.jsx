"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiUpload, FiSave, FiLoader } from "react-icons/fi";

const AboutAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    storyTitle: "",
    storyParagraphs: "",
    purposeTitle: "",
    purposeDescription: "",
    whatWeOfferTitle: "",
    offersList: "",
    whyChooseTitle: "",
    whyChooseList: "",
    promiseTitle: "",
    promiseDescription: "",
  });

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/about`);
        const result = await res.json();

        if (result.success && result.data) {
          const data = result.data;

          setFormData({
            storyTitle: data.storyTitle || "",
            storyParagraphs: data.storyParagraphs
              ? data.storyParagraphs.join("\n")
              : "",
            purposeTitle: data.purposeTitle || "",
            purposeDescription: data.purposeDescription || "",
            whatWeOfferTitle: data.whatWeOfferTitle || "",
            offersList: data.offersList
              ? data.offersList.join("\n")
              : "",
            whyChooseTitle: data.whyChooseTitle || "",
            whyChooseList: data.whyChooseList
              ? data.whyChooseList.join("\n")
              : "",
            promiseTitle: data.promiseTitle || "",
            promiseDescription: data.promiseDescription || "",
          });

          if (data.aboutImage) {
            setImagePreview(
              data.aboutImage.startsWith("http")
                ? data.aboutImage
                : `${BASE_URL}${data.aboutImage}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [BASE_URL]);

  // ইনপুট হ্যান্ডলার
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ইমেজ সিলেক্ট হ্যান্ডলার
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = new FormData();

      dataToSend.append(
        "storyTitle",
        formData.storyTitle
      );

      dataToSend.append(
        "purposeTitle",
        formData.purposeTitle
      );

      dataToSend.append(
        "purposeDescription",
        formData.purposeDescription
      );

      dataToSend.append(
        "whatWeOfferTitle",
        formData.whatWeOfferTitle
      );

      dataToSend.append(
        "whyChooseTitle",
        formData.whyChooseTitle
      );

      dataToSend.append(
        "promiseTitle",
        formData.promiseTitle
      );

      dataToSend.append(
        "promiseDescription",
        formData.promiseDescription
      );

      // Newline দিয়ে টেক্সটগুলোকে অ্যারে হিসেবে প্রসেস করা
      const paragraphsArray =
        formData.storyParagraphs
          .split("\n")
          .filter((p) => p.trim() !== "");

      const offersArray =
        formData.offersList
          .split("\n")
          .filter((o) => o.trim() !== "");

      const whyChooseArray =
        formData.whyChooseList
          .split("\n")
          .filter((w) => w.trim() !== "");

      dataToSend.append(
        "storyParagraphs",
        JSON.stringify(paragraphsArray)
      );

      dataToSend.append(
        "offersList",
        JSON.stringify(offersArray)
      );

      dataToSend.append(
        "whyChooseList",
        JSON.stringify(whyChooseArray)
      );

      if (imageFile) {
        dataToSend.append(
          "aboutImage",
          imageFile
        );
      }

      const res = await fetch(
        `${BASE_URL}/api/about`,
        {
          method: "POST",
          body: dataToSend,
        }
      );

      const result = await res.json();

      if (result.success) {
        alert(
          "About page content updated successfully!"
        );
      } else {
        alert(
          "Failed to update: " +
          result.message
        );
      }
    } catch (error) {
      console.error("Save error:", error);

      alert(
        "Something went wrong while saving!"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <FiLoader className="animate-spin text-3xl text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-6">

      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h1 className="text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
            Manage About Page
          </h1>

          <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-slate-400 sm:text-sm">
            Edit all content, icons text, and images for the main About page.
          </p>

        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >

          {saving ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiSave size={18} />
          )}

          {saving
            ? "Saving..."
            : "Save Changes"}

        </button>

      </div>


      <form
        onSubmit={handleSubmit}
        className="space-y-5 sm:space-y-6 md:space-y-8"
      >

        {/* ================================= */}
        {/* SECTION 1 */}
        {/* ================================= */}

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 md:p-6">

          <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-800 dark:border-slate-800 dark:text-white sm:text-lg">
            1. Main Banner & Our Story
          </h2>


          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">

            {/* Story */}

            <div className="space-y-4">

              <div>

                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300 sm:text-sm">
                  Story Section Title
                </label>

                <input
                  type="text"
                  name="storyTitle"
                  value={formData.storyTitle}
                  onChange={handleChange}
                  placeholder="e.g. Our Story"
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />

              </div>


              <div>

                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300 sm:text-sm">
                  Story Paragraphs (নতুন লাইনে লিখলে আলাদা প্যারাগ্রাফ হবে)
                </label>

                <textarea
                  name="storyParagraphs"
                  rows={6}
                  value={formData.storyParagraphs}
                  onChange={handleChange}
                  placeholder={"Paragraph 1...\nParagraph 2..."}
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white p-2.5 text-sm leading-relaxed text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />

              </div>

            </div>


            {/* Image */}

            <div>

              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300 sm:text-sm">
                About Page Image
              </label>

              <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:p-4">

                {imagePreview ? (

                  <div className="relative h-48 w-full overflow-hidden rounded-lg sm:h-56">

                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />

                  </div>

                ) : (

                  <div className="py-6 text-center text-gray-400 dark:text-slate-500">

                    <FiUpload className="mx-auto mb-2 text-3xl" />

                    <p className="text-xs">
                      No image uploaded yet
                    </p>

                  </div>

                )}


                <label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20">

                  <FiUpload size={15} />

                  {imagePreview
                    ? "Change Image"
                    : "Choose Image"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

              </div>

            </div>

          </div>

        </div>


        {/* ================================= */}
        {/* SECTION 2 */}
        {/* ================================= */}

        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 md:p-6">

          <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-800 dark:border-slate-800 dark:text-white sm:text-lg">
            2. Feature Cards
          </h2>


          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">


            {/* Purpose Box */}

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">

              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                Our Purpose Card
              </h3>

              <input
                type="text"
                name="purposeTitle"
                value={formData.purposeTitle}
                onChange={handleChange}
                placeholder="Title"
                className="w-full rounded border border-gray-300 bg-white p-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

              <textarea
                name="purposeDescription"
                rows={4}
                value={formData.purposeDescription}
                onChange={handleChange}
                placeholder="Description..."
                className="w-full resize-y rounded border border-gray-300 bg-white p-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

            </div>


            {/* What We Offer Box */}

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">

              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                What We Offer Card
              </h3>

              <input
                type="text"
                name="whatWeOfferTitle"
                value={formData.whatWeOfferTitle}
                onChange={handleChange}
                placeholder="Title"
                className="w-full rounded border border-gray-300 bg-white p-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

              <textarea
                name="offersList"
                rows={4}
                value={formData.offersList}
                onChange={handleChange}
                placeholder={"প্রতি লাইনে ১টি পয়েন্ট লিখুন:\nDesigner Abayas\nHijabs & Niqabs"}
                className="w-full resize-y rounded border border-gray-300 bg-white p-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

            </div>


            {/* Why Choose Us Box */}

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">

              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                Why Choose Us Card
              </h3>

              <input
                type="text"
                name="whyChooseTitle"
                value={formData.whyChooseTitle}
                onChange={handleChange}
                placeholder="Title"
                className="w-full rounded border border-gray-300 bg-white p-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

              <textarea
                name="whyChooseList"
                rows={4}
                value={formData.whyChooseList}
                onChange={handleChange}
                placeholder={"প্রতি লাইনে ১টি পয়েন্ট লিখুন:\nPremium Fabric Quality\nCash on Delivery"}
                className="w-full resize-y rounded border border-gray-300 bg-white p-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />

            </div>

          </div>

        </div>


        {/* ================================= */}
        {/* SECTION 3 */}
        {/* ================================= */}

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 md:p-6">

          <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-gray-800 dark:border-slate-800 dark:text-white sm:text-lg">
            3. Bottom Banner (Our Promise)
          </h2>


          <div className="space-y-3">

            <input
              type="text"
              name="promiseTitle"
              value={formData.promiseTitle}
              onChange={handleChange}
              placeholder="Promise Section Title (e.g. Our Promise)"
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />

            <textarea
              name="promiseDescription"
              rows={3}
              value={formData.promiseDescription}
              onChange={handleChange}
              placeholder="Promise Details Text..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-white p-2.5 text-sm leading-relaxed text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />

          </div>

        </div>


        {/* ================================= */}
        {/* MOBILE SAVE BUTTON */}
        {/* ================================= */}

        <div className="pb-2 sm:hidden">

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {saving ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiSave size={18} />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </form>

    </div>
  );
};

export default AboutAdmin;

