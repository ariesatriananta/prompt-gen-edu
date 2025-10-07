import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function EdupromptLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('eduprompt')
  return <>{children}</>
}

