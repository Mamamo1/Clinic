import { createContext, useContext, useState, useCallback } from "react"
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
  const [loadingType, setLoadingType] = useState("default")

  const showLoading = useCallback((message = "Processing...", type = "default") => {
    setLoadingMessage(message)
    setLoadingType(type)
    setLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setLoading(false)
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
