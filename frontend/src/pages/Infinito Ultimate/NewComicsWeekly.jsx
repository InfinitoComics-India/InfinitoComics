import React from 'react'
import ComicCard from './ComicCard'

const NewComicsWeekly = () => {
  return (
    <div className='w-full flex flex-col items-center justify-center py-16 my-12 '>
        <div className="w-11/12 md:w-2/3 text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#000000]">
          New Comics Weekly
        </h2>
        <p className="text-md md:text-lg leading-relaxed text-[#000000]">
          Get first access to all new Infinito titles every Friday — fresh issues, universe crossovers, and more.
        </p>
      </div>
      <div className='w-5/6'>
        <ComicCard />
      </div>
      
    </div>
  )
}

export default NewComicsWeekly
