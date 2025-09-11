"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLoading } from "./components/LoadingContext"

const UserRoute = ({ children, allowedRoles = ["SHS", "College", "Employee"] }) => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        showLoading("Verifying access...", "auth")

        const auth_token = localStorage.getItem("auth_token")

        if (!auth_token) {
          navigate("/login")
          return
        }

        const response = await fetch("http://localhost:8000/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth_token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const userData = await response.json()

          if (userData && userData.account_type && allowedRoles.includes(userData.account_type)) {
            setUser(userData)
          } else {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("account_type")
            localStorage.removeItem("first_name")
            navigate("/login")
            return
          }
        } else if (response.status === 401) {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("account_type")
          localStorage.removeItem("first_name")
          navigate("/login")
          return
        } else {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("account_type")
          localStorage.removeItem("first_name")
          navigate("/login")
          return
        }
      } catch (err) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("account_type")
        localStorage.removeItem("first_name")
        navigate("/login")
        return
      } finally {
        hideLoading()
      }
    }

    checkAuth()
  }, [allowedRoles, navigate, showLoading, hideLoading])

  return user ? children : null
}

export default UserRoute
