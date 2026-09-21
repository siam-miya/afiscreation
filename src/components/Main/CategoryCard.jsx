import React from 'react'; 
import { FaShoppingBag } from 'react-icons/fa'; 
 
const CategoryCard = ({ 
  icon, 
  text, 
  isActive 
}) => { 
  return ( 
    <div 
      className={` 
        group 
        relative 
        flex flex-col items-center justify-center 
        border rounded-[4px] 
        cursor-pointer select-none 
        overflow-hidden 
        transition-all duration-300 ease-in-out 
        w-full 
        p-3
        h-[105px] sm:h-[115px] md:h-[145px] 
        ${ 
          isActive 
            ? 'border-primary' 
            : 'border-gray-300' 
        } 
      `} 
    > 
      {icon ? ( 
        <>
          <img 
            src={icon} 
            alt={text} 
            className=" 
              absolute 
              inset-0 
              w-full 
              h-full 
              object-cover 
              transition-transform duration-300 
              group-hover:scale-105 
            " 
            onError={(e) => { 
              console.error( 
                "Category image failed:", 
                icon 
              ); 
              e.currentTarget.style.display = "none"; 
            }} 
          /> 
          <div 
            className={` 
              absolute 
              inset-0 
              transition-all duration-300 
              ${ 
                isActive 
                  ? "bg-black/35" 
                  : "bg-black/20 group-hover:bg-black/35" 
              } 
            `} 
          ></div>
        </>
      ) : ( 
        <div 
          className={` 
            absolute 
            inset-0 
            flex flex-col items-center justify-center gap-2
            bg-gray-100 
            ${ 
              isActive 
                ? "bg-primary" 
                : "group-hover:bg-primary" 
            } 
            transition-colors duration-300 
          `} 
        > 
          <FaShoppingBag 
            className={` 
              w-8 h-8 
              sm:w-9 sm:h-9 
              md:w-12 md:h-12 
              ${ 
                isActive 
                  ? "text-white" 
                  : "text-black group-hover:text-white" 
              } 
              transition-colors duration-300 
            `} 
          /> 
          <p 
            className={` 
              relative 
              z-10 
              font-poppins 
              text-[11px] leading-tight 
              sm:text-xs 
              md:text-base 
              font-medium 
              ${isActive ? "text-white" : "text-black group-hover:text-white"}
              text-center 
              line-clamp-2 
              px-2 
              transition-colors duration-300 
            `} 
          > 
            {text} 
          </p>
        </div> 
      )} 

      {/* যদি ইমেজ থাকে তবে তার ওপর টেক্সট দেখানোর জন্য */}
      {icon && (
        <p 
          className={` 
            relative 
            z-10 
            font-poppins 
            text-[11px] leading-tight 
            sm:text-xs 
            md:text-base 
            font-medium 
            text-white 
            text-center 
            line-clamp-2 
            px-2 
            drop-shadow-md 
            transition-all duration-300 
            group-hover:scale-105 
          `} 
        > 
          {text} 
        </p>
      )}
    </div> 
  ); 
}; 
 
export default CategoryCard;