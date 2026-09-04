import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginBackground from '../../../assets/Images/LoginBackground.jpg';
import Bullet from '../../../assets/Images/Bullet.png';
import Riza from '../../../assets/Images/Riza Jose.png';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import SignupStep3 from './SignupStep3';
import SignupStep4 from './SignupStep4';
import SignupStep5 from './SignupStep5';

const SignupWrapper = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialStep = parseInt(queryParams.get('step')) || 1;

  const [step, setStep] = useState(initialStep);
  const [characterColors, setCharacterColors] = useState(null);

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

  // Step navigation
  // 1 → 2 → 3 → 4 → 5
  const goToStep = (s) => setStep(s);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SignupStep1
            formData={formData}
            handleChange={handleChange}
            onNext={() => goToStep(2)}
          />
        );
      case 2:
        return (
          <SignupStep2
            formData={formData}
            handleChange={handleChange}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        );
      case 3:
        return (
          <SignupStep3
            onBack={() => goToStep(2)}
            onNext={() => goToStep(5)}        // Randomise / Continue → skip to completion
            onCustomise={() => goToStep(4)}   // Customise → go to part selector
          />
        );
      case 4:
        return (
          <SignupStep4
            onBack={() => goToStep(3)}
            onConfirm={(colors) => {
              setCharacterColors(colors);
              goToStep(5);
            }}
          />
        );
      case 5:
        return (
          <SignupStep5
            onBack={() => goToStep(3)}
            characterColors={characterColors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden font-sans">
      {/* Background */}
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
              opacity: 0.7,
            }}
          />
        </div>
        <div
          className="h-[30%] w-full"
          style={{ background: 'linear-gradient(to bottom, #111111, #663939)' }}
        />
      </div>

      {/* Characters — visible for steps 1, 2, 3, 4 */}
      {step < 5 && (
        <>
          <img
            src={Bullet}
            alt="Bullet"
            className="absolute bottom-0 h-[80vh] z-40 object-contain pointer-events-none hidden lg:block"
            style={{ left: 'calc(50% - 540px)' }}
          />
          <img
            src={Riza}
            alt="Riza"
            className="absolute bottom-0 h-[80vh] z-40 object-contain pointer-events-none hidden lg:block"
            style={{ right: 'calc(50% - 540px)' }}
          />
        </>
      )}

      {/* Step Form */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        {renderStep()}
      </div>
    </div>
  );
};

export default SignupWrapper;
