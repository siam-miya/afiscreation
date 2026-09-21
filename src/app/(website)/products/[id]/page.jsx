import ProductDetailsSection from "@/components/Main/ProductDetailsSection";
import SectionHeading from "@/components/Main/SectionHeading";
import SubBanner from "@/components/Main/SubBanner";
import RelatedProductsSlider from "@/components/Main/RelatedProductsSlider"; 

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/products/${id}`, { cache: 'no-store' });
    const data = await res.json();
    
    if (data.success && data.data) {
      const product = data.data;
      return {
        // ব্যাকএন্ডে দেওয়া metaTitle বা প্রোডাক্টের title ব্যবহার করা হচ্ছে
        title: product.metaTitle ? `${product.metaTitle} || Afis Creation` : `${product.title} || Afis Creation`,
        description: product.metaDescription || product.description?.substring(0, 150) || "Afis Creation product details page",
      };
    }
    return { title: "Product Details || Afis Creation" };
  } catch {
    return { title: "Product Details || Afis Creation" };
  }
}

const ProductDetailsPage = async ({ params }) => {
  const { id } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${apiUrl}/api/products/${id}`, { cache: 'no-store' });
  const result = await res.json();
  const findData = result.success ? result.data : null;

  if (!findData) {
    return <div className="text-center py-20 font-bold text-red-500">Product Not Found!</div>;
  }
  const relatedRes = await fetch(`${apiUrl}/api/products/category/${findData.category}/${findData._id}`, { cache: 'no-store' });
  const relatedResult = await relatedRes.json();
  const relatedProducts = relatedResult.success ? relatedResult.data : [];

  return (
    <section>
      <div>
        <SubBanner title={"Product Details"} pageName={"Product Details"}/>
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="pt-6">
          <p className="hidden md:block text-black font-semibold mb-6">
            <span className="font-bold text-black">Product Name:</span> {findData.title}
            {findData.sku && <span className="ml-4 text-xs text-gray-500 font-normal">(SKU: {findData.sku})</span>}
          </p>
          
          <div className="mb-10">
            <ProductDetailsSection product={findData} />
          </div>
          
          {relatedProducts.length > 0 && (
            <div className="pb-16 w-full overflow-hidden">
              <div className="mb-8">
                <SectionHeading subHeading={"Related Item"} countDown={false}/>
              </div>
              <RelatedProductsSlider relatedProducts={relatedProducts} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;