"use client";

import { useState } from "react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2020, 9)); // October 2020 based on your image
  const [selectedDate, setSelectedDate] = useState<number>(8); // Default active date '8' from image

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get month name and year string (e.g., "October 2020")
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to get days in month and starting day
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  // Adjust starting day so Monday is the first column (0 = Monday, 6 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Handlers for month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-80 select-none">
      {/* Header: Month Year & Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-gray-800 text-lg">
          {monthNames[month]} {year}
        </h2>
        <div className="flex space-x-3 text-gray-500">
          <button 
            onClick={prevMonth} 
            className="hover:text-gray-800 transition-colors p-1"
            aria-label="Previous Month"
          >
            &lt;
          </button>
          <button 
            onClick={nextMonth} 
            className="hover:text-gray-800 transition-colors p-1"
            aria-label="Next Month"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Week Days Header (Mo to Su) */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-3">
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
        <span>Su</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center text-sm gap-y-2">
        {/* Empty slots for previous month's trailing days */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {/* Current month's days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1;
          const isSelected = selectedDate === dayNumber && month === 9 && year === 2020; // Matches image state

          return (
            <div key={dayNumber} className="flex justify-center items-center">
              <button
                onClick={() => setSelectedDate(dayNumber)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-[#E67E63] text-white shadow-md shadow-[#E67E63]/30"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {dayNumber}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}