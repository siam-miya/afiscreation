import Image from "next/image"
import img_1 from "../../assets/icons/support_1.png"
import img_2 from "../../assets/icons/support_2.png"
import img_3 from "../../assets/icons/support_3.png"

const OurSupport = () => {
    const supportData = [
        {
            icon: img_1,
            text: "FREE AND FAST DELIVERY",
            description: "Free delivery for all orders over $140"
        },
        {
            icon: img_2,
            text: "24/7 CUSTOMER SERVICE",
            description: "Friendly 24/7 customer support"
        },
        {
            icon: img_3,
            text: "MONEY BACK GUARANTEE",
            description: "We return money within 30 days"
        }
    ]

    return (
        <section className="my-10 md:my-20 w-full">
            <div className="container mx-auto px-4 md:px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 pt-6 pb-10 md:pt-10 md:pb-14">
                    {
                        supportData.map((support, index) => {
                            return (
                                <div key={index} className="flex flex-col items-center justify-center">
                                    <div className="flex justify-center">
                                        <Image
                                            src={support.icon}
                                            width={90}
                                            height={90}
                                            alt="support icon"
                                            className="w-[75px] h-[75px] md:w-[90px] md:h-[90px] bg-black rounded-full p-4 md:p-5 border-[8px] md:border-[10px] border-[#C1C1C1]/30 mx-auto"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="font-semibold font-poppins text-lg md:text-[20px] leading-7 text-black pt-4 md:pt-6 pb-2">
                                            {support.text}
                                        </h2>
                                        <p className="text-sm md:text-[14px] leading-5 font-poppins text-gray-600">
                                            {support.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </section>
    )
}

export default OurSupport