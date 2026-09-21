import ProductDetailsSection from "@/components/Main/ProductDetailsSection";
import SectionHeading from "@/components/Main/SectionHeading";
import SubBanner from "@/components/Main/SubBanner";
import RelatedProductsSlider from "@/components/Main/RelatedProductsSlider";

const SITE_URL = "https://afiscreation.com";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    const res = await fetch(
      `${apiUrl}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (data.success && data.data) {
      const product = data.data;

      const title =
        product.metaTitle ||
        product.title ||
        "Product Details";

      const description =
        product.metaDescription ||
        product.shortDescription ||
        product.description
          ?.replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 160) ||
        "Shop premium abayas and modest fashion from Afis Creation in Bangladesh.";

      const productUrl =
        `${SITE_URL}/products/${product._id}`;

      const productImage =
        product.thumbnail ||
        product.images?.[0] ||
        `${SITE_URL}/og-image.jpg`;

      return {
        title: `${title} | Afis Creation`,

        description,

        keywords: [
          product.title,
          "abaya",
          "borkha",
          "burqa",
          "abaya Bangladesh",
          "borkha Bangladesh",
          "modest fashion",
          "Islamic fashion",
          "Afis Creation",
        ].filter(Boolean),

        alternates: {
          canonical: productUrl,
        },

        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },

        openGraph: {
          type: "website",
          locale: "en_BD",
          url: productUrl,
          siteName: "Afis Creation",

          title: `${title} | Afis Creation`,

          description,

          images: [
            {
              url: productImage,
              alt: product.title,
            },
          ],
        },

        twitter: {
          card: "summary_large_image",

          title: `${title} | Afis Creation`,

          description,

          images: [productImage],
        },
      };
    }

    return {
      title: "Product Details | Afis Creation",
      description:
        "Explore premium abayas and modest fashion from Afis Creation.",
    };
  } catch (error) {
    console.error(
      "Failed to generate product metadata:",
      error
    );

    return {
      title: "Product Details | Afis Creation",

      description:
        "Explore premium abayas and modest fashion from Afis Creation.",
    };
  }
}

const ProductDetailsPage = async ({ params }) => {
  const { id } = await params;

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const res = await fetch(
    `${apiUrl}/api/products/${id}`,
    {
      cache: "no-store",
    }
  );

  const result = await res.json();

  const findData =
    result.success
      ? result.data
      : null;

  if (!findData) {
    return (
      <div className="text-center py-20 font-bold text-red-500">
        Product Not Found!
      </div>
    );
  }

  const relatedRes = await fetch(
    `${apiUrl}/api/products/category/${findData.category}/${findData._id}`,
    {
      cache: "no-store",
    }
  );

  const relatedResult =
    await relatedRes.json();

  const relatedProducts =
    relatedResult.success
      ? relatedResult.data
      : [];

  const productDescription =
    findData.shortDescription ||
    findData.description
      ?.replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim() ||
    findData.title;

  const productImages = [
    findData.thumbnail,
    ...(findData.images || []),
  ].filter(Boolean);

  const productUrl =
    `${SITE_URL}/products/${findData._id}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: findData.title,

    description:
      productDescription,

    image:
      productImages.length > 0
        ? productImages
        : [`${SITE_URL}/og-image.jpg`],

    sku:
      findData.sku || undefined,

    brand: {
      "@type": "Brand",
      name: "Afis Creation",
    },

    url: productUrl,

    offers: {
      "@type": "Offer",

      url: productUrl,

      priceCurrency: "BDT",

      price:
        findData.discountPrice ||
        findData.price ||
        0,

      availability:
        Number(findData.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",
    },
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productSchema
          ),
        }}
      />

      <div>
        <SubBanner
          title={"Product Details"}
          pageName={"Product Details"}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="pt-6">

         

          <div className="mb-10">
            <ProductDetailsSection
              product={findData}
            />
          </div>

          {relatedProducts.length > 0 && (
            <div className="pb-16 w-full overflow-hidden">

              <div className="mb-8">
                <SectionHeading
                  subHeading={"Related Item"}
                  countDown={false}
                />
              </div>

              <RelatedProductsSlider
                relatedProducts={relatedProducts}
              />

            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;