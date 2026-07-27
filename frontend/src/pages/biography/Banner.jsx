import React from 'react'

const Banner = ({character}) => {
  return (
  <div className="w-full min-h-[300px] md:min-h-[600px]">
      <img
        src={character.mainLandscapeImageUrl}
        alt="banner"
        className="w-full h-[300px] md:h-[600px] object-cover object-center"
      />
    </div>
  )
}

export default Banner
