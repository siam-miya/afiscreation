
import NewArrivalsProducts from "./NewArrivalsProducts"
import SectionHeading from "./SectionHeading"

const Featured = () => {
  return (
    <section className="mt-8 w-full sm:mt-12 md:mt-20">
      <div className="container mx-auto w-full px-3 sm:px-4 md:px-0">

        <div className="mb-5 flex items-center justify-start sm:mb-7 md:mb-10">
          <SectionHeading
            subHeading={"Featured"}
            heading={"New Arrival"}
            countDown={false}
          />
        </div>

        <div className="w-full">
          <NewArrivalsProducts />
        </div>

      </div>
    </section>
  )
}

export default Featured





