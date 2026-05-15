"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Expense = { id: string; description: string; amount: number; category: string; frequency: string }

export default function Dashboard() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Supermercado")
  const [frequency, setFrequency] = useState("Mensual")

  useEffect(() => {
    fetch("/api/expenses")
      .then(res => res.json())
      .then(data => setExpenses(data))
  }, [])

  const monthlyTotal = expenses.reduce((acc, exp) => {
    const factors: Record<string, number> = { Mensual: 1, Trimestral: 1/3, Cuatrimestral: 1/4, Semestral: 1/6, Anual: 1/12 }
    return acc + (exp.amount * (factors[exp.frequency] || 1))
  }, 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!description || !amount) return
    
    const res = await fetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify({ description, amount: parseFloat(amount), category, frequency }),
      headers: { "Content-Type": "application/json" }
    })
    const newExpense = await res.json()
    setExpenses([...expenses, newExpense])
    setDescription("")
    setAmount("")
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-indigo-600 mb-10">GuruFinanceApp</h2>
        <nav className="flex-1 space-y-2">
          <div className="block px-4 py-3 rounded-lg bg-indigo-50 text-indigo-600 font-medium">Dashboard</div>
        </nav>
        <button onClick={() => router.push('/login')} className="block px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 mt-10 text-left">
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Resumen General</h1>
        
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Gastos del Mes</p>
            <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Ingresos</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-gray-500 text-sm">Patrimonio</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm h-fit">
            <h3 className="font-semibold mb-4 text-lg">Agregar Gasto</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <input type="text" placeholder="Descripción" className="w-full border rounded-lg p-2" value={description} onChange={e => setDescription(e.target.value)} required />
              <input type="number" placeholder="Monto" className="w-full border rounded-lg p-2" value={amount} onChange={e => setAmount(e.target.value)} required />
              
              {/* Selector de Categorías Actualizado */}
              <select className="w-full border rounded-lg p-2" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Alquiler</option>
                <option>Hipoteca</option>
                <option>Supermercado</option>
                <option>Colegio</option>
                <option>Campamentos</option>
                <option>ExtraCurriculares</option>
                <option>Energia</option>
                <option>Agua</option>
                <option>Internet + Telefono</option>
                <option>Ejercicios</option>
                <option>Salidas</option>
                <option>Vacaciones</option>
                <option>Seguro</option>
                <option>Salud</option>
                <option>Gasolina</option>
                <option>Prestamo Carro</option>
                <option>Netflix</option>
                <option>Compras por Internet</option>
                <option>Ropa</option>
              </select>

              <select className="w-full border rounded-lg p-2" value={frequency} onChange={e => setFrequency(e.target.value)}>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Añadir</button>
            </form>
          </div>

          {/* Tabla */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Tus Gastos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-gray-500 text-sm">Descripción</th>
                    <th className="p-3 text-gray-500 text-sm">Categoría</th>
                    <th className="p-3 text-gray-500 text-sm">Frecuencia</th>
                    <th className="p-3 text-gray-500 text-sm text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{exp.description}</td>
                      <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{exp.category}</span></td>
                      <td className="p-3 text-sm text-gray-500">{exp.frequency}</td>
                      <td className="p-3 text-right font-medium text-red-600">${exp.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">No hay gastos aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
