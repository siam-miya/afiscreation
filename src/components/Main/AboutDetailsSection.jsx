"use client";
import Image from "next/image";
import { BiSolidOffer } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { AiFillFire } from "react-icons/ai";

const AboutDetailsSection = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        No About information uploaded yet.
      </div>
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const imageUrl = data?.aboutImage?.startsWith("http")
    ? data.aboutImage
    : `${BASE_URL}${data?.aboutImage || ""}`;

  return (
    <div className="container mx-auto px-4 py-12 space-y-20 max-w-7xl select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* min-w-0 যোগ করায় টেক্সট গ্রিডের বাইরে যাবে না */}
        <div className="space-y-6 min-w-0">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black break-words">
            {data?.storyTitle || "Our Story"}
          </h1>
          <div className="space-y-4 text-gray-600 text-base leading-relaxed">
            {data?.storyParagraphs?.map((paragraph, index) => (
              /* break-words দিয়ে লম্বা টেক্সট ভেঙে নিচে নেমে যাবে */
              <p key={index} className="break-words">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="w-full h-[350px] md:h-[450px] rounded-tl-[150px] md:rounded-tl-[300px] rounded-br-[100px] md:rounded-br-[200px] relative overflow-hidden bg-pink-100 flex items-center justify-center">
          {data?.aboutImage && (
            <Image 
              src={imageUrl} 
              alt="About Afis Creation" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-100">
        <div className="bg-gray-100 p-6 rounded-xl space-y-3 min-w-0">
          <div className="text-2xl text-primary"><AiFillFire /></div>
          <h3 className="text-lg font-semibold text-black break-words">{data?.purposeTitle || "Our Purpose"}</h3>
          <p className="text-sm text-gray-600 leading-relaxed break-words">
            {data?.purposeDescription}
          </p>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl space-y-3 min-w-0">
          <div className="text-2xl text-primary"><BiSolidOffer /></div>
          <h3 className="text-lg font-semibold text-black break-words">{data?.whatWeOfferTitle || "What We Offer"}</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
            {data?.offersList?.map((item, index) => (
              <li key={index} className="break-words">{item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl space-y-3 min-w-0">
          <div className="text-2xl text-primary"><FaStar /></div>
          <h3 className="text-lg font-semibold text-black break-words">{data?.whyChooseTitle || "Why Afis Creation?"}</h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            {data?.whyChooseList?.map((item, index) => (
              <li key={index} className="flex items-center gap-2 break-words">
                <span>✅</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center w-full mx-auto space-y-4 min-w-0">
        <h3 className="text-xl font-bold text-primary break-words">{data?.promiseTitle || "Our Promise"}</h3>
        <p className="text-black max-w-2xl mx-auto text-sm md:text-base leading-relaxed break-words">
          {data?.promiseDescription}
        </p>
      </div>
    </div>
  );
};

export default AboutDetailsSection;