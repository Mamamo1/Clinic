import { useState, useRef } from "react"
import { FaMinus, FaChevronDown } from "react-icons/fa"

const BarChart = ({ title = "Most Used Medicines", onMinimize, onRemove }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState("January")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [hoveredBar, setHoveredBar] = useState(null)
  const [chartHeight, setChartHeight] = useState(300)
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

  const categories = ["All", "Medicine", "Supplies"]

  // Mock data for most used medicines/supplies by month
  const medicineDataByMonth = {
    January: [
      { name: "Paracetamol", category: "Medicine", usage: 450, color: "#2E3192" },
      { name: "Ibuprofen", category: "Medicine", usage: 380, color: "#2E3192" },
      { name: "Amoxicillin", category: "Medicine", usage: 320, color: "#2E3192" },
      { name: "Surgical Mask", category: "Supplies", usage: 280, color: "#ffc72c" },
      { name: "Bandages", category: "Supplies", usage: 250, color: "#ffc72c" },
      { name: "Alcohol", category: "Supplies", usage: 220, color: "#ffc72c" },
      { name: "Cetirizine", category: "Medicine", usage: 180, color: "#2E3192" },
      { name: "Cotton Balls", category: "Supplies", usage: 160, color: "#ffc72c" },
    ],
    February: [
      { name: "Paracetamol", category: "Medicine", usage: 420, color: "#2E3192" },
      { name: "Ibuprofen", category: "Medicine", usage: 360, color: "#2E3192" },
      { name: "Surgical Mask", category: "Supplies", usage: 300, color: "#ffc72c" },
      { name: "Amoxicillin", category: "Medicine", usage: 290, color: "#2E3192" },
      { name: "Bandages", category: "Supplies", usage: 240, color: "#ffc72c" },
      { name: "Alcohol", category: "Supplies", usage: 210, color: "#ffc72c" },
      { name: "Cetirizine", category: "Medicine", usage: 170, color: "#2E3192" },
      { name: "Thermometer", category: "Supplies", usage: 150, color: "#ffc72c" },
    ],
    March: [
      { name: "Paracetamol", category: "Medicine", usage: 480, color: "#2E3192" },
      { name: "Ibuprofen", category: "Medicine", usage: 400, color: "#2E3192" },
      { name: "Surgical Mask", category: "Supplies", usage: 350, color: "#ffc72c" },
      { name: "Amoxicillin", category: "Medicine", usage: 340, color: "#2E3192" },
      { name: "Bandages", category: "Supplies", usage: 280, color: "#ffc72c" },
      { name: "Alcohol", category: "Supplies", usage: 260, color: "#ffc72c" },
      { name: "Cetirizine", category: "Medicine", usage: 200, color: "#2E3192" },
      { name: "Cotton Balls", category: "Supplies", usage: 180, color: "#ffc72c" },
    ],
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (onMinimize) onMinimize()
  }

  const handleRemove = () => {
    if (onRemove) onRemove()
  }

  // Get and filter data
  const monthData = medicineDataByMonth[selectedMonth] || []
  const filteredData =
    selectedCategory === "All" ? monthData : monthData.filter((item) => item.category === selectedCategory)

  // Sort by usage and take top 8
  const sortedData = [...filteredData].sort((a, b) => b.usage - a.usage).slice(0, 8)

  const maxValue = Math.max(...sortedData.map((item) => item.usage), 100)
  const yAxisMax = Math.ceil(maxValue / 100) * 100
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => Math.round((yAxisMax / 5) * i))

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
        </div>
      </div>

      {/* Card Body */}
      {!isMinimized && (
        <div className="p-6">
          {/* Header with Filters */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h4 className="text-xl font-bold text-gray-800">Top 8 Most Used Items</h4>

            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192] transition-colors"
                  aria-label="Select category"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <FaChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={12}
                />
              </div>

              {/* Month Filter */}
              <div className="relative">
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
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-8 mb-6">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2 bg-[#2E3192]" aria-hidden="true"></div>
              <span className="text-sm font-medium text-gray-700">Medicine</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2 bg-[#ffc72c]" aria-hidden="true"></div>
              <span className="text-sm font-medium text-gray-700">Supplies</span>
            </div>
          </div>

          {/* Chart Container */}
          <div ref={chartContainerRef} className="overflow-x-auto">
            <div className="min-w-[600px] relative" style={{ height: chartHeight }}>
              {/* Y-axis */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                {yAxisLabels.reverse().map((label, index) => (
                  <div key={`y-label-${index}`} className="text-right">
                    {label}
                  </div>
                ))}
              </div>

              {/* Grid lines */}
              <div className="ml-12 relative h-full">
                {yAxisLabels
                  .slice()
                  .reverse()
                  .map((label, index) => (
                    <div
                      key={`grid-${index}`}
                      className="absolute w-full border-t border-gray-200"
                      style={{ bottom: `${(label / yAxisMax) * 100}%` }}
                      aria-hidden="true"
                    ></div>
                  ))}

                {/* Bars Container */}
                <div className="flex justify-between items-end h-full pt-4 pb-8 relative z-10">
                  {sortedData.map((item, index) => {
                    const height = (item.usage / yAxisMax) * 100
                    const barId = `medicine-bar-${index}`

                    return (
                      <div key={`${item.name}-${index}`} className="flex flex-col items-center flex-1 mx-1">
                        {/* Bar */}
                        <div className="flex items-end h-full mb-2 relative">
                          <div
                            id={barId}
                            className="w-12 sm:w-16 rounded-t transition-all duration-500 relative group cursor-pointer"
                            style={{
                              height: `${height}%`,
                              backgroundColor: item.color,
                              minHeight: item.usage > 0 ? "8px" : "0px",
                              transform: hoveredBar === barId ? "scaleX(1.1)" : "scaleX(1)",
                              boxShadow: hoveredBar === barId ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                            }}
                            onMouseEnter={() => setHoveredBar(barId)}
                            onMouseLeave={() => setHoveredBar(null)}
                            role="graphics-symbol"
                            aria-label={`${item.name}: ${item.usage} uses`}
                          >
                            {/* Tooltip */}
                            <div
                              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-30 ${
                                hoveredBar === barId ? "opacity-100" : "opacity-0"
                              } transition-opacity duration-200`}
                            >
                              <div className="font-semibold">{item.name}</div>
                              <div>
                                {item.category}: {item.usage} uses
                              </div>
                              {/* Tooltip arrow */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>

                            {/* Value label on top of bar */}
                            {height > 15 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                                {item.usage}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* X-axis label */}
                        <div className="text-xs text-gray-600 text-center transform -rotate-45 origin-center mt-2 w-16 h-8 flex items-start justify-center">
                          <span className="line-clamp-2" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {sortedData.length === 0 && (
            <div className="flex items-center justify-center h-40 text-gray-500">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">No data available</div>
                <div className="text-sm">
                  No {selectedCategory.toLowerCase()} data for {selectedMonth}
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {sortedData.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2E3192]">
                  {sortedData.reduce((sum, item) => sum + item.usage, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Usage</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2E3192]">{sortedData[0]?.name || "N/A"}</div>
                <div className="text-sm text-gray-600">Most Used</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[#2E3192]">
                  {sortedData.length > 0
                    ? Math.round(sortedData.reduce((sum, item) => sum + item.usage, 0) / sortedData.length)
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Average Usage</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BarChart
