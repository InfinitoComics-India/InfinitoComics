import React from 'react'
import JoinUltimate from '../Home/JoinUltimate'
import ReadersFavorites from './ReadersFavorites'
import ArcheryNews from './Archery_News'
import All_news from './All_news'
import FeaturedCharactersCarousel from '../Characters/CharacterCarousel'
import AnimationTeaser from './AnimationTeaser'
import Carousel from './Carousel'

const News = () => {
  return (
    <div>
      <Carousel />
      <ReadersFavorites />
      <ArcheryNews />
      <FeaturedCharactersCarousel />
      <AnimationTeaser />
      <All_news />
      <JoinUltimate />
    </div>
  )
}

export default News