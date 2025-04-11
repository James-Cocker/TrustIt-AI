"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemoveImage = () => {
    setImage(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnalyzeImage = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to analyze content",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!image) {
      toast({
        title: "No image selected",
        description: "Please upload an image to analyze",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // In a real implementation, this would upload the image to your backend
      // const formData = new FormData()
      // formData.append('image', image)
      // const response = await fetch('/api/analyze/image', {
      //   method: 'POST',
      //   body: formData
      // })
      // const result = await response.json()

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Navigate to results page with the analysis ID
      router.push(`/results/sample-image-analysis-id`)
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${preview ? "border-gray-300" : "border-gray-400"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="relative">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              width={400}
              height={300}
              className="mx-auto max-h-[300px] w-auto object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center space-y-2">
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Drag and drop an image here</p>
            <p className="text-gray-500 text-sm">or</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Click to select file
            </Button>
            <p className="text-gray-400 text-sm mt-2">Supported formats: JPG, PNG, GIF</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {preview && (
        <Button onClick={handleAnalyzeImage} disabled={isUploading} className="w-full">
          {isUploading ? "Analyzing..." : "Analyze Image"}
        </Button>
      )}
    </div>
  )
}