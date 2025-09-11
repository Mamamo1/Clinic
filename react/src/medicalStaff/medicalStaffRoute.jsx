"use client"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useLoading } from "../user/components/LoadingContext"

const MedicalStaffRoute = ({ children }) => {
  const [user, setUser] = useState(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const checkMedicalStaffAuth = async () => {
      try {
        showLoading("Verifying medical staff access...", "auth")

        const auth_token = localStorage.getItem("auth_token")

        if (!auth_token) {
          setUnauthorized(true)
          return
        }

        const response = await fetch("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()

          const medicalStaffRoles = ["Doctor", "Nurse", "Dentist"]
          if (userData && medicalStaffRoles.includes(userData.account_type)) {
            setUser(userData)
          } else {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("account_type")
            setUnauthorized(true)
          }
        } else {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("account_type")
          setUnauthorized(true)
        }
      } catch (err) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("account_type")
        setUnauthorized(true)
      } finally {
        setLoading(false)
        hideLoading()
      }
    }

    checkMedicalStaffAuth()
  }, []) // Removed showLoading and hideLoading from dependencies to prevent infinite loop

  if (loading) {
    return null
  }

  if (unauthorized) {
    return <Navigate to="/login" replace />
  }

  return user ? children : <Navigate to="/login" replace />
}

export default MedicalStaffRoute
