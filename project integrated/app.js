import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
// 🔑 Substitua pelas suas credenciais do Supabase:
const SUPABASE_URL = 'https://llcxblljabowzahodeui.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const searchMateriaInput = document.getElementById('searchMateria')
const materiaSelect = document.getElementById('materiaSelect')
const moduloSelect = document.getElementById('moduloSelect')
const aulaSelect = document.getElementById('aulaSelect')
const lessonList = document.getElementById('lessonList')
const videoPlayer = document.getElementById('videoPlayer')
const videoElement = document.getElementById('videoElement')
const videoTitle = document.getElementById('videoTitle')

let materias = []
let modulos = []
let aulas = []

function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`
  items.forEach(item => {
    selectEl.innerHTML += `<option value="${item.id}">${item.nome || item.titulo}</option>`
  })
  selectEl.disabled = items.length === 0
}

async function loadMaterias() {
  const { data, error } = await supabase
    .from('materias')
    .select('id, nome')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao carregar matérias:', error)
    return
  }

  materias = data
  populateSelect(materiaSelect, materias, 'Selecione a Matéria')
}

async function loadModulos(materiaId) {
  if (!materiaId) {
    populateSelect(moduloSelect, [], 'Selecione o Módulo')
    populateSelect(aulaSelect, [], 'Selecione a Aula')
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

  modulos = data
  populateSelect(moduloSelect, modulos, 'Selecione o Módulo')
  populateSelect(aulaSelect, [], 'Selecione a Aula')
}

async function loadAulas(moduloId) {
  console.log('Carregando aulas para o módulo:', moduloId)
  if (!moduloId) {
    populateSelect(aulaSelect, [], 'Selecione a Aula')
    return
  }

  const { data, error } = await supabase
    .from('aulas')
    .select('id, titulo, video_url')
    .eq('modulo_id', moduloId)
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Erro ao carregar aulas:', error)
    return
  }

  aulas = data
  populateSelect(aulaSelect, aulas, 'Selecione a Aula')
  renderLessonList(aulas)
}

function renderLessonList(aulas) {
  lessonList.innerHTML = ''
  aulas.forEach(aula => {
    const li = document.createElement('li')
    li.textContent = aula.titulo
    li.dataset.video = aula.video_url
    li.dataset.titulo = aula.titulo
    li.addEventListener('click', () => {
      document.querySelectorAll('#lessonList li').forEach(el => el.classList.remove('active'))
      li.classList.add('active')
      playVideo(aula.video_url, aula.titulo)
    })
    lessonList.appendChild(li)
  })
}

function playVideo(url, titulo) {
  if (!url) return
  videoElement.src = url
  videoTitle.textContent = titulo
  videoPlayer.style.display = 'block'
  videoElement.scrollIntoView({ behavior: 'smooth' })
}

searchMateriaInput.addEventListener('input', () => {
  const term = searchMateriaInput.value.toLowerCase()
  const filtradas = materias.filter(m => m.nome.toLowerCase().includes(term))
  populateSelect(materiaSelect, filtradas, 'Selecione a Matéria')
})

materiaSelect.addEventListener('change', (e) => {
  const materiaId = e.target.value
  loadModulos(materiaId)
})

moduloSelect.addEventListener('change', (e) => {
  const moduloId = e.target.value
  loadAulas(moduloId)
})

aulaSelect.addEventListener('change', (e) => {
  const aulaId = parseInt(e.target.value)
  const aula = aulas.find(a => a.id === aulaId)
  if (aula) {
    playVideo(aula.video_url, aula.titulo)
  }
})

// 🔁 Inicializa carregando todas as matérias
loadMaterias()
