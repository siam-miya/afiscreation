const Button = ({ children, type = "button", TagName = "button", className = "", ...props }) => {
  return (
    <TagName
      {...props}
      className={`
        inline-flex items-center justify-center
        text-[#FAFAFA] 
        bg-primary 
        py-2 px-4 
        sm:py-2.5 sm:px-5 
        md:py-3 md:px-7 
        border-none 
        cursor-pointer 
        text-center 
        font-poppins 
        font-medium 
        text-xs sm:text-sm md:text-base 
        leading-normal md:leading-6 
        hover:text-white 
        hover:bg-secondary 
        transition-all 
        rounded-tr-xl rounded-bl-xl 
        sm:rounded-tr-2xl sm:rounded-bl-2xl 
        md:rounded-tr-4xl md:rounded-bl-4xl
        ${className}
      `}
      type={TagName === "button" ? type : undefined}
    >
      {children}
    </TagName>
  )
}

export default Button;