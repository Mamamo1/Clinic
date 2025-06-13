"use client"

import { useState, useRef, useEffect } from "react"
import { FaMinus, FaTimes, FaChevronDown } from "react-icons/fa"

const BarChart = ({ title = "Bar Chart", onMinimize, onRemove }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("January")
  const [hoveredBar, setHoveredBar] = useState(null)
  const [chartWidth, setChartWidth] = useState(0)
  const chartContainerRef = useRef(null)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const illnessDataByMonth = {
    January: [
      { name: "Upper Respiratory Infection", SHS: 280, College: 240, Employee: 0 },
      { name: "Hypertension", SHS: 220, College: 0, Employee: 180 },
      { name: "Conjunctivitis", SHS: 200, College: 120, Employee: 0 },
      { name: "Gastroenteritis", SHS: 160, College: 100, Employee: 0 },
      { name: "Headache", SHS: 80, College: 0, Employee: 60 },
    ],
    February: [
      { name: "Upper Respiratory Infection", SHS: 260, College: 220, Employee: 0 },
      { name: "Hypertension", SHS: 200, College: 0, Employee: 160 },
      { name: "Conjunctivitis", SHS: 180, College: 100, Employee: 0 },
      { name: "Gastroenteritis", SHS: 140, College: 80, Employee: 0 },
      { name: "Headache", SHS: 70, College: 0, Employee: 50 },
    ],
    March: [
      { name: "Upper Respiratory Infection", SHS: 300, College: 260, Employee: 0 },
      { name: "Hypertension", SHS: 240, College: 0, Employee: 200 },
      { name: "Conjunctivitis", SHS: 220, College: 140, Employee: 0 },
      { name: "Gastroenteritis", SHS: 180, College: 120, Employee: 0 },
      { name: "Headache", SHS: 90, College: 0, Employee: 70 },
    ],
  }

  const categoryColors = {
    SHS: "#2E3192", // NU Blue
    College: "#06B6D4", // Teal
    Employee: "#ffc72c", // NU Gold
  }

  // Update chart width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (onMinimize) onMinimize()
  }

  const handleRemove = () => {
    if (onRemove) onRemove()
  }

  const monthData = illnessDataByMonth[selectedMonth] || []
  const maxValue = Math.max(
    ...monthData.map((illness) => Math.max(illness.SHS || 0, illness.College || 0, illness.Employee || 0)),
  )
  const xAxisMax = Math.ceil(maxValue / 50) * 50
  const xAxisLabels = Array.from({ length: xAxisMax / 50 + 1 }, (_, i) => i * 50)

  // Calculate total for each illness
  const illnessWithTotals = monthData.map((illness) => {
    const total = Object.entries(categoryColors)
      .map(([category]) => illness[category] || 0)
      .reduce((sum, val) => sum + val, 0)
    return { ...illness, total }
  })

  // Sort by total (optional)
  const sortedData = [...illnessWithTotals].sort((a, b) => b.total - a.total)

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Card Header */}
      <div className="bg-[#2E3192] text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleMinimize}
            className="text-white hover:text-[#ffc72c] p-1 transition-colors duration-200"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            <FaMinus size={14} />
          </button>
          <button
            onClick={handleRemove}
            className="text-white hover:text-[#ffc72c] p-1 transition-colors duration-200"
            aria-label="Remove"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      {!isMinimized && (
        <div className="p-6">
          {/* Header with Title and Month Filter */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-gray-800">Top 5 Common Illnesses</h4>
            <div className="relative mt-2 sm:mt-0">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192] transition-colors"
                aria-label="Select month"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <FaChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={12}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center space-x-4 sm:space-x-8 mb-6">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} className="flex items-center mb-2">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }} aria-hidden="true"></div>
                <span className="text-sm font-medium text-gray-700">{cat}</span>
              </div>
            ))}
          </div>

          {/* Chart Container */}
          <div ref={chartContainerRef} className="overflow-x-auto" style={{ minHeight: 250 }}>
            <div className="min-w-[500px]">
              {/* Chart Bars */}
              {sortedData.map((illness, illnessIndex) => (
                <div key={illness.name} className="flex items-center mb-6 group">
                  {/* Illness Name */}
                  <div className="w-48 text-right pr-4 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700 line-clamp-2" title={illness.name}>
                      {illness.name}
                    </span>
                  </div>

                  {/* Bars Container */}
                  <div className="flex-1 relative h-12">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {xAxisLabels.map((label) => (
                        <div
                          key={label}
                          className="border-l border-gray-200 h-full"
                          style={{ left: `${(label / xAxisMax) * 100}%` }}
                          aria-hidden="true"
                        ></div>
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="relative z-10 h-full flex flex-col justify-center space-y-1">
                      {Object.entries(categoryColors).map(([category, color]) => {
                        const value = illness[category] || 0
                        const width = (value / xAxisMax) * 100
                        const barId = `bar-${illnessIndex}-${category}`

                        return value > 0 ? (
                          <div
                            key={category}
                            id={barId}
                            className="h-3 rounded transition-all duration-500 relative"
                            style={{
                              width: `${width}%`,
                              backgroundColor: color,
                              minWidth: value > 0 ? "8px" : "0px",
                              transform: hoveredBar === barId ? "scaleY(1.2)" : "scaleY(1)",
                              zIndex: hoveredBar === barId ? 20 : 10,
                            }}
                            onMouseEnter={() => setHoveredBar(barId)}
                            onMouseLeave={() => setHoveredBar(null)}
                            role="graphics-symbol"
                            aria-label={`${category}: ${value} cases of ${illness.name}`}
                          >
                            {/* Tooltip */}
                            <div
                              className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-30 ${
                                hoveredBar === barId ? "opacity-100" : "opacity-0"
                              } transition-opacity duration-200`}
                            >
                              {category}: {value}
                            </div>

                            {/* Value label for larger bars */}
                            {width > 15 && (
                              <span
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-white font-bold"
                                style={{ textShadow: "0px 0px 2px rgba(0,0,0,0.5)" }}
                              >
                                {value}
                              </span>
                            )}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* X-axis Labels */}
              <div className="flex justify-between mt-4 ml-48 pr-4">
                {xAxisLabels.map((label) => (
                  <div key={label} className="text-xs text-gray-500 flex-shrink-0">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {monthData.length === 0 && (
            <div className="flex items-center justify-center h-40 text-gray-500">
              No data available for {selectedMonth}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BarChart
