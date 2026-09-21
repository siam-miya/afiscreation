import React from 'react'
import CountdownTimer from './CountDownTimer'

const SectionHeading = ({
  subHeading,
  heading,
  countDown = false,
  navigationButtons
}) => {
  return (
    <div className="w-full">

      <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="h-5 w-2 rounded-[4px] bg-primary sm:h-6 sm:w-3"></span>

          <span className="font-poppins text-xs font-bold uppercase tracking-wider text-primary sm:text-sm">
            {subHeading}
          </span>
        </div>

        <h2 className="font-inter text-2xl font-bold tracking-tight text-secondary sm:text-[28px] md:text-[32px]">
          {heading}
        </h2>
      </div>

      {countDown && (
        <div className="flex w-full flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pt-5">

          <div className="flex min-w-0 w-full justify-center sm:flex-1 sm:justify-start">
            <CountdownTimer />
          </div>

          {navigationButtons && (
            <div className="flex shrink-0 justify-center sm:justify-end">
              {navigationButtons}
            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default SectionHeading