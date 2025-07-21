import React from 'react';

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Carrinho' },
    { id: 2, name: 'Finalizar Compra' },
    { id: 3, name: 'Pagamento' },
    { id: 4, name: 'Confirmação' }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${step.id <= currentStep 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-600 text-gray-300'}
                ${step.id === currentStep ? 'ring-4 ring-blue-300' : ''}
              `}>
                {step.id <= currentStep ? (
                  step.id < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )
                ) : (
                  step.id
                )}
              </div>
              <span className={`ml-3 font-medium ${
                step.id <= currentStep ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 w-16 rounded ${
                step.id < currentStep ? 'bg-blue-500' : 'bg-gray-600'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;