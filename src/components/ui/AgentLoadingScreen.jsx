import { useState, useEffect } from 'react';
import './AgentLoadingScreen.css';

const ANALYSIS_STEPS = [
  { id: 1, text: 'Cloning repository...', duration: 2000 },
  { id: 2, text: 'Analyzing code structure...', duration: 3000 },
  { id: 3, text: 'Scanning for errors and vulnerabilities...', duration: 3500 },
  { id: 4, text: 'Running static analysis...', duration: 2500 },
  { id: 5, text: 'Generating fix suggestions...', duration: 3000 },
  { id: 6, text: 'Writing summary report...', duration: 2000 },
];

export const AgentLoadingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length) {
      setTimeout(() => onComplete(), 1000);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, ANALYSIS_STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="agent-loading-backdrop">
      <div className="agent-loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <h2 className="loading-title">AI Agent Running</h2>
        
        <div className="loading-steps">
          {ANALYSIS_STEPS.map((step, index) => (
            <div 
              key={step.id} 
              className={`loading-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            >
              <div className="step-indicator">
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="step-text">{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
