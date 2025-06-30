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

// Atualizar nome em Auth + Tabela "users"
updateNameBtn.addEventListener('click', async () => {
  const newName = nameInput.value.trim();
  if (!newName) return showMessage('Insere um nome válido.', true);

  // 1. Atualizar no Auth (user_metadata)
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: newName }
  });
  if (authError) return showMessage('Erro ao atualizar nome no Auth: ' + authError.message, true);

  // 2. Atualizar na tabela 'users'
  const { error: userTableError } = await supabase
    .from('users')
    .update({ full_name: newName })
    .eq('id', currentUser.id);
  if (userTableError) return showMessage('Erro ao atualizar nome na base de dados: ' + userTableError.message, true);

  // 3. Atualizar todos os comentários antigos (aula_comments)
  const { error: commentError } = await supabase
    .from('aula_comments')
    .update({ user_name: newName })
    .eq('user_id', currentUser.id);
  if (commentError) return showMessage('Nome atualizado, mas houve erro ao atualizar comentários: ' + commentError.message, true);

  // 4. Atualizar texto no menu dropdown (interface)
  const userEmailSpan = document.getElementById('user-email');
  if (userEmailSpan) userEmailSpan.textContent = newName;

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

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return showMessage('Erro ao obter sessão. Tenta novamente.', true);
  }

  // ⚠️ Só funciona se o utilizador estiver autenticado E com permissões de apagar-se
  const response = await fetch('https://llcxblljabowzahodeui.supabase.co/auth/v1/user', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'
    }
  });

  if (response.ok) {
    showMessage('Conta apagada com sucesso. A sair...');
    await supabase.auth.signOut();
    setTimeout(() => window.location.href = 'index.html', 2000);
  } else {
    const errorText = await response.text();
    showMessage('Erro ao apagar conta: ' + errorText, true);
    console.error('Erro ao apagar:', errorText);
  }
});

// Mostrar mensagens
function showMessage(msg, isError = false) {
  statusMessage.textContent = msg;
  statusMessage.style.color = isError ? 'red' : 'green';
}

// Inicializar
checkAuthStatus();
