import React, { useEffect, useState } from 'react';
import BrowsePapers from './BrowsePapers';
import InfinitoCarousel from './InfinitoResearch';
import { researchBrowse } from '../../services/browseService';

const Paper = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Central loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await researchBrowse();
        if (res && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          console.error('Invalid data format');
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      } finally {
        setTimeout(() => setIsLoading(false), 1000); // Optional delay to always show shimmer for 1 sec
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <InfinitoCarousel researchPaper={data} isLoading={isLoading} />
      <BrowsePapers allPapers={data} isLoading={isLoading} />
    </div>
  );
};

export default Paper;
