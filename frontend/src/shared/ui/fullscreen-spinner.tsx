export function FullscreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="relative h-9 w-9">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-line2 border-t-acc" />
      </div>
    </div>
  )
}
