import { FaUsers } from "react-icons/fa"

const Spinner = () => (
  <div className="flex justify-center items-center h-40">
    <div className="w-10 h-10 border-4 border-[#2E3192] border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const UserRegistrationChart = ({ data, loading, selectedDepartment, onDepartmentChange }) => {
  if (loading) return <Spinner />

  // Create SVG line chart
  const chartWidth = 1500
  const chartHeight = 350
  const padding = 50

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const xStep = data.length > 1 ? (chartWidth - 2 * padding) / (data.length - 1) : 0

  // Create points for the line
  const points = data.map((dept, index) => {
    const x = padding + (index * xStep)
    const y = chartHeight - padding - ((dept.count / maxCount) * (chartHeight - 2 * padding))
    return { x, y, ...dept }
  })

  // Create path string for the line
  const pathData = points.length > 0 ? 
    `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ') : ''

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2E3192]">User Registration by Department</h3>
        
        {/* Integrated Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
          <select 
            value={selectedDepartment} 
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E3192] focus:border-transparent bg-white min-w-[160px]"
          >
            <option value="">All Departments</option>
            <option value="SHS">Senior High School</option>
            <option value="SABM">SABM (Business & Management)</option>
            <option value="SACE">SACE (Architecture & Engineering)</option>
            <option value="SAHS">SAHS (Allied Health & Science)</option>
            <option value="Employee">Employees</option>
          </select>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FaUsers size={24} className="text-gray-400" />
          </div>
          <p className="text-lg">No registration data available</p>
          <p className="text-sm mt-1">Try selecting a different department filter</p>
        </div>
      ) : (
        <div className="relative">
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((fraction, i) => {
              const y = chartHeight - padding - (fraction * (chartHeight - 2 * padding))
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke={fraction === 0 ? "#d1d5db" : "#f3f4f6"}
                    strokeWidth={fraction === 0 ? "2" : "1"}
                  />
                  <text
                    x={padding - 15}
                    y={y + 4}
                    fontSize="12"
                    fill="#6b7280"
                    textAnchor="end"
                    className="font-medium"
                  >
                    {Math.round(maxCount * fraction)}
                  </text>
                </g>
              )
            })}

            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Area under the line */}
            {points.length > 0 && (
              <path
                d={`${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`}
                fill="url(#areaGradient)"
                opacity="0.15"
              />
            )}

            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill="#2E3192"
                  stroke="white"
                  strokeWidth="3"
                  className="hover:r-9 transition-all cursor-pointer drop-shadow-sm"
                />
                {/* Value labels on points */}
                <text
                  x={point.x}
                  y={point.y - 15}
                  fontSize="12"
                  fill="#2E3192"
                  textAnchor="middle"
                  className="font-bold"
                >
                  {point.count}
                </text>
                {/* Hover tooltip */}
                <title>{`${point.fullName || point.name}: ${point.count} registered users`}</title>
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={chartHeight - 15}
                fontSize="11"
                fill="#4b5563"
                textAnchor="middle"
                className="font-semibold"
              >
                {point.name}
              </text>
            ))}

            {/* Gradients */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2E3192" />
                <stop offset="100%" stopColor="#ffc72c" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E3192" />
                <stop offset="100%" stopColor="#ffc72c" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      
      {/* Enhanced Legend */}
      {data.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Department Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.map((dept, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2E3192]"></div>
                  <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                </span>
                <span className="text-sm text-[#2E3192] font-bold">{dept.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-600">Total Users:</span>
              <span className="font-bold text-[#2E3192]">{data.reduce((sum, dept) => sum + dept.count, 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserRegistrationChart