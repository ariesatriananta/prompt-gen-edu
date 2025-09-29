import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free Trial",
    price: "3 Hari",
    sub: "Coba semua fitur dasar",
    features: [
      "Akses template dasar",
      "Limit penggunaan harian",
      "Export teks",
    ],
    cta: "Coba Gratis",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "IDR 100K /bulan",
    sub: "Untuk power user & tim kecil",
    features: [
      "Semua di Free",
      "Template premium",
      "Kustomisasi lanjutan",
      "Prioritas dukungan",
      "Ekspor ke Docs/Slides",
    ],
    cta: "Pilih Professional",
    href: "/login",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "IDR 500K /bulan",
    sub: "Skala organisasi & advanced control",
    features: [
      "Semua di Professional",
      "Admin & role management",
      "Integrasi SSO & audit",
      "SLA dukungan 24/7",
    ],
    cta: "Hubungi Kami",
    href: "/login",
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold">Paket Harga</h2>
        <p className="mt-2 text-muted-foreground">Simple, transparan, dan fleksibel</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={
              "relative rounded-3xl border bg-card p-6 shadow-sm " + (p.highlighted ? "ring-1 ring-primary" : "")
            }
          >
            {p.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                Most Popular
              </Badge>
            )}
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.sub}</p>
            <div className="mt-4 text-3xl font-bold">{p.price}</div>

            <ul className="mt-4 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 inline-block size-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="mt-6 w-full rounded-2xl">
              <Link href={p.href}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Tidak perlu kartu kredit untuk memulai Free Trial.
      </p>
    </section>
  )
}

