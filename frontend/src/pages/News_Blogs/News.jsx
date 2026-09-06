import React from 'react'
import JoinUltimate from '../Home/JoinUltimate'
import ArcheryNews from './Archery_News'
import All_news from './All_news'
import FeaturedCharactersCarousel from '../Characters/CharacterCarousel'
import Carousel from './Carousel'

const News = () => {
  return (
    <div>
      <Carousel />
      <ArcheryNews />
      <FeaturedCharactersCarousel />
      <All_news />
      <JoinUltimate />
    </div>
  )
}

export default News