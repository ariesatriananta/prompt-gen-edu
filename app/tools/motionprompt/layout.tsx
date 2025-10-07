import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function MotionpromptLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('motionprompt')
  return <>{children}</>
}

