"use client"

import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { Contact } from "@/components/landing/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* <Hero /> */}
      <Features />
      {/* <Pricing /> */}
      {/* <Testimonials />
      <Contact /> */}
      <Footer />
    </main>
  )
}
