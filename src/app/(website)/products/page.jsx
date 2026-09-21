import ProductCard from "@/components/Main/ProductCard";
import ProductToolbar from "@/components/Main/ProductToolbar";
import SubBanner from "@/components/Main/SubBanner";
import Pagination from "@/components/Main/Pagination";
import FilterProduct from "@/components/Main/FilterProduct";

export const metadata = {
  title: "All Products || Afis Creation",
  description: "Afis Creation all products page",
};

const ProductsPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;

  const selectedCategory =
    resolvedSearchParams.category || "all";

  const selectedColor =
    resolvedSearchParams.color || "all";

  const sortBy =
    resolvedSearchParams.sort || "default";

  const limit =
    parseInt(
      resolvedSearchParams.limit || "16",
      10
    );

  const currentPage =
    parseInt(
      resolvedSearchParams.page || "1",
      10
    );

  const minPrice =
    resolvedSearchParams.minPrice || "";

  const maxPrice =
    resolvedSearchParams.maxPrice || "";

  const view =
    resolvedSearchParams.view || "4";

  let productsData = [];
  let totalResults = 0;

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    const queryParams =
      new URLSearchParams();

    if (
      selectedCategory !== "all"
    ) {
      queryParams.append(
        "category",
        selectedCategory
      );
    }

    // =================================================
    // Color Filter
    // =================================================

    if (
      selectedColor !== "all"
    ) {
      queryParams.append(
        "color",
        selectedColor
      );
    }

    // =================================================
    // Price Filter
    // =================================================

    if (minPrice) {
      queryParams.append(
        "minPrice",
        minPrice
      );
    }

    if (maxPrice) {
      queryParams.append(
        "maxPrice",
        maxPrice
      );
    }

    // =================================================
    // Sorting
    // =================================================

    if (
      sortBy !== "default"
    ) {
      queryParams.append(
        "sort",
        sortBy
      );
    }

    // =================================================
    // Pagination
    // =================================================

    queryParams.append(
      "page",
      currentPage.toString()
    );

    queryParams.append(
      "limit",
      limit.toString()
    );

    // =================================================
    // Fetch Products
    // =================================================

    const res = await fetch(
      `${apiUrl}/api/products?${queryParams.toString()}`,
      {
        cache: "no-store",
      }
    );

    const result =
      await res.json();

    productsData =
      result.data ||
      result.products ||
      [];

    if (
      !Array.isArray(
        productsData
      )
    ) {
      productsData = [];
    }

    // Backend-এর total ব্যবহার করতে হবে
    totalResults =
      Number(
        result.total
      ) || 0;

  } catch (error) {

    console.error(
      "Error fetching products from backend:",
      error
    );

    productsData = [];
    totalResults = 0;
  }

  // Current page-এ কয়টা product এসেছে
  const currentShowing =
    productsData.length;

  return (
    <section className="w-full overflow-x-hidden">

      <div className="w-full">
        <SubBanner
          title={"All Products"}
          pageName={"Products"}
        />
      </div>

      <div className="container mx-auto w-full px-3 pt-5 sm:px-4 sm:pt-6 md:px-0 md:pt-10">

        <div className="w-full pb-12 sm:pb-16 md:pb-26">

          <ProductToolbar
            totalProducts={totalResults}
            currentShowing={currentShowing}
          />

          <div className="mt-5 grid w-full grid-cols-1 items-start gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-4 lg:gap-8">

            {/* Left Sidebar */}
            <div className="relative z-20 w-full min-w-0 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
              <FilterProduct />
            </div>

            {/* Right Side: Products Grid */}
            <div className="w-full min-w-0 lg:col-span-3">

              <div
                className={`grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4 md:gap-6 ${
                  view === "5"
                    ? "md:grid-cols-3 lg:grid-cols-4"
                    : "md:grid-cols-2 lg:grid-cols-3"
                }`}
              >

                {productsData.length > 0 ? (

                  productsData.map(
                    (product) => (
                      <div
                        key={
                          product._id ||
                          product.id
                        }
                        className="flex w-full min-w-0"
                      >
                        <ProductCard
                          product={product}
                        />
                      </div>
                    )
                  )

                ) : (

                  <div className="col-span-full flex w-full flex-col items-center justify-center py-16 text-center sm:py-20">

                    <p className="text-base font-medium text-gray-500 sm:text-lg md:text-2xl">
                      Product Not Found
                    </p>

                  </div>

                )}

              </div>

              {/* Pagination */}
              {totalResults > limit && (
                <div className="mt-7 w-full sm:mt-8 md:mt-12">

                  <Pagination
                    totalProducts={
                      totalResults
                    }
                    limit={limit}
                    currentPage={
                      currentPage
                    }
                  />

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default ProductsPage;

