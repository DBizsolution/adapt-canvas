import { intentModel } from '@/domain/intent-model/model'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">VBS Intent Model Review</h1>
      <p className="mt-4 text-muted-foreground">Consensus System — coming soon</p>
      <pre className="mt-8 rounded bg-muted p-4 text-sm">
        {JSON.stringify(intentModel.meta, null, 2)}
      </pre>
    </main>
  )
}
