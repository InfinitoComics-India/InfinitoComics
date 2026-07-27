import CharacterCarousel from "./CharacterCarousel"
import CharacterSpotlight from "./CharacterSpotlight"
import FavCharacter from './FavCharacter'
import OurTeam from './OurTeam'
import HeroVillainSplit from './HeroVillainSplit'
import BrowseCharacter from './BrowseCharacter'
const index = () => {
  return (
    <div>
      <CharacterSpotlight/>
      <CharacterCarousel/>
      {/* <FavCharacter/> */}
      {/* <OurTeam/> */}
      {/* <HeroVillainSplit/> */}
      <BrowseCharacter/>
    </div>
  )
}

export default index
