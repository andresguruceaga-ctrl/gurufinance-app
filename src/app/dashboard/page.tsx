import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-10">GuruFinanceApp</h2>
        <nav className="space-y-2">
          <div className="block px-4 py-3 rounded-lg bg-indigo-50 text-indigo-600 font-medium">Dashboard</div>
          <Link href="/login" className="block px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 mt-10">Cerrar Sesión</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Bienvenido a tu Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Gastos del Mes</p>
            <p className="text-2xl font-bold text-gray-800">.00</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Ingresos</p>
            <p className="text-2xl font-bold text-gray-800">.00</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-gray-500 text-sm">Patrimonio</p>
            <p className="text-2xl font-bold text-gray-800">.00</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Tus Finanzas</h2>
          <p className="text-gray-500">La tabla de gastos y datos reales aparecerán aquí una vez conectes la base de datos real en Vercel.</p>
        </div>
      </main>
    </div>
  )
}
