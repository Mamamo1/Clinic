import { useState, useRef, useEffect } from "react"
import {
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaQuestionCircle,
  FaTimes,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa"
import axios from "axios"

const BarChart = ({ title = "Illness Tracking Dashboard", onMinimize, onRemove }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date()
    const monthNames = [
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
    return monthNames[currentDate.getMonth()]
  })
  const [hoveredBar, setHoveredBar] = useState(null)
  const [chartWidth, setChartWidth] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("total")
  const [hiddenCategories, setHiddenCategories] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [illnessData, setIllnessData] = useState([])
  const [isApiConnected, setIsApiConnected] = useState(false)
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

  const categoryColors = {
    SHS: { primary: "#1e3a8a", light: "#3b82f6", dark: "#1e40af" }, // Deep blue
    College: { primary: "#b45309", light: "#d97706", dark: "#92400e" }, // Golden brown
    Employee: { primary: "#fbbf24", light: "#fcd34d", dark: "#f59e0b" }, // Golden yellow
  }

  const severityColors = {
    low: "#059669", // Emerald green
    moderate: "#d97706", // Golden orange
    high: "#dc2626", // Red
  }

  const fetchIllnessData = async () => {
    const authToken = localStorage.getItem("auth_token")
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get("http://localhost:8000/api/illness-data", {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { month: selectedMonth },
        timeout: 10000, 
      })

      const data = response.data.data || []
      setIllnessData(data)
      setIsApiConnected(true)
    } catch (error) {
      let errorMessage = "Unable to connect to server. Please check your connection."
      let debugInfo = ""

      if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again."
      } else if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please ensure your Laravel backend has the /api/illness-data route."
      } else if (error.response?.status === 500) {
        const serverMessage = error.response?.data?.message || ""

        if (
          serverMessage.includes("does not exist") ||
          serverMessage.includes("Method") ||
          serverMessage.includes("getIllnessData")
        ) {
          errorMessage =
            "Laravel Method Missing: The getIllnessData method doesn't exist in your MedicalRecordController."
        } else if (serverMessage.includes("Unknown column 'illness'") || serverMessage.includes("Column not found")) {
          errorMessage = "Laravel Database Error: Column 'illness' not found in your medical_records table."
        } else {
          errorMessage = "Laravel Server Error (500). Check your backend logs for details."
          debugInfo = serverMessage || "No additional error details from server"
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please check your login credentials."
      } else if (error.response?.status === 422) {
        errorMessage = "Invalid request data. Check the month parameter format."
        debugInfo = error.response?.data?.message || "Validation error"
      }

      setError({ message: errorMessage, debugInfo })
      setIsApiConnected(false)
      setIllnessData([])
    } finally {
      setLoading(false)
    }
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

  useEffect(() => {
    fetchIllnessData()
  }, [selectedMonth])

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    if (onMinimize) onMinimize()
  }

  const toggleCategory = (category) => {
    const newHidden = new Set(hiddenCategories)
    if (newHidden.has(category)) {
      newHidden.delete(category)
    } else {
      newHidden.add(category)
    }
    setHiddenCategories(newHidden)
  }

  const monthData = illnessData || []

  // Filter by search term
  const filteredData = monthData.filter((illness) => illness.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  const displayedData = showAll ? filteredData : filteredData.slice(0, 6)

  // Calculate totals and sort
  const processedData = displayedData.map((illness) => {
    const visibleCategories = Object.keys(categoryColors).filter((cat) => !hiddenCategories.has(cat))
    const total = visibleCategories.reduce((sum, cat) => sum + (illness[cat] || 0), 0)
    return { ...illness, total, visibleTotal: total }
  })

  // Sort data
  const sortedData = [...processedData].sort((a, b) => {

    if (sortBy === "name") return a.name?.localeCompare(b.name) || 0
    if (sortBy === "total") return b.visibleTotal - a.visibleTotal
    return (b[sortBy] || 0) - (a[sortBy] || 0)
  })

  const maxValue = Math.max(
    ...sortedData.map((illness) =>
      Math.max(
        ...Object.keys(categoryColors)
          .filter((cat) => !hiddenCategories.has(cat))
          .map((cat) => illness[cat] || 0),
      ),
    ),
    100, // Minimum value to prevent errors
  )
  const xAxisMax = Math.max(Math.ceil(maxValue / 50) * 50, 100)
  const xAxisLabels = Array.from({ length: Math.floor(xAxisMax / 50) + 1 }, (_, i) => i * 50)

  // Calculate summary statistics
  const totalCases = sortedData.reduce((sum, illness) => sum + illness.visibleTotal, 0)
  const trendingUp = sortedData.filter((illness) => illness.trend === "increasing").length

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a8a]">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            National University Health Center - Monitor health trends across campus populations
          </p>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-amber-50 text-[#b45309] rounded-lg hover:bg-amber-100 transition-colors"
          aria-label="Show help information"
        >
          <FaQuestionCircle className="w-4 h-4" />
          Help
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1e3a8a]">Dashboard Help</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <ul className="ml-4 space-y-1">
                <li>🟢 Low: Minor symptoms, minimal impact</li>
                <li>🟡 Medium: Moderate symptoms, some impact</li>
                <li>🔴 High: Severe symptoms, significant impact</li>
              </ul>
              <p>
                <strong>Trends:</strong> ↑ Increasing, ↓ Decreasing, → Stable
              </p>
              <p>
                <strong>Tips:</strong> Click legend items to show/hide categories. Use filters to focus on specific
                data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card Body */}
      {!isMinimized && (
        <div className="p-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-[#1e3a8a]">
              <div className="text-2xl font-bold text-[#1e3a8a]">{totalCases}</div>
              <div className="text-sm text-gray-600">Total Cases ({selectedMonth})</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-[#d97706]">
              <div className="text-2xl font-bold text-[#d97706] flex items-center">
                {trendingUp} <FaChevronUp className="ml-2" size={16} />
              </div>
              <div className="text-sm text-gray-600">Trending Up</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
              <div className="text-2xl font-bold text-emerald-600">{sortedData.length}</div>
              <div className="text-sm text-gray-600">Tracked Conditions</div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">
                Select Month
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                disabled={loading}
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="search-input" className="block text-sm font-medium text-gray-700">
                Search Illnesses
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search illnesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                disabled={loading}
              >
                <option value="total">Sort by Total</option>
                <option value="name">Sort by Name</option>
                <option value="SHS">Sort by SHS</option>
                <option value="College">Sort by College</option>
                <option value="Employee">Sort by Employee</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-red-800">
                <FaExclamationTriangle className="w-5 h-5" />
                <span className="font-medium">Laravel Backend Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{typeof error === "string" ? error : error.message}</p>

              {/* Show debug info for 500 errors */}
              {error.debugInfo && (
                <div className="mt-3 p-3 bg-red-100 rounded border-l-4 border-red-400">
                  <p className="text-xs font-medium text-red-800 mb-1">
                    {error.message.includes("Method Missing") ? "Required Laravel Code:" : "Server Response:"}
                  </p>
                  <pre className="text-xs text-red-700 font-mono whitespace-pre-wrap overflow-x-auto bg-red-50 p-2 rounded">
                    {error.debugInfo}
                  </pre>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={fetchIllnessData}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    const errorDetails = {
                      message: typeof error === "string" ? error : error.message,
                      debugInfo: error.debugInfo,
                      timestamp: new Date().toISOString(),
                      month: selectedMonth,
                      url: "http://localhost:8000/api/illness-data",
                    }
                    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
                    alert("Error details copied to clipboard!")
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Copy Error Details
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 mt-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a]"></div>
                <span className="ml-3 text-gray-600">Loading illness data...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Interactive Legend */}
              <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg mt-4">
                {Object.entries(categoryColors).map(([cat, colors]) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center transition-all duration-200 px-3 py-2 rounded-lg ${
                      hiddenCategories.has(cat) ? "opacity-50 bg-gray-200" : "bg-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: hiddenCategories.has(cat) ? "#9CA3AF" : colors.primary }}
                    />
                    <span
                      className={`text-sm font-medium ${hiddenCategories.has(cat) ? "text-gray-500" : "text-gray-700"}`}
                    >
                      {cat} {hiddenCategories.has(cat) ? "(Hidden)" : ""}
                    </span>
                  </button>
                ))}
              </div>

              {/* Chart Container */}
              <div ref={chartContainerRef} className="overflow-x-auto border rounded-lg" style={{ minHeight: 400 }}>
                <div className="min-w-[600px] p-4">
                  {sortedData.length > 0 ? (
                    sortedData.map((illness, illnessIndex) => (
                      <div
                        key={illness.name || illnessIndex}
                        className="flex items-center mb-4 group hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        {/* Illness Name & Info */}
                        <div className="w-56 text-right pr-4 flex-shrink-0">
                          <div className="text-sm font-medium text-gray-700 mb-1" title={illness.name}>
                            {illness.name || "Unknown Condition"}
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: severityColors[illness.severity] || severityColors.low }}
                              title={`${illness.severity || "unknown"} severity`}
                            />
                            {illness.trend === "increasing" && <FaArrowUp className="text-red-500" size={10} />}
                            {illness.trend === "decreasing" && <FaArrowDown className="text-green-500" size={10} />}
                            <span className="text-xs text-gray-500 font-semibold">Total: {illness.visibleTotal}</span>
                          </div>
                        </div>

                        {/* Bars Container */}
                        <div className="flex-1 relative h-16">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            {xAxisLabels.map((label) => (
                              <div
                                key={label}
                                className="border-l border-gray-200 h-full"
                                style={{ left: `${(label / xAxisMax) * 100}%` }}
                              />
                            ))}
                          </div>

                          {/* Bars */}
                          <div className="relative z-10 h-full flex flex-col justify-center space-y-1">
                            {Object.entries(categoryColors)
                              .filter(([category]) => !hiddenCategories.has(category))
                              .map(([category, colors]) => {
                                const value = illness[category] || 0
                                const width = (value / xAxisMax) * 100
                                const barId = `bar-${illnessIndex}-${category}`

                                return value > 0 ? (
                                  <div
                                    key={category}
                                    id={barId}
                                    className="h-4 rounded-md transition-all duration-300 relative shadow-sm"
                                    style={{
                                      width: `${width}%`,
                                      backgroundColor: colors.primary,
                                      minWidth: value > 0 ? "12px" : "0px",
                                      transform: hoveredBar === barId ? "scaleY(1.15)" : "scaleY(1)",
                                      boxShadow: hoveredBar === barId ? `0 4px 8px ${colors.primary}40` : "none",
                                    }}
                                    onMouseEnter={() => setHoveredBar(barId)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                    role="graphics-symbol"
                                    aria-label={`${category}: ${value} cases of ${illness.name}`}
                                  >
                                    {/* Tooltip */}
                                    <div
                                      className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-30 whitespace-nowrap ${hoveredBar === barId ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
                                    >
                                      <div className="font-semibold">
                                        {category}: {value} cases
                                      </div>
                                      <div className="text-gray-300">{illness.name}</div>
                                    </div>

                                    {/* Value label for larger bars */}
                                    {width > 8 && (
                                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-bold drop-shadow-sm">
                                        {value}
                                      </span>
                                    )}
                                  </div>
                                ) : null
                              })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                      <div className="text-lg font-medium mb-2">No data available</div>
                      <div className="text-sm">
                        {isApiConnected
                          ? "No illness data found for the selected month."
                          : "Please connect to your server to view data."}
                      </div>
                    </div>
                  )}

                  {/* X-axis Labels */}
                  {sortedData.length > 0 && (
                    <div className="flex justify-between mt-6 ml-56 pr-4">
                      {xAxisLabels.map((label) => (
                        <div key={label} className="text-xs text-gray-500 font-medium">
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Show More/Less Functionality */}
              {filteredData.length > 6 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
                  >
                    {showAll ? (
                      <>
                        <FaChevronUp className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="w-4 h-4" />
                        Show More ({filteredData.length - 6} more)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default BarChart
