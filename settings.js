import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://llcxblljabowzahodeui.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'
)

// Elementos do DOM
const nameInput = document.getElementById('nameInput');
const passwordInput = document.getElementById('passwordInput');
const updateNameBtn = document.getElementById('updateNameBtn');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const statusMessage = document.getElementById('statusMessage');

let currentUser = null;

// Função principal
async function checkAuthStatus() {
  const { data: { user } } = await supabase.auth.getUser()
  const userMenu = document.getElementById('user-menu')
  const userEmailSpan = document.getElementById('user-email')
  const userDropdown = document.getElementById('user-dropdown')

  if (user) {
    currentUser = user
    userMenu.classList.remove('hidden')

    let displayName = 'Utilizador'
    if (user.user_metadata?.full_name) {
      displayName = user.user_metadata.full_name
    } else if (user.user_metadata?.name) {
      displayName = user.user_metadata.name
    } else if (user.email) {
      displayName = user.email.split('@')[0]
    }
    userEmailSpan.textContent = displayName

    userEmailSpan.addEventListener('click', () => userDropdown.classList.toggle('hidden'))
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await supabase.auth.signOut()
      window.location.href = 'index.html'
    })

  } else {
    window.location.href = 'login.html'
  }
}   

// Atualizar nome
updateNameBtn.addEventListener('click', async () => {
  const newName = nameInput.value.trim();
  if (!newName) return showMessage('Insere um nome válido.', true);

  const { error } = await supabase.auth.updateUser({
    data: { full_name: newName }
  });

  if (error) return showMessage('Erro ao atualizar nome: ' + error.message, true);
  showMessage('Nome atualizado com sucesso!');
});

// Atualizar password
updatePasswordBtn.addEventListener('click', async () => {
  const newPassword = passwordInput.value.trim();
  if (newPassword.length < 6) return showMessage('A password deve ter pelo menos 6 caracteres.', true);

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) return showMessage('Erro ao atualizar password: ' + error.message, true);
  showMessage('Password atualizada com sucesso!');
});

// Apagar conta
deleteAccountBtn.addEventListener('click', async () => {
  const confirmDelete = confirm('Tens a certeza que queres apagar a tua conta? Esta ação não pode ser desfeita.');
  if (!confirmDelete) return;

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return showMessage('Erro ao obter sessão. Tenta novamente.', true);

  const response = await fetch('https://llcxblljabowzahodeui.supabase.co/auth/v1/user', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (response.ok) {
    showMessage('Conta apagada com sucesso. A sair...', false);
    await supabase.auth.signOut();
    setTimeout(() => window.location.href = 'index.html', 2000);
  } else {
    showMessage('Erro ao apagar conta.', true);
  }
});

// Mostrar mensagens
function showMessage(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.style.color = isError ? 'red' : 'green';
}

init();
