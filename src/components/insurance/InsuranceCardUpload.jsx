/**
 * Insurance Card Upload Component
 * Handles image upload, preview, and OCR processing
 */

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadImage, deleteImage } from "@/services/firebase/storage"
import { processInsuranceCardOCR } from "@/services/insurance/OCRProcessor"
import { useAuth } from "@/contexts/AuthContext"

/**
 * InsuranceCardUpload Component
 * @param {Object} props
 * @param {Function} props.onOCRComplete - Callback when OCR processing completes
 * @param {Function} props.onError - Callback for errors
 */
export function InsuranceCardUpload({ onOCRComplete, onError }) {
  const { user } = useAuth()
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

  const handleFileSelect = (file) => {
    setError(null)
    setOcrResult(null)

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPG or PNG image')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = async () => {
    // Delete uploaded image from storage if exists
    if (uploadedImageUrl) {
      try {
        await deleteImage(uploadedImageUrl)
      } catch (err) {
        console.error('Error deleting image:', err)
      }
    }

    setImageFile(null)
    setImagePreview(null)
    setOcrResult(null)
    setError(null)
    setUploadedImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleProcessOCR = async () => {
    if (!imageFile) {
      setError('Please select an image first')
      return
    }

    setProcessing(true)
    setError(null)
    setOcrResult(null)

    try {
      if (!user) {
        throw new Error('User must be authenticated to upload images')
      }

      // Step 1: Upload image to Firebase Storage
      setUploading(true)
      const imageUrl = await uploadImage(imageFile, 'insurance-cards', user.uid)
      setUploadedImageUrl(imageUrl)
      setUploading(false)

      // Step 2: Process OCR via Firebase Function
      const result = await processInsuranceCardOCR(imageUrl)

      if (result.success) {
        setOcrResult(result.data)
        if (onOCRComplete) {
          onOCRComplete(result.data)
        }
      } else {
        throw new Error(result.error || 'OCR processing failed')
      }
    } catch (err) {
      console.error('OCR processing error:', err)
      const errorMessage = err.message || 'Failed to process insurance card. Please try again or enter information manually.'
      setError(errorMessage)
      if (onError) {
        onError(err)
      }
    } finally {
      setProcessing(false)
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Insurance Card</CardTitle>
        <CardDescription>
          Take a photo of your insurance card for automatic data extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!imagePreview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-200",
              "hover:border-primary hover:bg-primary/5 cursor-pointer",
              error ? "border-destructive" : "border-border"
            )}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload insurance card image"
          >
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
            <p className="font-semibold text-foreground mb-1 text-sm sm:text-base">
              Drop your insurance card here
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button variant="outline" size="sm" type="button" className="min-h-[44px] sm:min-h-[36px]">
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              aria-label="Select insurance card image file"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imagePreview}
                alt="Insurance card preview"
                className="w-full rounded-lg border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] transition-all duration-200"
                onClick={handleRemove}
                disabled={uploading || processing}
                aria-label="Remove image"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcessOCR}
              disabled={uploading || processing}
              className="w-full min-h-[44px] sm:min-h-[40px] transition-all duration-200"
              aria-label={uploading ? "Uploading image" : processing ? "Processing image" : "Extract insurance information from image"}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Uploading...
                </>
              ) : processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Processing OCR...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                  Extract Information
                </>
              )}
            </Button>
          </div>
        )}

        {/* Tips */}
        {!imagePreview && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Tips for best results:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Capture front side with clear numbers</li>
                <li>Ensure good lighting and no glare</li>
                <li>Include full card in frame</li>
                <li>Make sure text is readable</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OCR Result Display */}
        {ocrResult && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Information extracted successfully!</strong>
              <p className="text-xs mt-1 text-muted-foreground">
                Confidence: {ocrResult.confidence ? `${Math.round(ocrResult.confidence * 100)}%` : 'N/A'}
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

