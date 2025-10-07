import { enforceToolAccess } from '@/lib/auth/tools-guard'

export default async function QuizpromptLayout({ children }: { children: React.ReactNode }) {
  await enforceToolAccess('quizprompt')
  return <>{children}</>
}

