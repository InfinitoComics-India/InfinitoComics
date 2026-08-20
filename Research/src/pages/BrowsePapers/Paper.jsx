import React, { useEffect, useState } from 'react';
import BrowsePapers from './BrowsePapers';
import InfinitoCarousel from './InfinitoResearch';
import JoinAsResearcher from './JoinAsResearcher';
import { researchBrowse } from '../../services/browseService';

const Paper = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await researchBrowse();
        // API returns { success, message, data: [...] } wrapped in axios response
        const papers = res?.data?.data;
        if (Array.isArray(papers) && papers.length > 0) {
          setData(papers);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <InfinitoCarousel researchPaper={data} isLoading={isLoading} />
      <BrowsePapers allPapers={data} isLoading={isLoading} />
      <JoinAsResearcher />
    </div>
  );
};

export default Paper;
