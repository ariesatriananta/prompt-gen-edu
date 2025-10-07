import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function PlaypromptLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('playprompt')
  return <>{children}</>
}

