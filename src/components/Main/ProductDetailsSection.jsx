'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'
import { FaRegHeart, FaHeart, FaWhatsapp } from 'react-icons/fa'
import { FiMinus, FiPlus, FiPhoneCall } from 'react-icons/fi'
import { BiRuler } from 'react-icons/bi'

import AddToCartButton from '../../components/Main/AddToCartButton'
import { useCartStore } from '../../store/useCartStore'
import { useWishlistStore } from '../../store/useWishlistStore'

const ProductDetailsSection = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedColorCode, setSelectedColorCode] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)

  const [contactSettings, setContactSettings] = useState({
    enableWhatsapp: false,
    whatsappNumber: '',
    enablePhoneCall: false,
    phoneNumber: '',
  })
  const [customLength, setCustomLength] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [customWidth, setCustomWidth] = useState('')

  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const { addToCart } = useCartStore()
  const { wishlist, toggleWishlist } = useWishlistStore()

  const productColors = Array.isArray(product?.colors)
    ? product.colors
    : []

  const productSizes = Array.isArray(product?.sizes)
    ? product.sizes
    : []

  const productImages = Array.from(
    new Set(
      [
        product?.thumbnail,
        ...(product?.images || []),
        ...(product?.colors || []).flatMap((color) =>
          typeof color === 'object' && Array.isArray(color.images)
            ? color.images.filter(Boolean)
            : []
        ),
      ].filter(Boolean)
    )
  )

  const currentImage =
    productImages[selectedImage] ||
    product?.thumbnail

  const isWishlisted = wishlist?.some(
    (item) =>
      item._id === product?._id ||
      item.id === product?._id
  )

  // =====================================================
  // FETCH FLOATING CONTACT SETTINGS
  // =====================================================

  useEffect(() => {

    const fetchContactSettings = async () => {

      try {

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          'http://localhost:5000'

        const res =
          await axios.get(
            `${apiUrl}/api/settings`
          )

        if (
          res.data &&
          res.data.success &&
          res.data.data
        ) {

          const data =
            res.data.data

          setContactSettings({
            enableWhatsapp:
              data.enableWhatsapp === true ||
              data.enableWhatsapp === 'true',

            whatsappNumber:
              data.whatsappNumber ||
              '',

            enablePhoneCall:
              data.enablePhoneCall === true ||
              data.enablePhoneCall === 'true',

            phoneNumber:
              data.phoneNumber ||
              '',
          })

        }

      } catch (error) {

        console.error(
          'Failed to load contact settings:',
          error
        )

      }

    }

    fetchContactSettings()

  }, [])

  // =====================================================
  // CUSTOM SIZE STATUS
  // =====================================================

  const isCustomSizeEnabled =
    product?.hasCustomSize === true ||
    product?.hasCustomSize === 'true' ||
    product?.hasCustomSize === 1 ||
    product?.hasCustomSize === '1'

  const measurementUnit =
    product?.customizationUnit === 'cm'
      ? 'cm'
      : 'inch'

  // =====================================================
  // PRODUCT PRICE
  // =====================================================

  const baseProductPrice =
    Number(product?.discountPrice) > 0
      ? Number(product.discountPrice)
      : Number(product?.price) || 0

  const finalUnitPrice = baseProductPrice

  const customizedProduct = {
    ...product,

    // Normal product price
    price: finalUnitPrice,

    // Keep original discount behavior
    discountPrice: product?.discountPrice || 0,

    // Selected product options
    selectedColor,
    selectedColorCode,
    selectedSize,
    quantity,
    selectedImage: currentImage,

    // Custom measurement info
    customization: {
      length: customLength || '',
      height: customHeight || '',
      width: customWidth || '',
    },
  }

  // =====================================================
  // RESET WHEN PRODUCT CHANGES
  // =====================================================

  useEffect(() => {

    if (product?.thumbnail) {

      const thumbnailIndex =
        productImages.indexOf(
          product.thumbnail
        )

      setSelectedImage(
        thumbnailIndex !== -1
          ? thumbnailIndex
          : 0
      )

    } else {

      setSelectedImage(0)

    }

    setSelectedColor('')
    setSelectedColorCode('')

    if (productSizes.length > 0) {

      setSelectedSize(
        productSizes[0]
      )

    } else {

      setSelectedSize('')

    }

    setQuantity(1)

    setCustomLength('')
    setCustomHeight('')
    setCustomWidth('')

    setShowCustomization(false)

  }, [product])

  // =====================================================
  // COLOR CLICK
  // =====================================================

  const handleColorClick = (color) => {

    setSelectedColor(
      color.name
    )

    setSelectedColorCode(
      color.code ||
      color.name
    )

    if (
      Array.isArray(color.images) &&
      color.images.length > 0
    ) {

      const colorImage =
        color.images[0]

      const imageIndex =
        productImages.indexOf(
          colorImage
        )

      if (imageIndex !== -1) {

        setSelectedImage(
          imageIndex
        )

      }

    }

  }

  // =====================================================
  // IMAGE NAVIGATION
  // =====================================================

  const handlePreviousImage = () => {

    if (
      productImages.length === 0
    ) {
      return
    }

    setSelectedImage(
      (prev) =>
        prev === 0
          ? productImages.length - 1
          : prev - 1
    )

  }

  const handleNextImage = () => {

    if (
      productImages.length === 0
    ) {
      return
    }

    setSelectedImage(
      (prev) =>
        prev ===
        productImages.length - 1
          ? 0
          : prev + 1
    )

  }

  // =====================================================
  // QUANTITY
  // =====================================================

  const increaseQuantity = () => {

    if (
      product?.stock &&
      quantity < product.stock
    ) {

      setQuantity(
        (prev) => prev + 1
      )

    }

  }

  const decreaseQuantity = () => {

    if (quantity > 1) {

      setQuantity(
        (prev) => prev - 1
      )

    }

  }

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleWishlist = () => {

    if (!product) {
      return
    }

    toggleWishlist(product)

  }

  // =====================================================
  // NORMALIZE WHATSAPP NUMBER
  // =====================================================

  const normalizeWhatsappNumber = (
    number
  ) => {

    const raw =
      String(number || '').trim()

    if (!raw) {
      return ''
    }

    let digits =
      raw.replace(/\D/g, '')

    // 018XXXXXXXX
    if (
      digits.startsWith('0')
    ) {

      digits =
        `88${digits}`

    }

    // 18XXXXXXXX
    else if (
      digits.length === 10 &&
      digits.startsWith('1')
    ) {

      digits =
        `880${digits}`

    }

    return digits

  }

  // =====================================================
  // NORMALIZE PHONE NUMBER
  // =====================================================

  const normalizePhoneNumber = (
    number
  ) => {

    const raw =
      String(number || '').trim()

    if (!raw) {
      return ''
    }

    if (
      raw.startsWith('+')
    ) {

      return `+${raw
        .slice(1)
        .replace(/\D/g, '')}`

    }

    let digits =
      raw.replace(/\D/g, '')

    // 018XXXXXXXX
    if (
      digits.startsWith('0')
    ) {

      digits =
        `88${digits}`

    }

    // 18XXXXXXXX
    else if (
      digits.length === 10 &&
      digits.startsWith('1')
    ) {

      digits =
        `880${digits}`

    }

    return `+${digits}`

  }

  // =====================================================
  // WHATSAPP ORDER
  // =====================================================

 const handleWhatsApp = () => {

  if (
    !contactSettings.enableWhatsapp ||
    !contactSettings.whatsappNumber
  ) {

    return

  }

  const whatsappNumber =
    normalizeWhatsappNumber(
      contactSettings.whatsappNumber
    )

  if (!whatsappNumber) {

    return

  }

  const totalPrice =
    baseProductPrice * quantity

  const productLink =
    typeof window !== 'undefined'
      ? window.location.href
      : ''

  const message = `

🛍️ NEW PRODUCT ORDER INQUIRY

━━━━━━━━━━━━━━━━━━

📦 PRODUCT DETAILS

Product: ${product?.title || 'N/A'}

SKU: ${product?.sku || 'N/A'}

Price: ৳${baseProductPrice}

Quantity: ${quantity}

Total: ৳${totalPrice}

━━━━━━━━━━━━━━━━━━

🎨 PRODUCT OPTIONS

Color: ${selectedColor || 'Not selected'}

Color Code: ${selectedColorCode || 'N/A'}

Size: ${selectedSize || 'Not selected'}

━━━━━━━━━━━━━━━━━━

📏 CUSTOM MEASUREMENT

Length: ${
    customLength
      ? `${customLength} ${measurementUnit}`
      : 'Not provided'
  }

Height: ${
    customHeight
      ? `${customHeight} ${measurementUnit}`
      : 'Not provided'
  }

Width / Chest: ${
    customWidth
      ? `${customWidth} ${measurementUnit}`
      : 'Not provided'
  }

━━━━━━━━━━━━━━━━━━

🔗 PRODUCT LINK

${productLink}

━━━━━━━━━━━━━━━━━━

Hello, I want to order this product. Please provide me with the next steps.

`

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`

  window.open(
    whatsappUrl,
    '_blank',
    'noopener,noreferrer'
  )

}

  const handleOrderOnCall = () => {

    if (
      !contactSettings.enablePhoneCall ||
      !contactSettings.phoneNumber
    ) {

      return

    }

    const phoneNumber =
      normalizePhoneNumber(
        contactSettings.phoneNumber
      )

    if (!phoneNumber) {

      return

    }

    window.location.href =
      `tel:${phoneNumber}`

  }

  // =====================================================
  // BUY NOW
  // =====================================================

  const handleBuyNow = () => {

    if (!product) {
      return
    }

    addToCart({
      ...product,

      selectedColor,

      selectedColorCode,

      selectedSize,

      quantity,

      customization: {
        length:
          customLength || '',

        height:
          customHeight || '',

        width:
          customWidth || '',
      },

      selectedImage:
        currentImage,

    })

    window.location.href =
      '/checkout'

  }

  if (!product) {
    return null
  }

  return (
  <>
    <section className="w-full bg-white">
      <div className="container mx-auto px-4 py-5 md:py-8">

        {/* =================================================
            PRODUCT NAME - SCREENSHOT STYLE
        ================================================= */}

        <div className="mb-7">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base md:text-lg font-bold text-gray-900">
              Product Name:
            </span>

            <span className="text-base md:text-lg font-normal text-gray-700">
              {product?.title}
            </span>

            {product?.sku && (
              <span className="text-xs md:text-sm text-gray-400">
                (SKU: {product.sku})
              </span>
            )}
          </div>
        </div>


        {/* =================================================
            MAIN PRODUCT AREA
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-8 xl:gap-14 items-start">


          {/* =================================================
              LEFT SIDE - PRODUCT IMAGE
          ================================================= */}

          <div className="flex flex-col-reverse md:flex-row gap-4">


            {/* =================================================
                THUMBNAILS
            ================================================= */}

            {productImages.length > 1 && (
              <div className="
                flex
                md:flex-col
                gap-2.5
                overflow-x-auto
                md:overflow-y-auto
                md:overflow-x-hidden
                max-h-[510px]
                pb-1
                md:pb-0
                scrollbar-thin
                scrollbar-thumb-gray-200
              ">

                {productImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`
                      relative
                      h-[76px]
                      w-[76px]
                      md:h-[90px]
                      md:w-[90px]
                      flex-shrink-0
                      overflow-hidden
                      bg-white
                      border
                      transition-all
                      duration-200
                      ${
                        selectedImage === index
                          ? 'border-[#f27a1a] shadow-sm'
                          : 'border-gray-200 hover:border-gray-400'
                      }
                    `}
                  >
                    <Image
                      src={image}
                      alt={`${product?.title || 'Product'} ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className="
                relative
                flex-1
                h-[430px]
                md:h-[500px]
                overflow-hidden
                border
                border-gray-200
                bg-white
                flex
                items-center
                justify-center
                group
              "
            >

              {currentImage && (
                <Image
                  src={currentImage}
                  alt={product?.title || 'Product image'}
                  width={700}
                  height={700}
                  priority
                  className="
                    max-h-[410px]
                    md:max-h-[460px]
                    w-auto
                    max-w-[90%]
                    cursor-zoom-in
                    object-contain
                    transition-transform
                    duration-300
                    group-hover:scale-[1.02]
                  "
                  onClick={() => setIsImagePopupOpen(true)}
                />
              )}


              {/* IMAGE ARROWS */}

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      bg-white
                      border
                      border-gray-200
                      text-gray-700
                      shadow-sm
                      opacity-0
                      group-hover:opacity-100
                      transition-all
                      hover:bg-gray-50
                    "
                  >
                    <MdOutlineKeyboardArrowLeft size={24} />
                  </button>


                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      bg-white
                      border
                      border-gray-200
                      text-gray-700
                      shadow-sm
                      opacity-0
                      group-hover:opacity-100
                      transition-all
                      hover:bg-gray-50
                    "
                  >
                    <MdOutlineKeyboardArrowRight size={24} />
                  </button>
                </>
              )}

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE - PRODUCT INFORMATION
          ================================================= */}

          <div className="w-full lg:pt-1">


            {/* PRODUCT TITLE */}

            <h1 className="
              text-[27px]
              md:text-[30px]
              lg:text-[32px]
              leading-tight
              font-bold
              tracking-[-0.5px]
              text-gray-950
            ">
              {product?.title}
            </h1>


            {/* STOCK */}

            <div className="mt-3">
              {product?.stock > 0 ? (
                <p className="text-sm font-medium text-[#00c853]">
                  In Stock
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600">
                  Out of Stock
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">

              <span className="
                text-[28px]
                md:text-[30px]
                font-extrabold
                tracking-tight
                text-gray-950
              ">
                ৳{finalUnitPrice}
              </span>

              {product?.discountPrice > 0 && (
                <span className="text-base text-gray-400 line-through">
                  ৳{product.price}
                </span>
              )}

            </div>


            {/* =================================================
                SHORT DESCRIPTION
            ================================================= */}

            {product?.shortDescription && (
              <div className="
                mt-5
                max-w-xl
                text-sm
                leading-6
                text-gray-500
              ">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.shortDescription,
                  }}
                />
              </div>
            )}


            {/* =================================================
                COLORS
            ================================================= */}

            {productColors.length > 0 && (
              <div className="mt-6">

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Color:{' '}
                  <span className="font-normal text-gray-500 capitalize">
                    {selectedColor}
                  </span>
                </h3>

                <div className="flex flex-wrap gap-2.5">

                  {productColors.map((color, index) => {
                    const colorName =
                      color?.name || `Color ${index + 1}`

                    const colorCode =
                      color?.code || '#cccccc'

                    const isSelected =
                      selectedColorCode ===
                      (color?.code || color?.name)

                    return (
                      <button
                        key={`${colorName}-${index}`}
                        type="button"
                        onClick={() => handleColorClick(color)}
                        title={colorName}
                        className={`
                          relative
                          h-8
                          w-8
                          rounded-full
                          border
                          transition-all
                          cursor-pointer
                          ${
                            isSelected
                              ? 'border-gray-900 ring-2 ring-[#f27a1a] ring-offset-1'
                              : 'border-gray-300 hover:border-gray-500'
                          }
                        `}
                        style={{
                          backgroundColor: colorCode,
                        }}
                      />
                    )
                  })}

                </div>
              </div>
            )}

            {productSizes.length > 0 && (
              <div className="mt-6">

                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Size:{' '}
                    <span className="font-normal text-gray-500">
                      {selectedSize}
                    </span>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">

                  {productSizes.map((size, index) => (
                    <button
                      key={`${size}-${index}`}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`
                        min-w-[42px]
                        h-9
                        px-3
                        border
                        text-xs
                        font-medium
                        transition-all
                        cursor-pointer
                        ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-gray-500'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}

                </div>
              </div>
            )}

            {(isCustomSizeEnabled || product?.sizeChartImage) && (
              <div className="
                mt-6
                flex
                flex-wrap
                gap-3
              ">

                {isCustomSizeEnabled && (
                  <button
                    type="button"
                    onClick={() => setShowCustomization(true)}
                    className="
                      h-10
                      px-4
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-primary
                      text-white
                      text-xs
                      font-bold
                      hover:bg-secondary
                      hover:border-0
                      transition
                      cursor-pointer
                    "
                  >
                    <BiRuler size={17} />

                    {customLength ||
                    customHeight ||
                    customWidth
                      ? 'Customization Added'
                      : 'Custom Measurement'}
                  </button>
                )}


                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="
                    h-10
                    px-4
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-gray-300
                    bg-white
                    text-gray-700
                    text-xs
                    font-bold
                    hover:border-gray-500
                    transition
                    cursor-pointer
                  "
                >
                  <BiRuler
                    size={17}
                    className="text-[#f27a1a]"
                  />

                  Size Chart
                </button>

              </div>
            )}

            <div className="
              mt-7
              flex
              items-stretch
              gap-3
            ">
              <div className="
                flex
                h-12
                shrink-0
                items-center
                border
                border-gray-300
                bg-white
              ">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="
                    flex
                    h-full
                    w-10
                    items-center
                    justify-center
                    text-white
                    bg-secondary
                    disabled:opacity-40
                    cursor-pointer
                  "
                >
                  <FiMinus size={14} />
                </button>
                <span className="
                  flex
                  h-full
                  w-10
                  items-center
                  justify-center
                  border-x
                  border-gray-200
                  text-sm
                  font-semibold
                  text-gray-900
                ">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    product?.stock > 0 &&
                    quantity >= product.stock
                  }
                  className="
                    flex
                    h-full
                    w-10
                    items-center
                    justify-center
                    text-white
                    hover:bg-secondary
                    disabled:opacity-40
                    cursor-pointer
                    bg-primary
                  "
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product?.stock <= 0}
                className="
                  flex-1
                  h-12
                  min-w-[130px]
                  bg-primary
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition-all
                  hover:bg-secondary
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  cursor-pointer
                "
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  border
                  border-gray-300
                  bg-white
                  text-gray-700
                  transition
                  hover:border-gray-500
                  hover:bg-gray-50
                "
              >
                {isWishlisted ? (
                  <FaHeart
                    className="text-red-500"
                    size={18}
                  />
                ) : (
                  <FaRegHeart size={18} />
                )}
              </button>

            </div>

            <div className="mt-3">

              <div className="
                w-full
                [&>button]:w-full
                [&>button]:h-12
                [&>button]:rounded-none
                [&>button]:bg-black
                [&>button]:text-white
                [&>button]:font-bold
                [&>button]:text-sm
                [&>button]:transition
                [&>button:hover]:bg-gray-900
              ">

                <AddToCartButton
                  product={customizedProduct}
                  selectedColor={selectedColor}
                  selectedColorCode={selectedColorCode}
                  selectedSize={selectedSize}
                  quantity={quantity}
                  customization={{
                    length: customLength || '',
                    height: customHeight || '',
                    width: customWidth || '',
                  }}
                  disabled={product?.stock <= 0}
                />

              </div>

            </div>

            {(contactSettings.enableWhatsapp &&
              contactSettings.whatsappNumber) ||
            (contactSettings.enablePhoneCall &&
              contactSettings.phoneNumber) ? (

              <div className="
                mt-3
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
              ">

                {contactSettings.enableWhatsapp &&
                  contactSettings.whatsappNumber && (
                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="
                        flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        bg-[#25D366]
                        px-4
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:brightness-95
                        cursor-pointer
                      "
                    >
                      <FaWhatsapp size={19} />
                      WhatsApp Order
                    </button>
                  )}


                {contactSettings.enablePhoneCall &&
                  contactSettings.phoneNumber && (
                    <button
                      type="button"
                      onClick={handleOrderOnCall}
                      className="
                        flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        bg-[#00B0FF]
                        px-4
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:brightness-95
                        cursor-pointer
                      "
                    >
                      <FiPhoneCall size={18} />
                      Order On Call
                    </button>
                  )}

              </div>

            ) : null}

          </div>

        </div>

        <div className="mt-14 border-t border-gray-200 pt-8">

          <div className="flex overflow-x-auto border-b border-gray-200">

            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`
                shrink-0
                px-5
                pb-3
                text-sm
                font-bold
                border-b-2
                transition
                cursor-pointer
                ${
                  activeTab === 'description'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }
              `}
            >
              Product Description
            </button>


            <button
              type="button"
              onClick={() => setActiveTab('additional')}
              className={`
                shrink-0
                px-5
                pb-3
                text-sm
                font-bold
                border-b-2
                transition
                cursor-pointer
                ${
                  activeTab === 'additional'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }
              `}
            >
              Additional Information
            </button>

          </div>

          {activeTab === 'description' && (
            <div className="py-7">

              <div
                className="
                  prose
                  prose-sm
                  max-w-none
                  text-gray-600
                  leading-7
                  prose-headings:text-gray-900
                  prose-a:text-primary
                "
                dangerouslySetInnerHTML={{
                  __html: product?.description || '',
                }}
              />

            </div>
          )}


          {/* ADDITIONAL INFORMATION */}

          {activeTab === 'additional' && (
            <div className="py-7">

              <div className="
                overflow-hidden
                border
                border-gray-200
                max-w-2xl
              ">

                {product?.sku && (
                  <div className="grid grid-cols-2 border-b border-gray-200">

                    <div className="
                      bg-gray-50
                      p-3
                      text-sm
                      font-semibold
                      text-gray-800
                    ">
                      SKU
                    </div>

                    <div className="
                      p-3
                      text-sm
                      text-gray-600
                    ">
                      {product.sku}
                    </div>

                  </div>
                )}


                {product?.category && (
                  <div className="grid grid-cols-2 border-b border-gray-200">

                    <div className="
                      bg-gray-50
                      p-3
                      text-sm
                      font-semibold
                      text-gray-800
                    ">
                      Category
                    </div>

                    <div className="
                      p-3
                      text-sm
                      text-gray-600
                    ">
                      {product.category}
                    </div>

                  </div>
                )}


                {productSizes.length > 0 && (
                  <div className="grid grid-cols-2 border-b border-gray-200">

                    <div className="
                      bg-gray-50
                      p-3
                      text-sm
                      font-semibold
                      text-gray-800
                    ">
                      Available Sizes
                    </div>

                    <div className="
                      p-3
                      text-sm
                      text-gray-600
                    ">
                      {productSizes.join(', ')}
                    </div>

                  </div>
                )}


                {isCustomSizeEnabled && (
                  <div className="grid grid-cols-2">

                    <div className="
                      bg-gray-50
                      p-3
                      text-sm
                      font-semibold
                      text-gray-800
                    ">
                      Custom Measurement
                    </div>

                    <div className="
                      p-3
                      text-sm
                      text-gray-600
                    ">
                      Available

                      <span className="
                        block
                        mt-1
                        text-xs
                        text-primary
                      ">
                        Unit: {measurementUnit}
                      </span>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>
    </section>

    {isImagePopupOpen && currentImage && (
      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/80
          p-4
        "
        onClick={() => setIsImagePopupOpen(false)}
      >

        <div
          className="
            relative
            max-h-[90vh]
            max-w-5xl
            bg-white
            p-2
          "
          onClick={(e) => e.stopPropagation()}
        >

          <Image
            src={currentImage}
            alt={product?.title || 'Product image'}
            width={1000}
            height={1000}
            className="
              max-h-[85vh]
              w-auto
              object-contain
            "
          />

          <button
            type="button"
            onClick={() => setIsImagePopupOpen(false)}
            className="
              absolute
              right-2
              top-2
              flex
              h-8
              w-8
              items-center
              justify-center
              bg-black
              text-white
              text-lg
            "
          >
            ×
          </button>

        </div>

      </div>
    )}

    {showSizeChart && (
      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/70
          p-4
        "
        onClick={() => setShowSizeChart(false)}
      >

        <div
          className="
            relative
            max-h-[90vh]
            max-w-3xl
            overflow-auto
            bg-white
            p-4
          "
          onClick={(e) => e.stopPropagation()}
        >

          <button
            type="button"
            onClick={() => setShowSizeChart(false)}
            className="
              absolute
              right-3
              top-3
              z-10
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-black
              text-white
            "
          >
            ×
          </button>


          {product?.sizeChartImage ? (
            <Image
              src={product.sizeChartImage}
              alt="Size chart"
              width={1000}
              height={1000}
              className="h-auto w-full object-contain"
            />
          ) : (
            <div className="p-8 text-center text-gray-500">
              No size chart available for this product.
            </div>
          )}

        </div>

      </div>
    )}

    {showCustomization && (
      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/70
          p-4
        "
        onClick={() => setShowCustomization(false)}
      >

        <div
          className="
            relative
            w-full
            max-w-md
            bg-white
            p-6
            shadow-xl
          "
          onClick={(e) => e.stopPropagation()}
        >

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Custom Measurement
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Enter your measurement in {measurementUnit}
              </p>
            </div>


            <button
              type="button"
              onClick={() => setShowCustomization(false)}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                bg-gray-100
                text-gray-700
                hover:bg-gray-200
              "
            >
              ×
            </button>

          </div>


          <div className="space-y-4">

            {/* LENGTH */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Length
              </label>

              <div className="relative">

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customLength}
                  onChange={(e) =>
                    setCustomLength(e.target.value)
                  }
                  placeholder={
                    measurementUnit === 'cm'
                      ? 'e.g. 122'
                      : 'e.g. 48'
                  }
                  className="
                    w-full
                    border
                    border-gray-300
                    p-2.5
                    pr-14
                    text-sm
                    focus:border-primary
                    focus:outline-none
                  "
                />

                <span className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  font-medium
                  text-gray-500
                ">
                  {measurementUnit}
                </span>

              </div>

            </div>


            {/* HEIGHT */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Height
              </label>

              <div className="relative">

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customHeight}
                  onChange={(e) =>
                    setCustomHeight(e.target.value)
                  }
                  placeholder={
                    measurementUnit === 'cm'
                      ? 'e.g. 165'
                      : 'e.g. 65'
                  }
                  className="
                    w-full
                    border
                    border-gray-300
                    p-2.5
                    pr-14
                    text-sm
                    focus:border-primary
                    focus:outline-none
                  "
                />

                <span className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  font-medium
                  text-gray-500
                ">
                  {measurementUnit}
                </span>

              </div>

            </div>


            {/* WIDTH */}

            <div>

              <label className="
                mb-1
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Width / Chest
              </label>

              <div className="relative">

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customWidth}
                  onChange={(e) =>
                    setCustomWidth(e.target.value)
                  }
                  placeholder={
                    measurementUnit === 'cm'
                      ? 'e.g. 56'
                      : 'e.g. 22'
                  }
                  className="
                    w-full
                    border
                    border-gray-300
                    p-2.5
                    pr-14
                    text-sm
                    focus:border-primary
                    focus:outline-none
                  "
                />

                <span className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  font-medium
                  text-gray-500
                ">
                  {measurementUnit}
                </span>

              </div>

            </div>


            {/* SUMMARY */}

            <div className="
              border
              border-orange-100
              bg-orange-50
              p-3
            ">

              <div className="
                mb-2
                text-sm
                font-bold
                text-gray-900
              ">
                Your Measurements
              </div>

              <div className="space-y-1 text-sm text-gray-600">

                <div className="flex justify-between">
                  <span>Length</span>

                  <span className="font-semibold text-gray-800">
                    {customLength
                      ? `${customLength} ${measurementUnit}`
                      : 'Not provided'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Height</span>

                  <span className="font-semibold text-gray-800">
                    {customHeight
                      ? `${customHeight} ${measurementUnit}`
                      : 'Not provided'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Width / Chest</span>

                  <span className="font-semibold text-gray-800">
                    {customWidth
                      ? `${customWidth} ${measurementUnit}`
                      : 'Not provided'}
                  </span>
                </div>

              </div>

            </div>


            {/* PRICE */}

            <div className="
              border
              border-gray-200
              bg-gray-50
              p-3
            ">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-600">
                  Product Price
                </span>

                <span className="font-bold text-gray-900">
                  ৳{baseProductPrice}
                </span>

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Custom measurement-এর জন্য বর্তমানে কোনো extra charge নেই।
              </p>

            </div>


            {/* SAVE */}

            <button
              type="button"
              onClick={() => setShowCustomization(false)}
              className="
                mt-2
                h-11
                w-full
                bg-primary
                text-sm
                font-bold
                text-white
                transition
                hover:bg-secondary
              "
            >
              Save Measurements
            </button>

          </div>

        </div>

      </div>
    )}

  </>
)
}

export default ProductDetailsSection