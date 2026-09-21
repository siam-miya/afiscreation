import AboutDetailsSection from '@/components/Main/AboutDetailsSection';
import React from 'react';

export const metadata = {
  title: "About || Afis Creation",
  description: "Afis Creation about page",
};

async function getAboutData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/about`, {
      cache: 'no-store', // ইন্সট্যান্ট আপডেট দেখানোর জন্য ক্যাশিং বন্ধ
    });
    const data = await res.json();
    return data?.success ? data.data : null;
  } catch (error) {
    console.error("Failed to fetch about data:", error);
    return null;
  }
}

const AboutPage = async () => {
  const aboutData = await getAboutData();

  return (
    <div>
      <AboutDetailsSection data={aboutData} />
    </div>
  );
};

export default AboutPage;