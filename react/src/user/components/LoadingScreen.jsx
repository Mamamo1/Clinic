import { useLoading } from "./LoadingContext"
import { Loader2, Upload, Download, Shield, UserCheck, FileText, Calendar } from "lucide-react"

const LoadingScreen = () => {
  const { loading, loadingMessage, loadingType } = useLoading()

  if (!loading) return null

  // Different loading animations based on type
  const getLoadingIcon = () => {
    switch (loadingType) {
      case "auth":
        return <UserCheck className="w-8 h-8 text-yellow-400 animate-pulse" />
      case "upload":
        return <Upload className="w-8 h-8 text-green-400 animate-bounce" />
      case "download":
        return <Download className="w-8 h-8 text-blue-400 animate-bounce" />
      case "security":
        return <Shield className="w-8 h-8 text-red-400 animate-pulse" />
      case "document":
        return <FileText className="w-8 h-8 text-purple-400 animate-pulse" />
      case "appointment":
        return <Calendar className="w-8 h-8 text-green-400 animate-pulse" />
      default:
        return <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    }
  }

  const getLoadingColor = () => {
    switch (loadingType) {
      case "auth":
        return "from-blue-500/20 to-green-500/20"
      case "upload":
        return "from-green-400/20 to-green-600/20"
      case "download":
        return "from-blue-400/20 to-blue-600/20"
      case "security":
        return "from-red-400/20 to-red-600/20"
      case "document":
        return "from-purple-400/20 to-purple-600/20"
      case "appointment":
        return "from-green-400/20 to-emerald-600/20"
      default:
        return "from-yellow-400/20 to-blue-600/20"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-400/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-yellow-300/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main loading container */}
      <div className="relative flex flex-col justify-center items-center bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md mx-4">
        {/* NU Logo with enhanced animation */}
        <div className="relative mb-8">
          <div className="relative">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
              alt="NU Logo"
              className="w-24 h-24 animate-spin-slow"
            />
            {/* Rotating ring around logo */}
            <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 border-r-yellow-400 rounded-full animate-spin"></div>
            {/* Pulsing background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${getLoadingColor()} rounded-full animate-pulse scale-150`}
            ></div>
          </div>
        </div>

        {/* Loading content */}
        <div className="text-center space-y-4">
          {/* NU-CARES branding */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">NU-CARES</h2>
            <p className="text-yellow-300 text-sm font-medium">Medical Portal</p>
          </div>

          {/* Loading message with icon */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            {getLoadingIcon()}
            <p className="text-white text-xl font-bold">{loadingMessage}</p>
          </div>

          {/* Loading progress bar */}
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-loading-bar"></div>
          </div>

          {/* Additional context message */}
          <p className="text-blue-200 text-sm mt-4">Please wait a moment...</p>

          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-yellow-400/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-blue-400/20 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}

export default LoadingScreen
