import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LeftPart from './LeftPart';
import Step1 from './RightPart/Step1';
import Step2 from './RightPart/Step2';
import Step3 from './RightPart/Step3';
import Step4 from './RightPart/Step4';
import Step5 from './RightPart/Step5';

const MultiStepWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial step from URL
  const queryParams = new URLSearchParams(location.search);
  const initialStep = parseInt(queryParams.get('step')) || 1;

  const [step, setStep] = useState(initialStep);

  // Update URL when step changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('step', step);
    navigate({ search: params.toString() }, { replace: true });
  }, [step, location.search, navigate]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderRightPart = () => {
    switch (step) {
      case 1: return <Step1 onNext={nextStep} />;
      case 2: return <Step2 onNext={nextStep} onBack={prevStep} />;
      case 3: return <Step3 onNext={nextStep} onBack={prevStep} />;
      case 4: return <Step4 onNext={nextStep} onBack={prevStep} />;
      case 5: return <Step5 onBack={prevStep} />;
      default: return null;
    }
  };

  return (
    <div className='flex justify-center items-center w-full h-screen font-sans mt-10 mb-10'>
      <div className="flex w-3/4 h-screen font-sans">
        {/* Left Part */}
        <div className="w-1/2 bg-gradient-to-b from-[#310303] to-[#000000] text-white p-10 flex flex-col justify-center items-center mr-3">
          <LeftPart />
        </div>

        {/* Right Part */}
        <div className="w-1/2 px-10 mt-[-17rem] flex flex-col justify-center items-center ml-3">
          {renderRightPart()}
        </div>
      </div>
    </div>
  );
};

export default MultiStepWrapper;
