"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase/firebase"
import { deleteUserData } from "@/lib/firebase/firestore"

// Create auth context
export const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  createUser: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}>({
  user: null,
  loading: true,
  signIn: async () => {},
  createUser: async () => {},
  signOut: async () => {},
  deleteAccount: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const createUser = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const deleteAccount = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid
      // First delete user data from Firestore
      await deleteUserData(userId)
      // Then delete the user account
      await firebaseDeleteUser(auth.currentUser)
    } else {
      throw new Error("No user is currently signed in")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, createUser, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}
