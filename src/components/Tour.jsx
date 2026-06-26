import React, { useState, useEffect, useRef } from 'react';
import './Tour.css';

export default function Tour({ steps, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState({});
  const popoverRef = useRef(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    // Scroll into view first
    const targetEl = document.querySelector(currentStep.target);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Add highlight class
    if (targetEl) {
      targetEl.classList.add('tour-highlight-active');
    }

    // Wait for scroll before positioning
    const timer = setTimeout(() => {
      if (targetEl && popoverRef.current) {
        const rect = targetEl.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const padding = 20;

        let top = rect.bottom + padding;
        let left = rect.left;

        if (top + popoverRect.height > window.innerHeight) {
          top = rect.top - popoverRect.height - padding;
        }

        if (left + popoverRect.width > window.innerWidth) {
          left = window.innerWidth - popoverRect.width - padding;
        }

        if (left < padding) left = padding;
        
        top += window.scrollY; // adjust for scroll

        setPopoverStyle({
          top: `${top}px`,
          left: `${left}px`
        });
      } else {
        // Center if no target found
        setPopoverStyle({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        });
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      if (targetEl) {
        targetEl.classList.remove('tour-highlight-active');
      }
    };
  }, [currentStepIndex, currentStep]);

  const goToNext = () => {
    if (currentStepIndex === steps.length - 1) {
      onClose();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <>
      <div className="tour-overlay active" />
      <div 
        ref={popoverRef}
        className="tour-popover visible" 
        style={popoverStyle}
      >
        <h4>{currentStep.title}</h4>
        <p>{currentStep.content}</p>
        <div className="tour-footer">
          <span className="tour-steps-indicator">
            {currentStepIndex + 1} of {steps.length}
          </span>
          <div className="tour-actions">
            <button className="tour-btn" onClick={onClose}>Skip</button>
            {currentStepIndex > 0 && (
              <button className="tour-btn" onClick={goToPrev}>Prev</button>
            )}
            <button className="tour-btn tour-btn-primary" onClick={goToNext}>
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
