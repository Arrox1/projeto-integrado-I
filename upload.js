const { createClient } = supabase;
const supabaseClient = createClient(
  "https://llcxblljabowzahodeui.supabase.co",
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0"
);

const form = document.getElementById("upload-form");
const videoInput = document.getElementById("video-file");
const status = document.getElementById("status");
const spinner = document.getElementById("loading-spinner");
const uploadBtn = document.getElementById("upload-button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  spinner.classList.remove("hidden");
  uploadBtn.disabled = true;

  const file = videoInput.files[0];
  if (!file) {
    status.textContent = "Seleciona um vídeo primeiro.";
    spinner.classList.add("hidden");
    uploadBtn.disabled = false;
    return;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error } = await supabaseClient.storage
    .from('videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  spinner.classList.add("hidden");
  uploadBtn.disabled = false;

  if (error) {
    status.style.color = "red";
    status.textContent = "Erro ao enviar: " + error.message;
  } else {
    status.style.color = "green";
    status.textContent = "✅ Vídeo enviado com sucesso!";
    form.reset();
  }
});
