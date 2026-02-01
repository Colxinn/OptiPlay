'use client';

import { useState } from 'react';

export default function PresetApplier({ preset }) {
  const [activeStep, setActiveStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [copiedText, setCopiedText] = useState('');

  // Combine all settings into steps
  const steps = [];
  
  if (preset.applies.game_settings?.length > 0) {
    preset.applies.game_settings.forEach((setting, i) => {
      steps.push({
        id: `game-${i}`,
        category: 'Game Settings',
        icon: '🎮',
        color: 'purple',
        instruction: setting
      });
    });
  }

  if (preset.applies.os_settings?.length > 0) {
    preset.applies.os_settings.forEach((setting, i) => {
      steps.push({
        id: `os-${i}`,
        category: 'Windows Settings',
        icon: '💻',
        color: 'blue',
        instruction: setting
      });
    });
  }

  if (preset.applies.driver_settings?.length > 0) {
    preset.applies.driver_settings.forEach((setting, i) => {
      steps.push({
        id: `driver-${i}`,
        category: 'GPU/Driver',
        icon: '🎨',
        color: 'orange',
        instruction: setting
      });
    });
  }

  if (preset.applies.background_processes?.length > 0) {
    preset.applies.background_processes.forEach((setting, i) => {
      steps.push({
        id: `bg-${i}`,
        category: 'Background',
        icon: '⚡',
        color: 'pink',
        instruction: setting
      });
    });
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleStep = (stepId) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const progress = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400'
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-white">Application Progress</h3>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {completedSteps.size} of {steps.length} steps completed
        </div>
      </div>

      {/* Interactive Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isActive = activeStep === step.id;

          return (
            <div 
              key={step.id}
              className={`p-5 rounded-xl border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : isActive
                  ? 'bg-white/10 border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step Number/Checkbox */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-white/30 text-white/50 hover:border-purple-500'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colorClasses[step.color]}`}>
                      {step.category}
                    </span>
                  </div>
                  
                  <p className={`text-base leading-relaxed transition-all ${
                    isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'
                  }`}>
                    {step.instruction}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setActiveStep(isActive ? null : step.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-sm font-medium transition"
                    >
                      {isActive ? 'Hide Details' : 'Show Details'}
                    </button>
                    {step.instruction.includes('→') && (
                      <button
                        onClick={() => handleCopy(step.instruction.split('→')[1]?.trim() || step.instruction)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm font-medium transition"
                      >
                        {copiedText === step.instruction ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isActive && (
                    <div className="mt-4 p-4 rounded-lg bg-black/30 border border-white/10 animate-fadeIn">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        💡 <strong>Tip:</strong> Follow this step carefully. If you're unsure, check the warnings section below or revert using the undo steps provided.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setCompletedSteps(new Set())}
          className="flex-1 px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 font-semibold transition"
        >
          Reset Progress
        </button>
        <button
          onClick={() => setCompletedSteps(new Set(steps.map(s => s.id)))}
          className="flex-1 px-4 py-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 font-semibold transition"
        >
          Mark All Complete
        </button>
      </div>
    </div>
  );
}
