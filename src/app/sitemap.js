const SITE_URL = "https://afiscreation.com";

export default async function sitemap() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const sitemapEntries = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const res = await fetch(
      `${apiUrl}/api/products?limit=1000&page=1`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return sitemapEntries;
    }

    const result = await res.json();

    const products =
      result.data ||
      result.products ||
      [];

    if (!Array.isArray(products)) {
      return sitemapEntries;
    }

    const productEntries = products
      .filter(
        (product) =>
          product &&
          (product._id || product.id)
      )
      .map((product) => {
        const productId =
          product._id ||
          product.id;

        return {
          url: `${SITE_URL}/products/${productId}`,
          lastModified:
            product.updatedAt
              ? new Date(product.updatedAt)
              : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        };
      });

    return [
      ...sitemapEntries,
      ...productEntries,
    ];

  } catch (error) {
    console.error(
      "Sitemap generation error:",
      error
    );

    return sitemapEntries;
  }
}