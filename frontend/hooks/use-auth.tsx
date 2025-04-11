"use client"

import { useContext } from "react"
import { AuthContext } from "@/components/auth/auth-provider"

export function useAuth() {
  return useContext(AuthContext)
}
