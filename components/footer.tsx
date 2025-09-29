import Link from "next/link"
import { Wand2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-16">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700" />

        <div className="mx-auto max-w-6xl px-4 py-12 text-white">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <Wand2 className="size-7" />
                <span className="text-xl font-semibold tracking-tight">ClassToon</span>
              </div>
              <p className="mt-3 max-w-md text-white/80">
                Platform AI & Digital Tools untuk edukasi. Hasil cepat, konsisten, dan mudah disesuaikan untuk guru,
                siswa, dan profesional.
              </p>
            </div>

            {/* Menu */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Menu</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>
                  <Link href="/" className="hover:text-white">
                    Beranda
                  </Link>
                </li>
              </ul>
            </div>

            {/* Informasi */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Informasi</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li>
                  <Link href="#terms" className="hover:text-white">
                    Ketentuan Layanan
                  </Link>
                </li>
                <li>
                  <Link href="#privacy" className="hover:text-white">
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ikuti Kami */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">Ikuti Kami</h4>
              <p className="mt-2 text-sm text-white/80">
                Dapatkan inspirasi prompt dan tips belajar di Instagram resmi kami.
              </p>
              <div className="mt-3">
                <Link
                  href="https://instagram.com/"
                  target="_blank"
                  className="inline-flex items-center rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25"
                >
                  Instagram
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 flex items-center justify-center">
            <p className="text-center text-xs text-white/80">
              © {new Date().getFullYear()} ClassToon — AI & Digital Tools. Seluruh merek dagang adalah milik masing-masing.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

