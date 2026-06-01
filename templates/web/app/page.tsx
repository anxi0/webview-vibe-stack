export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold select-none">{{projectName}}</h1>
      <p className="text-sm text-gray-500 mt-2 select-none">Built with webview-vibe-stack</p>
    </div>
  )
}
