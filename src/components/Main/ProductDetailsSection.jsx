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

  // =====================================================
  // CONTACT SETTINGS
  // =====================================================

  const [contactSettings, setContactSettings] = useState({
    enableWhatsapp: false,
    whatsappNumber: '',
    enablePhoneCall: false,
    phoneNumber: '',
  })

  // Custom Measurement
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

  // =====================================================
  // ORDER ON CALL
  // =====================================================

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

        <div className="container mx-auto px-4 py-6 md:py-10">

          {/* =================================================
              TOP PRODUCT NAME
          ================================================= */}

          <div className="mb-6">

            <span className="text-lg font-bold text-gray-900">
              Product Name:{' '}
            </span>

            <span className="text-lg font-normal text-gray-700">
              {product?.title}
            </span>

            {product?.sku && (

              <span className="ml-2 text-sm text-gray-500">

                (SKU: {product.sku})

              </span>

            )}

          </div>


          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-start">


            {/* =================================================
                LEFT SIDE: IMAGES
            ================================================= */}

            <div className="flex flex-col-reverse md:flex-row gap-4">


              {/* Vertical Thumbnails */}

              {productImages.length > 1 && (

                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] pb-2 md:pb-0">

                  {productImages.map(
                    (image, index) => (

                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(index)
                        }
                        className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 ${
                          selectedImage === index
                            ? 'border-orange-500'
                            : 'border-gray-200'
                        }`}
                      >

                        <Image
                          src={image}
                          alt={`${product?.title || 'Product'} ${index + 1}`}
                          fill
                          className="object-contain p-1"
                        />

                      </button>

                    )
                  )}

                </div>

              )}


              {/* Main Image */}

              <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-center min-h-[400px]">

                {currentImage && (

                  <Image
                    src={currentImage}
                    alt={product?.title || 'Product image'}
                    width={600}
                    height={600}
                    priority
                    className="max-h-[450px] w-auto cursor-zoom-in object-contain"
                    onClick={() =>
                      setIsImagePopupOpen(true)
                    }
                  />

                )}


                {productImages.length > 1 && (

                  <>

                    <button
                      type="button"
                      onClick={
                        handlePreviousImage
                      }
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100 border border-gray-100"
                    >

                      <MdOutlineKeyboardArrowLeft
                        size={24}
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        handleNextImage
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100 border border-gray-100"
                    >

                      <MdOutlineKeyboardArrowRight
                        size={24}
                      />

                    </button>

                  </>

                )}

              </div>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="w-full">


              {/* STOCK STATUS */}

              <div className="mb-2">

                {product?.stock > 0 ? (

                  <p className="text-sm font-semibold text-[#00E676]">
                    In Stock
                  </p>

                ) : (

                  <p className="text-sm font-semibold text-red-600">
                    Out of Stock
                  </p>

                )}

              </div>


              {/* =================================================
                  PRICE SECTION
              ================================================= */}

              <div className="mt-2 flex items-center gap-3 flex-wrap">

                <span className="text-3xl font-extrabold text-gray-900">

                  ৳{finalUnitPrice}

                </span>


                {product?.discountPrice > 0 && (

                  <span className="text-lg text-gray-400 line-through">

                    ৳{product.price}

                  </span>

                )}

              </div>


              {/* =================================================
                  SHORT DESCRIPTION
              ================================================= */}

              {product?.shortDescription && (

                <div className="mt-4 text-sm text-gray-600 leading-relaxed">

                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        product.shortDescription
                    }}
                  />

                </div>

              )}


              {/* =================================================
                  COLORS
              ================================================= */}

              {productColors.length > 0 && (

                <div className="mt-6">

                  <h3 className="mb-2 font-semibold text-gray-900 text-sm">

                    Color:{' '}

                    <span className="font-normal text-gray-600 capitalize">

                      {selectedColor}

                    </span>

                  </h3>


                  <div className="flex flex-wrap gap-2">

                    {productColors.map(
                      (color, index) => {

                        const colorName =
                          color?.name ||
                          `Color ${index + 1}`

                        const colorCode =
                          color?.code ||
                          '#cccccc'

                        const isSelected =
                          selectedColorCode ===
                          (
                            color?.code ||
                            color?.name
                          )


                        return (

                          <button
                            key={`${colorName}-${index}`}
                            type="button"
                            onClick={() =>
                              handleColorClick(
                                color
                              )
                            }
                            title={colorName}
                            className={`relative h-8 w-8 rounded-full border transition ${
                              isSelected
                                ? 'border-black ring-2 ring-orange-400'
                                : 'border-gray-300'
                            }`}
                            style={{
                              backgroundColor:
                                colorCode
                            }}
                          />

                        )

                      }
                    )}

                  </div>

                </div>

              )}


              {/* =================================================
                  SIZES
              ================================================= */}

              {productSizes.length > 0 && (

                <div className="mt-6">

                  <div className="mb-2 flex items-center justify-between">

                    <h3 className="font-semibold text-gray-900 text-sm">

                      Size:{' '}

                      <span className="font-normal text-gray-600">

                        {selectedSize}

                      </span>

                    </h3>

                  </div>


                  <div className="flex flex-wrap gap-2">

                    {productSizes.map(
                      (size, index) => (

                        <button
                          key={`${size}-${index}`}
                          type="button"
                          onClick={() =>
                            setSelectedSize(
                              size
                            )
                          }
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                            selectedSize === size
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                          }`}
                        >

                          {size}

                        </button>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* =================================================
                  CUSTOMIZE & SIZE CHART BUTTONS
              ================================================= */}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">


                {/* Customization Button */}

                {isCustomSizeEnabled && (

                  <button
                    type="button"
                    onClick={() =>
                      setShowCustomization(true)
                    }
                    className="flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-orange-500 bg-orange-50 text-orange-600 text-sm font-bold hover:bg-orange-100 transition"
                  >

                    <BiRuler
                      size={18}
                    />

                    {customLength ||
                    customHeight ||
                    customWidth
                      ? 'Customization Added ✓'
                      : 'Custom Product Measurement'}

                  </button>

                )}


                {/* Size Chart Button */}

                <button
                  type="button"
                  onClick={() =>
                    setShowSizeChart(true)
                  }
                  className="flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                >

                  <BiRuler
                    size={18}
                    className="text-orange-500"
                  />

                  Size Chart

                </button>

              </div>


              {/* =================================================
                  QUANTITY & BUY NOW
              ================================================= */}

              <div className="mt-6 flex flex-wrap items-center gap-3">


                {/* Quantity Counter */}

                <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white h-12">

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-full w-10 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  >

                    <FiMinus
                      size={14}
                    />

                  </button>


                  <span className="flex h-full w-10 items-center justify-center text-sm font-semibold text-gray-800">

                    {quantity}

                  </span>


                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      product?.stock > 0 &&
                      quantity >=
                        product.stock
                    }
                    className="flex h-full w-10 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  >

                    <FiPlus
                      size={14}
                    />

                  </button>

                </div>


                {/* Buy Now */}

                <button
                  type="button"
                  onClick={
                    handleBuyNow
                  }
                  disabled={
                    product?.stock <= 0
                  }
                  className="flex-1 h-12 rounded-lg bg-[#f27a1a] px-6 text-sm font-bold text-white shadow hover:bg-[#e06d12] transition disabled:opacity-50"
                >

                  Buy Now

                </button>


                {/* Wishlist */}

                <button
                  type="button"
                  onClick={
                    handleWishlist
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
                >

                  {isWishlisted ? (

                    <FaHeart
                      className="text-red-500"
                      size={18}
                    />

                  ) : (

                    <FaRegHeart
                      size={18}
                    />

                  )}

                </button>

              </div>


              {/* =================================================
                  ADD TO CART
              ================================================= */}

              <div className="mt-3">

                <div className="w-full [&>button]:w-full [&>button]:h-12 [&>button]:rounded-lg [&>button]:bg-black [&>button]:text-white [&>button]:font-bold [&>button]:text-sm">

                  <AddToCartButton
                    product={
                      customizedProduct
                    }

                    selectedColor={
                      selectedColor
                    }

                    selectedColorCode={
                      selectedColorCode
                    }

                    selectedSize={
                      selectedSize
                    }

                    quantity={
                      quantity
                    }

                    customization={{
                      length:
                        customLength || '',

                      height:
                        customHeight || '',

                      width:
                        customWidth || '',
                    }}

                    disabled={
                      product?.stock <= 0
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  WHATSAPP & CALL
              ================================================= */}

              {(contactSettings.enableWhatsapp &&
                contactSettings.whatsappNumber) ||
              (contactSettings.enablePhoneCall &&
                contactSettings.phoneNumber) ? (

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* WhatsApp */}

                  {contactSettings.enableWhatsapp &&
                    contactSettings.whatsappNumber && (

                    <button
                      type="button"
                      onClick={
                        handleWhatsApp
                      }
                      className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-sm hover:opacity-95 transition"
                    >

                      <FaWhatsapp
                        size={20}
                      />

                      WhatsApp Order

                    </button>

                  )}


                  {/* Phone Call */}

                  {contactSettings.enablePhoneCall &&
                    contactSettings.phoneNumber && (

                    <button
                      type="button"
                      onClick={
                        handleOrderOnCall
                      }
                      className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#00B0FF] px-4 text-sm font-bold text-white shadow-sm hover:opacity-95 transition"
                    >

                      <FiPhoneCall
                        size={18}
                      />

                      Order On Call

                    </button>

                  )}

                </div>

              ) : null}

            </div>

          </div>


          {/* =====================================================
              DESCRIPTION & TABS
          ===================================================== */}

          <div className="mt-14 border-t border-gray-200 pt-8">

            <div className="flex border-b border-gray-200">

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    'description'
                  )
                }
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
                  activeTab ===
                  'description'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >

                Product Description

              </button>


              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    'additional'
                  )
                }
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
                  activeTab ===
                  'additional'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >

                Additional Information

              </button>

            </div>


            {activeTab ===
              'description' && (

              <div className="py-6">

                <div
                  className="prose max-w-none text-sm leading-7 text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html:
                      product?.description ||
                      '',
                  }}
                />

              </div>

            )}


            {activeTab ===
              'additional' && (

              <div className="py-6">

                <div className="overflow-hidden rounded-lg border border-gray-200 max-w-xl">

                  {product?.sku && (

                    <div className="grid grid-cols-2 border-b border-gray-200">

                      <div className="bg-gray-50 p-3 text-sm font-semibold">
                        SKU
                      </div>

                      <div className="p-3 text-sm text-gray-600">
                        {product.sku}
                      </div>

                    </div>

                  )}


                  {product?.category && (

                    <div className="grid grid-cols-2 border-b border-gray-200">

                      <div className="bg-gray-50 p-3 text-sm font-semibold">
                        Category
                      </div>

                      <div className="p-3 text-sm text-gray-600">
                        {product.category}
                      </div>

                    </div>

                  )}


                  {productSizes.length > 0 && (

                    <div className="grid grid-cols-2">

                      <div className="bg-gray-50 p-3 text-sm font-semibold">
                        Available Sizes
                      </div>

                      <div className="p-3 text-sm text-gray-600">
                        {productSizes.join(', ')}
                      </div>

                    </div>

                  )}


                  {/* Custom Measurement Info */}

                  {isCustomSizeEnabled && (

                    <div className="grid grid-cols-2 border-t border-gray-200">

                      <div className="bg-gray-50 p-3 text-sm font-semibold">
                        Custom Measurement
                      </div>

                      <div className="p-3 text-sm text-gray-600">

                        Available

                        <span className="block text-xs text-orange-600 mt-1">
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


      {/* =====================================================
          IMAGE POPUP
      ===================================================== */}

      {isImagePopupOpen &&
        currentImage && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            setIsImagePopupOpen(false)
          }
        >

          <div
            className="relative max-h-[90vh] max-w-5xl bg-white p-2 rounded-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <Image
              src={currentImage}
              alt={
                product?.title ||
                'Product image'
              }
              width={1000}
              height={1000}
              className="max-h-[85vh] w-auto object-contain"
            />


            <button
              type="button"
              onClick={() =>
                setIsImagePopupOpen(
                  false
                )
              }
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
            >

              ×

            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          SIZE CHART MODAL
      ===================================================== */}

      {showSizeChart && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() =>
            setShowSizeChart(false)
          }
        >

          <div
            className="relative max-h-[90vh] max-w-3xl overflow-auto rounded-xl bg-white p-4"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setShowSizeChart(false)
              }
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
            >

              ×

            </button>


            {product?.sizeChartImage ? (

              <Image
                src={
                  product.sizeChartImage
                }
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


      {/* =====================================================
          CUSTOMIZATION MODAL
      ===================================================== */}

      {showCustomization && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() =>
            setShowCustomization(false)
          }
        >

          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* Modal Header */}

            <div className="flex items-center justify-between mb-4">

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
                onClick={() =>
                  setShowCustomization(
                    false
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >

                ×

              </button>

            </div>


            <div className="space-y-4">


              {/* =================================================
                  LENGTH
              ================================================= */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">

                  Length

                </label>

                <div className="relative">

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      customLength
                    }
                    onChange={(e) =>
                      setCustomLength(
                        e.target.value
                      )
                    }
                    placeholder={
                      measurementUnit === 'cm'
                        ? 'e.g. 122'
                        : 'e.g. 48'
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 pr-14 text-sm focus:border-orange-500 focus:outline-none"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">

                    {measurementUnit}

                  </span>

                </div>

              </div>


              {/* =================================================
                  HEIGHT
              ================================================= */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">

                  Height

                </label>

                <div className="relative">

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      customHeight
                    }
                    onChange={(e) =>
                      setCustomHeight(
                        e.target.value
                      )
                    }
                    placeholder={
                      measurementUnit === 'cm'
                        ? 'e.g. 165'
                        : 'e.g. 65'
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 pr-14 text-sm focus:border-orange-500 focus:outline-none"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">

                    {measurementUnit}

                  </span>

                </div>

              </div>


              {/* =================================================
                  WIDTH
              ================================================= */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">

                  Width / Chest

                </label>

                <div className="relative">

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      customWidth
                    }
                    onChange={(e) =>
                      setCustomWidth(
                        e.target.value
                      )
                    }
                    placeholder={
                      measurementUnit === 'cm'
                        ? 'e.g. 56'
                        : 'e.g. 22'
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 pr-14 text-sm focus:border-orange-500 focus:outline-none"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">

                    {measurementUnit}

                  </span>

                </div>

              </div>


              {/* =================================================
                  MEASUREMENT SUMMARY
              ================================================= */}

              <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">

                <div className="mb-2 text-sm font-bold text-gray-900">

                  Your Measurements

                </div>

                <div className="space-y-1 text-sm text-gray-600">

                  <div className="flex justify-between">

                    <span>
                      Length
                    </span>

                    <span className="font-semibold text-gray-800">

                      {customLength
                        ? `${customLength} ${measurementUnit}`
                        : 'Not provided'}

                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span>
                      Height
                    </span>

                    <span className="font-semibold text-gray-800">

                      {customHeight
                        ? `${customHeight} ${measurementUnit}`
                        : 'Not provided'}

                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span>
                      Width / Chest
                    </span>

                    <span className="font-semibold text-gray-800">

                      {customWidth
                        ? `${customWidth} ${measurementUnit}`
                        : 'Not provided'}

                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  PRICE INFO
              ================================================= */}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">

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


              {/* =================================================
                  SAVE BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setShowCustomization(
                    false
                  )
                }
                className="w-full h-11 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition mt-2"
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