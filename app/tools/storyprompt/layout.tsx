import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function StorypromptLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('storyprompt')
  return <>{children}</>
}

