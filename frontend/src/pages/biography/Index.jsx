import { useLocation } from "react-router-dom";
import { useEffect,useState } from "react";
import Biography from './Biography'
import CharacterDetail from './CharacterDetails'
import PowerVision from './PowerVision'
import Banner from "./Banner";
import {getCharacterById} from '../../services/CharacterServices'
const Index = () => {
   const location = useLocation();
  const characterId = location.state; 
  const [character,setCharacter]=useState({});
useEffect(() => {
  const fetchCharacter = async () => {
    if (!characterId) return; 

    try {
      const response = await getCharacterById(characterId);
      setCharacter(response.data)

    } catch (error) {
      console.error("Error fetching character details:", error);
    }
  };
  fetchCharacter();
}, [characterId]);
  return (
    <>
      <Banner character={character}/>
      <Biography character={character}/>
      <PowerVision  character={character}/>
      <CharacterDetail  character={character}/>
    </>
  )
}

export default Index
