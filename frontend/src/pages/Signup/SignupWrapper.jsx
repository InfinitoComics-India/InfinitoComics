import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginBackground from '../../../assets/Images/LoginBackground.jpg';
import Bullet from '../../../assets/Images/Bullet.png';
import Riza from '../../../assets/Images/Riza Jose.png';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import SignupStep5 from './SignupStep5';

const SignupWrapper = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStep = parseInt(queryParams.get('step')) || 1;

  const [step, setStep] = useState(initialStep);

  const nextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(5); // Skip steps 3 and 4, go directly to 5
    }
  };

  const prevStep = () => {
    if (step === 5) {
      setStep(2); // Go back from 5 to 2
    } else if (step === 2) {
      setStep(1);
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    dob: '',
    username: '',
    newsLetter: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SignupStep1
            formData={formData}
            handleChange={handleChange}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <SignupStep2
            formData={formData}
            handleChange={handleChange}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return <SignupStep5 onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      {/* Background Section */}
      <div className="absolute inset-0 z-0 flex flex-col">
        <div className="h-[70%] w-full relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${LoginBackground})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, #310303, #000000)',
              opacity: 0.7
            }}
          />
        </div>
        <div
          className="h-[30%] w-full"
          style={{ background: 'linear-gradient(to bottom, #111111, #663939)' }}
        />
      </div>

      {/* Characters (only visible for steps 1 and 2) */}
      {/* {step < 5 && (
        <>
          <img
            src={Bullet}
            alt="Bullet"
            className="absolute left-56 bottom-8 h-[700px] z-50 object-contain pointer-events-none"
          />
          <img
            src={Riza}
            alt="Riza"
            className="absolute right-48 bottom-8 h-[700px] z-50 object-contain pointer-events-none"
          />
        </>
      )} */}

      {/* Step Form */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        {renderStep()}
      </div>
    </div>
  );
};

export default SignupWrapper;