import React from 'react'
import ComingSoon from '../../components/comingSoon/comingSoon'
const Games = () => {
    const comingSoonActive = true;

    if (comingSoonActive) {
        return <ComingSoon />;
    }
  return (
    <div>Games</div>
  )
}

export default Games