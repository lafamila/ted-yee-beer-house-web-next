export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40">
      <div className="h-full flex items-center px-6">
        <h1 className="text-xl font-bold text-gray-900">TeddyNote</h1>
        <p className="ml-3 text-sm text-gray-500">Developer Memo App</p>
      </div>
    </header>
  );
}
