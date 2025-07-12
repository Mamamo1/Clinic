import { createContext, useContext, useState, useCallback } from "react"
// Create a context for loading with enhanced functionality
const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Processing...")
  const [loadingType, setLoadingType] = useState("default") // default, upload, download, auth, etc.

  const showLoading = useCallback((message = "Processing...", type = "default") => {
    setLoadingMessage(message)
    setLoadingType(type)
    setLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setLoading(false)
    // Reset to defaults after a small delay to allow for smooth transitions
    setTimeout(() => {
      setLoadingMessage("Processing...")
      setLoadingType("default")
    }, 300)
  }, [])

  const updateLoadingMessage = useCallback((message) => {
    setLoadingMessage(message)
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        loading,
        loadingMessage,
        loadingType,
        showLoading,
        hideLoading,
        updateLoadingMessage,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}
