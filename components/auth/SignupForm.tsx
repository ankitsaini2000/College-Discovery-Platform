"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { User, Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { toast } from "sonner"

export default function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function getPasswordStrength(pw: string): { label: string; width: string; color: string } | null {
    if (!pw) return null
    if (pw.length < 6) return { label: "Weak", width: "w-1/3", color: "bg-red-500" }
    if (pw.length < 10) return { label: "Fair", width: "w-2/3", color: "bg-yellow-500" }
    return { label: "Strong", width: "w-full", color: "bg-green-500" }
  }

  const strength = getPasswordStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordsMismatch = confirmPassword && password !== confirmPassword

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to create account")
        setIsLoading(false)
        return
      }

      toast.success(data.message || "Account created! Check your email for the verification link.")
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setIsLoading(false)
    } catch {
      toast.error("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Create your account</h3>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign up with Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          required
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {strength && (
            <div className="mt-2">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${strength.width} ${strength.color} rounded-full transition-all duration-300`} />
              </div>
              <p className={`text-xs mt-0.5 ${
                strength.color === "bg-red-500" ? "text-red-500" :
                strength.color === "bg-yellow-500" ? "text-yellow-600" : "text-green-600"
              }`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {passwordsMatch && <Check className="h-4 w-4 text-green-500" />}
              {passwordsMismatch && <X className="h-4 w-4 text-red-500" />}
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          By signing up you agree to our{" "}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>
    </div>
  )
}
