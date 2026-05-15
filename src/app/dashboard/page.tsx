"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'

type Expense = { id: string; description: string; amount: number; category: string; frequency: string; date?: string; notes?: string }
type ParsedRow = { date: string; description: string; amount: number; category: string; frequency: string; notes: string }

export default function Dashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  
  const [form, setForm] = useState({ description: "", amount: "", category: "Supermercado", frequency: "Mensual", notes: "" })

  // Cargar gastos existentes
  useEffect(() => {
    fetch("/api/expenses").then(res => res.json()).then(data => setExpenses(data))
  }, [])

  // Calculos
  const monthlyTotal = expenses.reduce((acc, exp) => {
    const factors: Record<string, number> = { Mensual: 1, Trimestral: 1/3, Cuatrimestral: 1/4, Semestral: 1/6, Anual: 1/12 }
    return acc + (exp.amount * (factors[exp.frequency] || 1))
  }, 0)

  // --- Lógica de Excel ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if(!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        
        // Convierte a JSON. Asume que las columnas son: A=Fecha, B=Descripción, C=Monto
        // Puedes ajustar esto según el formato de tu banco
        const data = XLSX.utils.sheet_to_json(ws, { header: ['date', 'description', 'amount'], range: 1 }) as ParsedRow[]
        
        // Filtrar filas vacías y formatear
        const cleanData = data
          .filter((row: any) => row.description && row.amount)
          .map((row: any) => ({
            date: row.date || new Date().toISOString(),
            description: String(row.description),
            amount: parseFloat(row.amount),
            category: "Supermercado",
            frequency: "Mensual",
            notes: ""
          }))
        
        setParsedData(cleanData)
      } catch (err) {
        alert("Error leyendo el archivo. Asegúrate que sea un Excel (.xlsx) válido.")
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleParsedItemChange = (index: number, field: string, value: string) => {
    const updated = [...parsedData]
    // @ts-ignore
    updated[index][field] = value
    setParsedData(updated)
  }

  const saveParsedData = async () => {
    // En una app real, aquí enviaríamos todo el bloque al backend de una vez
    // Para simplificar, los enviaremos uno por uno
    for (const item of parsedData) {
      await fetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(item),
        headers: { "Content-Type": "application/json" }
      })
    }
    // Recargar lista
    const res = await fetch("/api/expenses")
    setExpenses(await res.json())
    setParsedData([]) // Limpiar lista temporal
    if(fileInputRef.current) fileInputRef.current.value = "" // Limpiar input
    alert("¡Gastos importados exitosamente!")
  }

  // --- Lógica Manual ---
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!form.description || !form.amount) return
    const res = await fetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      headers: { "Content-Type": "application/json" }
    })
    const newExp = await res.json()
    setExpenses([newExp, ...expenses])
    setForm({ description: "", amount: "", category: "Supermercado", frequency: "Mensual", notes: "" })
  }

  const categories = ["Alquiler", "Hipoteca", "Supermercado", "Colegio", "Campamentos", "ExtraCurriculares", "Energia", "Agua", "Internet + Telefono", "Ejercicios", "Salidas", "Vacaciones", "Seguro", "Salud", "Gasolina", "Prestamo Carro", "Netflix", "Compras por Internet", "Ropa"]

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <aside className="w-64 bg-white border-r p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-indigo-600 mb-10">GuruFinanceApp</h2>
        <nav className="flex-1"><div className="block px-4 py-3 rounded-lg bg-indigo-50 text-indigo-600 font-medium">Dashboard</div></nav>
        <button onClick={() => router.push('/login')} className="text-red-500 text-left hover:bg-red-50 p-3 rounded-lg">Cerrar Sesión</button>
      </aside>

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
          {/* Columna Izquierda: Formularios */}
          <div className="space-y-6">
            {/* Formulario Manual */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Agregar Manual</h3>
              <form onSubmit={handleManualAdd} className="space-y-3">
                <input placeholder="Descripción" className="w-full border rounded-lg p-2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                <input type="number" placeholder="Monto" className="w-full border rounded-lg p-2" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                <select className="w-full border rounded-lg p-2" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="w-full border rounded-lg p-2" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                  <option value="Mensual">Mensual</option>
                  <option value="Trimestral">Trimestral</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Anual">Anual</option>
                </select>
                <input placeholder="Notas (Opcional)" className="w-full border rounded-lg p-2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700">Añadir</button>
              </form>
            </div>

            {/* Carga Excel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-200">
              <h3 className="font-semibold mb-2 text-lg">Importar Excel</h3>
              <p className="text-xs text-gray-400 mb-3">Columnas: Fecha, Descripción, Monto</p>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
          </div>

          {/* Columna Derecha: Tablas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vista de Datos Cargados (Pendientes de Categorizar) */}
            {parsedData.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-yellow-800">Revisar Importación ({parsedData.length} items)</h3>
                  <button onClick={saveParsedData} className="bg-yellow-600 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-yellow-700">Guardar Todos</button>
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto bg-white rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-yellow-100 sticky top-0">
                      <tr>
                        <th className="p-2">Descripción</th>
                        <th className="p-2 w-24">Monto</th>
                        <th className="p-2 w-40">Categoría</th>
                        <th className="p-2 w-32">Frecuencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{item.description}</td>
                          <td className="p-2">${item.amount.toFixed(2)}</td>
                          <td className="p-2">
                            <select value={item.category} onChange={e => handleParsedItemChange(idx, 'category', e.target.value)} className="border rounded p-1 w-full text-xs bg-white">
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="p-2">
                            <select value={item.frequency} onChange={e => handleParsedItemChange(idx, 'frequency', e.target.value)} className="border rounded p-1 w-full text-xs bg-white">
                              <option value="Mensual">Mensual</option>
                              <option value="Anual">Anual</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tabla Principal de Gastos */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold">Historial de Gastos</h3>
                <span className="text-sm text-gray-400">{expenses.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-gray-500 text-sm">Fecha</th>
                      <th className="p-3 text-gray-500 text-sm">Descripción</th>
                      <th className="p-3 text-gray-500 text-sm">Categoría</th>
                      <th className="p-3 text-gray-500 text-sm text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-xs text-gray-400">{exp.date ? new Date(exp.date).toLocaleDateString() : '-'}</td>
                        <td className="p-3 text-sm">{exp.description}</td>
                        <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{exp.category}</span></td>
                        <td className="p-3 text-right font-medium text-red-600">${exp.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-400">No hay gastos.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
