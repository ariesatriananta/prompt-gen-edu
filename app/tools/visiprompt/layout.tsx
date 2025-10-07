import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function VisipromptLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('visiprompt')
  return <>{children}</>
}

