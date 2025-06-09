// Inicializar Supabase
const client = supabase.createClient(
  "https://llcxblljabowzahodeui.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI"
);

// DOM Elements
const form = document.getElementById("auth-form");
const formTitle = document.getElementById("form-title");
const authButton = document.getElementById("auth-button");
const toggleText = document.getElementById("toggle-text");
const errorMessage = document.getElementById("error-message");

let isLogin = true;

// Atualiza o formulário (login ou criar conta)
function updateForm() {
  formTitle.textContent = isLogin ? "Entrar na W3BSCHOOL" : "Criar conta na W3BSCHOOL";
  authButton.textContent = isLogin ? "Entrar" : "Criar conta";
  toggleText.innerHTML = isLogin
    ? `Ainda não tens conta? <a href="#" id="toggle-link">Criar conta</a>`
    : `Já tens conta? <a href="#" id="toggle-link">Entrar</a>`;
  errorMessage.textContent = "";
}

// Evento para alternar entre login e criar conta (delegation)
toggleText.addEventListener("click", (e) => {
  if (e.target && e.target.id === "toggle-link") {
    e.preventDefault();
    isLogin = !isLogin;
    updateForm();
  }
});

// Submissão do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMessage.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (isLogin) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      errorMessage.textContent = "Erro ao entrar: " + error.message;
    } else {
      window.location.href = "videos.html"; // Redireciona após login bem-sucedido
    }
  } else {
    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      errorMessage.textContent = "Erro ao criar conta: " + error.message;
    } else {
      alert("Conta criada com sucesso! Verifica teu e-mail.");
      isLogin = true;
      updateForm();
    }
  }
});

// Inicialização do formulário
updateForm();
