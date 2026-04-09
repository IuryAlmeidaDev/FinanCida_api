"use client"

import * as React from "react"

import brandLogo from "@/public/brand/financida-logo.png"

export function useBrandLogoReady() {
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    const image = new window.Image()
    const fallbackTimer = window.setTimeout(() => setIsReady(true), 2500)

    function markReady() {
      window.clearTimeout(fallbackTimer)
      setIsReady(true)
    }

    image.onload = markReady
    image.onerror = markReady
    image.src = brandLogo.src

    if (image.complete) {
      markReady()
    }

    return () => {
      window.clearTimeout(fallbackTimer)
      image.onload = null
      image.onerror = null
    }
  }, [])

  return isReady
}
