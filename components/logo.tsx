export function Logo() {
  return (
    <div className="flex items-center justify-center py-4 px-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl animate-bounce">🎨</span>

        <h1 className="text-3xl md:text-4xl font-baloo font-bold bg-gradient-to-r from-blue-500 via-yellow-500 via-red-500 to-green-500 bg-clip-text text-transparent">
          Kid Art Studio
        </h1>

        <span className="text-4xl animate-bounce" style={{ animationDelay: "0.5s" }}>
          ✍️
        </span>
      </div>
    </div>
  )
}
