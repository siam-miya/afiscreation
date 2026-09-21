import ContactFormSection from "@/components/Main/ContacFormSection";
import SubBanner from "@/components/Main/SubBanner";

export const metadata = {
  title: "Contact || Afis Creation",
  description: "Afis Creation contact page",
};

async function getContactInfo() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/contact/info`, { cache: 'no-store' });
    const data = await res.json();
    return data?.success ? data.data : null;
  } catch (error) {
    console.error("Failed to fetch contact info:", error);
    return null;
  }
}

const Contact = async () => {
  const contactInfo = await getContactInfo();

  return (
    <section>
      <div>
        <SubBanner title={"Contact"} pageName={"Contact"} />
      </div>
      <div className="container mx-auto">
        <div>
          <ContactFormSection contactInfo={contactInfo} />
        </div>
      </div>
    </section>
  );
};

export default Contact;