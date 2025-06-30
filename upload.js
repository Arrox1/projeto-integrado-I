
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

  // 🔑 Supabase credentials
  const SUPABASE_URL = 'https://llcxblljabowzahodeui.supabase.co'
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // DOM Elements
  const materiaSelect = document.getElementById('materiaSelect')
  const moduloSelect = document.getElementById('moduloSelect')

  async function loadMaterias() {
    const { data, error } = await supabase
      .from('materias')
      .select('id, nome')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar matérias:', error)
      return
    }

    materiaSelect.innerHTML = '<option value="">Selecione a matéria</option>'
    data.forEach(materia => {
      materiaSelect.innerHTML += `<option value="${materia.id}">${materia.nome}</option>`
    })
  }

  async function loadModulos(materiaId) {
    if (!materiaId) {
      moduloSelect.innerHTML = '<option value="">Selecione o módulo</option>'
      return
    }

    const { data, error } = await supabase
      .from('modulos')
      .select('id, nome')
      .eq('materia_id', materiaId)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao carregar módulos:', error)
      return
    }

    moduloSelect.innerHTML = '<option value="">Selecione o módulo</option>'
    data.forEach(modulo => {
      moduloSelect.innerHTML += `<option value="${modulo.id}">${modulo.nome}</option>`
    })
  }

  // Event listeners
  materiaSelect.addEventListener('change', () => {
    const materiaId = materiaSelect.value
    loadModulos(materiaId)
  })

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    loadMaterias()
  })


  const uploadForm = document.getElementById('upload-form')
const statusMessage = document.getElementById('status')
const loadingSpinner = document.getElementById('loading-spinner')

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  // Mostrar loading
  statusMessage.textContent = ''
  loadingSpinner.classList.remove('hidden')

  // Obter dados do formulário
  const moduloId = parseInt(moduloSelect.value)
  const titulo = document.getElementById('aulaTitulo').value.trim()
  const descricao = document.getElementById('descricao').value.trim()
  const videoUrl = document.getElementById('youtubeUrl').value.trim()

  // Validação básica
  if (!moduloId || !titulo || !videoUrl) {
    statusMessage.textContent = 'Por favor preencha todos os campos obrigatórios.'
    loadingSpinner.classList.add('hidden')
    return
  }

  // Inserir na base de dados
  const { error } = await supabase.from('aulas').insert([
    {
      modulo_id: moduloId,
      titulo,
      descricao,
      video_url: videoUrl,
      ordem: 1, // ou calcula dinamicamente com base no módulo
      data_publicacao: new Date().toISOString().split('T')[0] // yyyy-mm-dd
    }
  ])

  loadingSpinner.classList.add('hidden')

  if (error) {
    console.error('Erro ao inserir aula:', error)
    statusMessage.textContent = 'Erro ao publicar a aula. Tenta novamente.'
  } else {
    statusMessage.textContent = 'Aula publicada com sucesso!'
    uploadForm.reset()
    moduloSelect.innerHTML = '<option value="">Selecione o módulo</option>'
  }
})


/* defs button */

document.getElementById('settings-btn')?.addEventListener('click', () => {
  window.location.href = 'settings.html';
});