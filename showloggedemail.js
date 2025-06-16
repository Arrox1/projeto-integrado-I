import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔑 Substitua pelas suas credenciais do Supabase
const SUPABASE_URL = 'https://llcxblljabowzahodeui.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 🧠 Mostra o email do usuário logado
async function checkAuthStatus() {
  const { data: { user } } = await supabase.auth.getUser()

  const userMenu = document.getElementById('user-menu')
  const userEmailSpan = document.getElementById('user-email')
  const userDropdown = document.getElementById('user-dropdown')

  if (user) {
    userMenu.classList.remove('hidden')
    userEmailSpan.textContent = user.email
  } else {
    window.location.href = 'login.html'
  }

  // Toggle do menu
  userEmailSpan.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden')
  })

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = 'index.html'
  })
}

checkAuthStatus()
