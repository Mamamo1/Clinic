"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLoading } from "./user/components/LoadingContext"

const RoleBasedRedirect = () => {
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const redirectBasedOnRole = async () => {
      try {
        showLoading("Redirecting to dashboard...", "auth")

        const auth_token = localStorage.getItem("auth_token")

        if (!auth_token) {
          navigate("/login")
          return
        }

        const response = await fetch("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()

          if (userData.account_type === "SuperAdmin") {
            navigate("/admin")
          } else if (["Doctor", "Nurse", "Dentist"].includes(userData.account_type)) {
            navigate("/medicalStaff")
          } else if (["SHS", "College", "Employee"].includes(userData.account_type)) {
            navigate("/user")
          } else {
            // Unknown role, redirect to login
            localStorage.removeItem("auth_token")
            localStorage.removeItem("account_type")
            navigate("/login")
          }
        } else {
          // Invalid token, redirect to login
          localStorage.removeItem("auth_token")
          localStorage.removeItem("account_type")
          navigate("/login")
        }
      } catch (error) {
        // Error occurred, redirect to login
        localStorage.removeItem("auth_token")
        localStorage.removeItem("account_type")
        navigate("/login")
      } finally {
        hideLoading()
      }
    }

    redirectBasedOnRole()
  }, [navigate, showLoading, hideLoading])

  return null // This component doesn't render anything
}

export default RoleBasedRedirect
