import { useState, useEffect } from "react"
import { X, Save, Info, Calendar, User } from "lucide-react"

const DentalRecordsModal = ({ isOpen, onClose, onSave, userId }) => {
  const initialRecord = {
    teethConditions: {},
    purpose: {
      checkup_enrollment: false,
      consultation: false,
      oral_prophylaxis: false,
      fluoride_varnish: false,
    },
    oral_hygiene: "",
    decayed_teeth_count: 0,
    extraction_teeth_count: 0,
    oral_prophylaxis_notes: "",
    tooth_filling_numbers: "",
    tooth_extraction_numbers: "",
    other_notes: "",
    school_dentist: "",
    examination_date: new Date().toISOString().split("T")[0],
  }

  const [dentalRecord, setDentalRecord] = useState(initialRecord)

  // ✅ Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDentalRecord(initialRecord)
    }
  }, [isOpen])

  const upperTeeth = [
    [18, 17, 16, 15, 14, 13, 12, 11],
    [21, 22, 23, 24, 25, 26, 27, 28],
  ]

  const lowerTeeth = [
    [48, 47, 46, 45, 44, 43, 42, 41],
    [31, 32, 33, 34, 35, 36, 37, 38],
  ]

  const handleToothClick = (toothNumber) => {
    const currentCondition = dentalRecord.teethConditions[toothNumber] || "normal"
    let nextCondition = "normal"
    switch (currentCondition) {
      case "normal":
        nextCondition = "caries"
        break
      case "caries":
        nextCondition = "composite"
        break
      case "composite":
        nextCondition = "extraction"
        break
      case "extraction":
        nextCondition = "normal"
        break
      default:
        nextCondition = "normal"
    }

    setDentalRecord((prev) => ({
      ...prev,
      teethConditions: {
        ...prev.teethConditions,
        [toothNumber]: nextCondition,
      },
    }))
  }

  const getToothColor = (toothNumber) => {
    const condition = dentalRecord.teethConditions[toothNumber] || "normal"
    switch (condition) {
      case "caries":
        return "bg-red-500 border-red-600 shadow-md"
      case "composite":
        return "bg-blue-600 border-blue-700 shadow-md"
      case "extraction":
        return "bg-gray-800 border-gray-900 shadow-md"
      default:
        return "bg-white border-gray-300 hover:border-yellow-500 hover:shadow-sm"
    }
  }

  const handleInputChange = (field, value) => {
    setDentalRecord((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePurposeChange = (purpose, checked) => {
    setDentalRecord((prev) => ({
      ...prev,
      purpose: {
        ...prev.purpose,
        [purpose]: checked,
      },
    }))
  }

  const handleSave = () => {
    const transformedData = {
      user_id: userId,
      teeth_conditions: Object.entries(dentalRecord.teethConditions)
        .filter(([tooth, condition]) => condition !== "normal")
        .map(([tooth, condition]) => ({
          tooth_number: Number.parseInt(tooth),
          condition: condition,
        })),
      purpose: Object.entries(dentalRecord.purpose)
        .filter(([key, value]) => value === true)
        .map(([key]) => key),
      oral_hygiene: dentalRecord.oral_hygiene,
      decayed_teeth_count: dentalRecord.decayed_teeth_count,
      extraction_teeth_count: dentalRecord.extraction_teeth_count,
      oral_prophylaxis_notes: dentalRecord.oral_prophylaxis_notes,
      tooth_filling_numbers: dentalRecord.tooth_filling_numbers,
      tooth_extraction_numbers: dentalRecord.tooth_extraction_numbers,
      other_notes: dentalRecord.other_notes,
      school_dentist: dentalRecord.school_dentist,
      examination_date: dentalRecord.examination_date,
    }

    console.log("[v0] Transformed dental record data:", transformedData)

    onSave(transformedData)

    // ✅ Reset after save
    setDentalRecord(initialRecord)

    // ✅ Close modal
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl mx-auto h-[90vh] flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Dental Examination Record</h3>
                <p className="text-blue-200 text-sm">National University - School Clinic</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <h4 className="text-lg font-semibold text-blue-800">Examination Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Examination Date</label>
                  <input
                    type="date"
                    value={dentalRecord.examination_date}
                    onChange={(e) => handleInputChange("examination_date", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-blue-800">Interactive Dental Chart</h4>
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Info className="w-4 h-4" />
                  <span>Click on teeth to mark conditions</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-inner">
                {/* Upper Teeth */}
                <div className="mb-8">
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      Upper Teeth
                    </span>
                  </div>
                  {upperTeeth.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-8 gap-4 mb-4 justify-center">
                      {row.map((toothNum) => (
                        <div key={toothNum} className="text-center">
                          {rowIndex === 0 && (
                            <div className="text-xs font-semibold text-blue-700 mb-2 bg-blue-100 rounded px-2 py-1">
                              {toothNum}
                            </div>
                          )}
                          <div
                            onClick={() => handleToothClick(toothNum)}
                            className={`w-12 h-16 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${getToothColor(toothNum)}`}
                            title={`Tooth ${toothNum} - Current: ${dentalRecord.teethConditions[toothNum] || "normal"}`}
                          >
                            {dentalRecord.teethConditions[toothNum] === "extraction" && (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-white font-bold text-xl">✕</span>
                              </div>
                            )}
                          </div>
                          {rowIndex === 1 && (
                            <div className="text-xs font-semibold text-blue-700 mt-2 bg-blue-100 rounded px-2 py-1">
                              {toothNum}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* R and L indicators */}
                <div className="flex justify-between items-center mb-8 px-8">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-900">R</span>
                  </div>
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-900">L</span>
                  </div>
                </div>

                {/* Lower Teeth */}
                <div>
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      Lower Teeth
                    </span>
                  </div>
                  {lowerTeeth.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-8 gap-4 mb-4 justify-center">
                      {row.map((toothNum) => (
                        <div key={toothNum} className="text-center">
                          {rowIndex === 0 && (
                            <div className="text-xs font-semibold text-blue-700 mb-2 bg-blue-100 rounded px-2 py-1">
                              {toothNum}
                            </div>
                          )}
                          <div
                            onClick={() => handleToothClick(toothNum)}
                            className={`w-12 h-16 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${getToothColor(toothNum)}`}
                            title={`Tooth ${toothNum} - Current: ${dentalRecord.teethConditions[toothNum] || "normal"}`}
                          >
                            {dentalRecord.teethConditions[toothNum] === "extraction" && (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-white font-bold text-xl">✕</span>
                              </div>
                            )}
                          </div>
                          {rowIndex === 1 && (
                            <div className="text-xs font-semibold text-blue-700 mt-2 bg-blue-100 rounded px-2 py-1">
                              {toothNum}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl border border-yellow-200">
                  <h5 className="font-bold text-blue-800 mb-4 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Condition Legend
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                      <span className="font-medium">Normal</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
                      <span className="font-medium">Caries</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 border-2 border-blue-700 rounded"></div>
                      <span className="font-medium">Composite</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-gray-800 border-2 border-gray-900 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✕</span>
                      </div>
                      <span className="font-medium">Extraction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Purpose of Visit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "checkup_enrollment",
                    label: "Dental Check-Up for Enrollment",
                  },
                  {
                    key: "consultation",
                    label: "Dental Consultation",
                  },
                  {
                    key: "oral_prophylaxis",
                    label: "Oral Prophylaxis",
                  },
                  {
                    key: "fluoride_varnish",
                    label: "Fluoride Varnish Application",
                  },
                ].map((purpose) => (
                  <label
                    key={purpose.key}
                    className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-yellow-400 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={dentalRecord.purpose[purpose.key]}
                      onChange={(e) => handlePurposeChange(purpose.key, e.target.checked)}
                      className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="font-medium text-gray-700">{purpose.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Oral Hygiene Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    value: "excellent",
                    label: "Excellent",
                    color: "green",
                  },
                  {
                    value: "good",
                    label: "Good",
                    color: "yellow",
                  },
                  {
                    value: "poor",
                    label: "Poor",
                    color: "red",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="oral_hygiene"
                      value={option.value}
                      checked={dentalRecord.oral_hygiene === option.value}
                      onChange={(e) => handleInputChange("oral_hygiene", e.target.value)}
                      className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="font-semibold text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Clinical Findings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Decayed Teeth</label>
                  <input
                    type="number"
                    value={dentalRecord.decayed_teeth_count}
                    onChange={(e) => handleInputChange("decayed_teeth_count", Number.parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-center"
                    min="0"
                    max="32"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Teeth for Extraction
                  </label>
                  <input
                    type="number"
                    value={dentalRecord.extraction_teeth_count}
                    onChange={(e) => handleInputChange("extraction_teeth_count", Number.parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-center"
                    min="0"
                    max="32"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Treatment Plan & Remarks</h4>
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Oral Prophylaxis Notes</label>
                  <input
                    type="text"
                    value={dentalRecord.oral_prophylaxis_notes}
                    onChange={(e) => handleInputChange("oral_prophylaxis_notes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notes for oral prophylaxis treatment..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tooth Filling Numbers</label>
                    <input
                      type="text"
                      value={dentalRecord.tooth_filling_numbers}
                      onChange={(e) => handleInputChange("tooth_filling_numbers", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 11, 12, 21"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tooth Extraction Numbers</label>
                    <input
                      type="text"
                      value={dentalRecord.tooth_extraction_numbers}
                      onChange={(e) => handleInputChange("tooth_extraction_numbers", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 18, 28, 38"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Additional Notes</h4>
              <textarea
                value={dentalRecord.other_notes}
                onChange={(e) => handleInputChange("other_notes", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Additional observations, recommendations, or notes..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">Examining Dentist</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={dentalRecord.school_dentist}
                  onChange={(e) => handleInputChange("school_dentist", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Dr. [Dentist Name]"
                />
                <p className="text-sm text-gray-500 mt-2">School Dentist - National University</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 flex-shrink-0">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-8 py-3 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-bold shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Dental Record
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DentalRecordsModal
