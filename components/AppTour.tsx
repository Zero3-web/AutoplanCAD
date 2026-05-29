import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';

export interface TourStep {
    target: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface AppTourProps {
    steps: TourStep[];
    onComplete: () => void;
    isOpen: boolean;
}

const AppTour: React.FC<AppTourProps> = ({ steps, onComplete, isOpen }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 900);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const updateTarget = () => {
            const step = steps[currentStep];
            if (step.target === 'center') {
                setTargetRect(null);
                return;
            }
            const el = document.querySelector(step.target);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        };

        updateTarget();
        window.addEventListener('resize', updateTarget);
        return () => window.removeEventListener('resize', updateTarget);
    }, [currentStep, isOpen, steps]);

    if (!isOpen) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
            setCurrentStep(0);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const skipTour = () => {
        onComplete();
        setCurrentStep(0);
    };

    // Overlay masking effect
    const maskStyle: React.CSSProperties = targetRect ? {
        clipPath: `polygon(
      0% 0%, 0% 100%, 
      ${targetRect.left}px 100%, 
      ${targetRect.left}px ${targetRect.top}px, 
      ${targetRect.right}px ${targetRect.top}px, 
      ${targetRect.right}px ${targetRect.bottom}px, 
      ${targetRect.left}px ${targetRect.bottom}px, 
      ${targetRect.left}px 100%, 
      100% 100%, 100% 0%
    )`
    } : {};

    // Tooltip positioning
    const getTooltipPosition = () => {
        if (isMobile) {
            return {
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                top: 'auto'
            };
        }

        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const padding = 15;
        const pos = step.position || 'right';

        switch (pos) {
            case 'left':
                return { top: targetRect.top + targetRect.height / 2, left: targetRect.left - padding, transform: 'translate(-100%, -50%)' };
            case 'right':
                return { top: targetRect.top + targetRect.height / 2, left: targetRect.right + padding, transform: 'translate(0, -50%)' };
            case 'top':
                return { top: targetRect.top - padding, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
            case 'bottom':
                return { top: targetRect.bottom + padding, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, 0)' };
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] overflow-hidden">
            {/* Background Dimmer */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-500"
                style={maskStyle}
            />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="absolute w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 flex flex-col gap-3 transition-all duration-300 animate-in fade-in zoom-in duration-300"
                style={getTooltipPosition()}
            >
                <button
                    onClick={skipTour}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-blue-500">Paso {currentStep + 1} de {steps.length}</span>
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                    {step.content}
                </p>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                    <button
                        onClick={currentStep > 0 ? () => setCurrentStep(prev => prev - 1) : skipTour}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                        {currentStep > 0 ? 'Atrás' : 'Omitir tour'}
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        {isLastStep ? '¡Entendido!' : 'Siguiente'}
                        {!isLastStep && <ChevronRight size={14} />}
                    </button>
                </div>

                {/* Pointer Arrow */}
                {!isMobile && targetRect && step.position !== 'center' && (
                    <div
                        className={`absolute w-3 h-3 bg-white border-slate-100 transform rotate-45 ${step.position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r' :
                                step.position === 'right' ? 'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l' :
                                    step.position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r' :
                                        'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l'
                            }`}
                    />
                )}
            </div>
        </div>
    );
};

export default AppTour;
