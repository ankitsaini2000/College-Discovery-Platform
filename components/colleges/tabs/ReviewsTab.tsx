"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Star, ThumbsUp, ThumbsDown, PenLine, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui"
import { toast } from "sonner"
import AuthPrompt from "@/components/shared/AuthPrompt"
import type { ReviewWithUser } from "@/types"

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

function getRatingDistribution(reviews: ReviewWithUser[]) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews) {
    const star = Math.round(r.rating)
    if (star >= 1 && star <= 5) dist[star as keyof typeof dist]++
  }
  return dist
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-colors"
        >
          <Star
            className={`h-7 w-7 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  )
}

function ReviewForm({
  collegeSlug,
  onSuccess,
  onCancel,
}: {
  collegeSlug: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [pros, setPros] = useState("")
  const [cons, setCons] = useState("")
  const [batch, setBatchYear] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating || title.length < 5 || content.length < 50) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/colleges/${collegeSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          content,
          pros: pros || undefined,
          cons: cons || undefined,
          batch: batch ? parseInt(batch) : undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit")
      }

      toast.success("Review submitted successfully!")
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          minLength={5}
          maxLength={100}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <p className={`text-xs mt-1 ${
          title.length > 90 ? "text-orange-500" : title.length > 95 ? "text-red-500" : "text-gray-400"
        }`}>{title.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your detailed experience..."
          minLength={50}
          maxLength={2000}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-y"
        />
        <p className={`text-xs mt-1 ${
          content.length > 1900 ? "text-orange-500" : content.length > 1950 ? "text-red-500" : "text-gray-400"
        }`}>{content.length}/2000</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pros (optional)</label>
          <input
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="What did you like?"
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <p className={`text-xs mt-1 ${
            pros.length > 450 ? "text-orange-500" : pros.length > 475 ? "text-red-500" : "text-gray-400"
          }`}>{pros.length}/500</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cons (optional)</label>
          <input
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="What could be improved?"
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <p className={`text-xs mt-1 ${
            cons.length > 450 ? "text-orange-500" : cons.length > 475 ? "text-red-500" : "text-gray-400"
          }`}>{cons.length}/500</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year (optional)</label>
        <input
          type="number"
          value={batch}
          onChange={(e) => setBatchYear(e.target.value)}
          placeholder="Your graduation year (e.g. 2024)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 max-w-xs"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={!rating || title.length < 5 || content.length < 50 || submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function ReviewsTab({
  reviews: initialReviews,
  collegeSlug,
  currentUserId,
  totalReviews: initialTotal,
  initialRating,
}: {
  reviews: ReviewWithUser[]
  collegeId: string
  collegeSlug: string
  currentUserId: string | null
  totalReviews: number
  initialRating: number | null
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [totalReviews, setTotalReviews] = useState(initialTotal)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const userReview = reviews.find((r) => r.user.id === currentUserId)
  const dist = getRatingDistribution(reviews)
  const total = reviews.length || 1

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="text-center shrink-0">
            <p className="text-5xl font-bold text-gray-900">
              {initialRating?.toFixed(1) || "0.0"}
            </p>
            <StarDisplay rating={Math.round(initialRating || 0)} />
            <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
          </div>

          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = dist[star as keyof typeof dist]
              const pct = Math.round((count / total) * 100)
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-gray-500 w-8 text-xs">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6">
          {!currentUserId ? (
            <AuthPrompt
              message="Log in to write a review"
              action="Log In to Review"
              callbackUrl={`/colleges/${collegeSlug}`}
            />
          ) : userReview ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                You have already reviewed this college
              </span>
            </div>
          ) : showForm ? (
            <ReviewForm
              collegeSlug={collegeSlug}
              onSuccess={() => {
                setShowForm(false)
                router.refresh()
              }}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <PenLine className="h-4 w-4" />
              Write a Review
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <PenLine className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No reviews yet. Be the first to review this college!</p>
            {currentUserId && !showForm && (
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <PenLine className="h-4 w-4" />
                Write a Review
              </Button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                    {(review.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarDisplay rating={review.rating} />
                      {review.batch && (
                        <span className="text-xs text-gray-400">Batch of {review.batch}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>

              <div className="flex flex-wrap gap-4 mt-3">
                {review.pros && (
                  <div className="flex items-center gap-1.5 text-sm text-green-600">
                    <ThumbsUp className="h-4 w-4" />
                    {review.pros}
                  </div>
                )}
                {review.cons && (
                  <div className="flex items-center gap-1.5 text-sm text-red-500">
                    <ThumbsDown className="h-4 w-4" />
                    {review.cons}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
