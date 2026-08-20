'use client';

import { stepsData, studentFeatures, teacherFeatures } from '../data/stepsData';
import { CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="w-1/2 flex flex-col items-center justify-center px-4 sm:px-8 py-6 text-center max-w-6xl mx-auto overflow-y-auto">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
        Comment ça marche ?
      </h2>

      {/* Cartes des étapes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {stepsData.map((step) => (
          <div 
            key={step.number}
            className={`bg-white rounded-3xl p-6 pt-8 shadow-sm border-t-4 ${step.borderColor} border-x border-b border-gray-100 flex flex-col items-center text-center relative`}
          >
            <div className={`w-12 h-12 ${step.numberBg} text-white font-bold text-lg rounded-full flex items-center justify-center shadow-md mb-4`}>
              {step.number}
            </div>

            <h3 className="text-lg font-extrabold text-gray-900 mb-3">
              {step.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Sections Étudiants & Professeurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className={`text-2xl font-extrabold ${studentFeatures.titleColorClass} mb-6`}>
            {studentFeatures.title}
          </h3>

          <ul className="space-y-4 text-sm text-gray-800 font-medium">
            {studentFeatures.features.map((feat, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 ${studentFeatures.iconColorClass} shrink-0 mt-0.5`} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className={`text-2xl font-extrabold ${teacherFeatures.titleColorClass} mb-6`}>
            {teacherFeatures.title}
          </h3>

          <ul className="space-y-4 text-sm text-gray-800 font-medium">
            {teacherFeatures.features.map((feat, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 ${teacherFeatures.iconColorClass} shrink-0 mt-0.5`} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}