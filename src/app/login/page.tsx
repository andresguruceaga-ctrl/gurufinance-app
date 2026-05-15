'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLogin) {
      await fetch('/api/register', { method: 'POST', body: JSON.stringify({ email, password, name: 'Usuario' }), headers: { 'Content-Type': 'application/json' } })
      alert('Usuario creado, ahora inicia sesión')
      setIsLogin(true)
      return
    }
    const res = await fetch('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: \email=\&password=\\ })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">GuruFinanceApp</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full px-4 py-3 border rounded-lg" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" className="w-full px-4 py-3 border rounded-lg" onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 w-full text-sm text-indigo-600 hover:underline">
          {isLogin ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta'}
        </button>
      </div>
    </div>
  )
}
