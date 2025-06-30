import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ====== Supabase Config ======
const SUPABASE_URL = 'https://llcxblljabowzahodeui.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ====== Elementos do DOM ======
const materiaSelect = document.getElementById('materiaSelect')
const moduloSelect = document.getElementById('moduloSelect')
const aulaSelect = document.getElementById('aulaSelect')
const lessonList = document.getElementById('lessonList')
const youtubePlayer = document.getElementById('youtubePlayer')
const videoTitle = document.getElementById('videoTitle')
const videoDescription = document.getElementById('videoDescription')
const videoPlayer = document.getElementById('videoPlayer')

const averageRating = document.getElementById('averageRating')
const averageStars = document.getElementById('averageStars')
const ratingCount = document.getElementById('ratingCount')
const ratingInput = document.getElementById('ratingInput')
const commentInput = document.getElementById('commentInput')
const submitComment = document.getElementById('submitComment')
const commentsList = document.getElementById('commentsList')

let materias = []
let modulos = []
let aulas = []
let currentUser = null
let currentAulaId = null
let selectedRating = 0

// ========== Funções de Vídeo e Aulas ==========
function getYouTubeEmbedUrl(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null
}

function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`
  items.forEach(item => {
    selectEl.innerHTML += `<option value="${item.id}">${item.nome || item.titulo}</option>`
  })
  selectEl.disabled = items.length === 0
}

async function loadMaterias() {
  const { data, error } = await supabase.from('materias').select('id, nome').order('nome', { ascending: true })
  if (error) return console.error('Erro ao carregar matérias:', error)
  materias = data
  populateSelect(materiaSelect, materias, 'Selecione a Matéria')
}

async function loadModulos(materiaId) {
  const { data, error } = await supabase.from('modulos').select('id, nome').eq('materia_id', materiaId).order('ordem')
  if (error) return console.error('Erro ao carregar módulos:', error)
  modulos = data
  populateSelect(moduloSelect, modulos, 'Selecione o Módulo')
  populateSelect(aulaSelect, [], 'Selecione a Aula')
}

async function loadAulas(moduloId) {
  const { data, error } = await supabase.from('aulas').select('id, titulo, video_url, descricao').eq('modulo_id', moduloId).order('ordem')
  if (error) return console.error('Erro ao carregar aulas:', error)
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
    li.dataset.aulaId = aula.id
    li.addEventListener('click', () => {
      document.querySelectorAll('#lessonList li').forEach(el => el.classList.remove('active'))
      li.classList.add('active')
      playVideo(aula.video_url, aula.titulo, aula.id, aula.descricao)
    })
    lessonList.appendChild(li)
  })
}

function playVideo(url, titulo, aulaId, descricao = '') {
  const embedUrl = getYouTubeEmbedUrl(url)
  if (!embedUrl) return alert('URL do YouTube inválida.')
  youtubePlayer.src = embedUrl
  videoTitle.textContent = titulo
  videoDescription.textContent = descricao
  videoPlayer.style.display = 'block'
  currentAulaId = aulaId
  loadComments(aulaId)
  videoPlayer.scrollIntoView({ behavior: 'smooth' })
}

// ========== Comentários e Avaliações ==========
function setupRatingInput() {
  const stars = ratingInput.querySelectorAll('.star[data-rating]')
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating)
      updateRatingDisplay(stars, selectedRating)
    })
    star.addEventListener('mouseover', () => updateRatingDisplay(stars, parseInt(star.dataset.rating)))
  })
  ratingInput.addEventListener('mouseleave', () => updateRatingDisplay(stars, selectedRating))
}

function updateRatingDisplay(stars, rating) {
  stars.forEach((star, index) => {
    star.classList.toggle('filled', index < rating)
  })
}

function updateAverageRating(stars, rating) {
  stars.forEach((star, index) => {
    star.classList.remove('half-filled', 'filled')
    if (index + 1 <= Math.floor(rating)) {
      star.classList.add('filled')
    } else if (index < rating) {
      star.classList.add('half-filled')
    }
  })
}

async function loadComments(aulaId) {
  commentsList.innerHTML = '<div class="loading">Carregando comentários...</div>'
  const { data: comments, error } = await supabase.from('aula_comments').select('*').eq('aula_id', aulaId).order('created_at', { ascending: false })
  if (error) {
    console.error('Erro ao carregar comentários:', error)
    commentsList.innerHTML = '<div class="no-comments">Erro ao carregar comentários</div>'
    return
  }

  const userIds = [...new Set(comments.map(c => c.user_id))]
  const { data: users = [] } = await supabase.from('users').select('id, full_name').in('id', userIds)
  const usersMap = Object.fromEntries(users.map(u => [u.id, u.full_name]))
  renderComments(comments, usersMap)
  updateRatingSummary(comments)
}

function renderComments(comments, usersMap) {
  if (!comments.length) {
    commentsList.innerHTML = '<div class="no-comments">Seja o primeiro a comentar este vídeo!</div>'
    return
  }

  commentsList.innerHTML = comments.map(comment => `
    <div class="comment">
      <div class="comment-header">
        <div>
          <div class="comment-author">${comment.user_name || 'Anônimo'}</div>
          <div class="comment-date">${formatDate(comment.created_at)}</div>
        </div>
        <div class="comment-rating">${generateStarsHTML(comment.rating)}</div>
      </div>
      <p class="comment-text">${escapeHtml(comment.comment)}</p>
    </div>
  `).join('')
}

function generateStarsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) => `<span class="star ${i < rating ? 'filled' : ''}">★</span>`).join('')
}

function updateRatingSummary(comments) {
  if (!comments.length) {
    averageRating.textContent = '0.0'
    ratingCount.textContent = '0 avaliações'
    updateAverageRating(averageStars.querySelectorAll('.star'), 0)
    return
  }
  const total = comments.reduce((sum, c) => sum + c.rating, 0)
  const avg = total / comments.length
  averageRating.textContent = avg.toFixed(1)
  ratingCount.textContent = `${comments.length} ${comments.length === 1 ? 'avaliação' : 'avaliações'}`
  updateAverageRating(averageStars.querySelectorAll('.star'), avg)
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

submitComment.addEventListener('click', async () => {
  if (!currentAulaId || selectedRating === 0 || !commentInput.value.trim()) {
    alert('Por favor, forneça uma nota e um comentário.')
    return
  }

  const commentData = {
    aula_id: currentAulaId,
    rating: selectedRating,
    comment: commentInput.value.trim(),
    user_id: currentUser.id,
    user_email: currentUser.email,
    user_name:
      currentUser.user_metadata?.full_name ||
      currentUser.user_metadata?.name ||
      currentUser.email.split('@')[0]
  }

  const { error } = await supabase.from('aula_comments').insert([commentData])
  if (error) {
    console.error('Erro ao enviar comentário:', error)
    alert('Erro ao enviar comentário. Tente novamente.')
    return
  }

  commentInput.value = ''
  selectedRating = 0
  updateRatingDisplay(ratingInput.querySelectorAll('.star[data-rating]'), 0)
  loadComments(currentAulaId)
})

// ========== Autenticação ==========
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

// ========== Eventos de Interface ==========
materiaSelect.addEventListener('change', () => loadModulos(materiaSelect.value))
moduloSelect.addEventListener('change', () => loadAulas(moduloSelect.value))
aulaSelect.addEventListener('change', () => {
  const selected = aulas.find(a => a.id == aulaSelect.value)
  if (selected) playVideo(selected.video_url, selected.titulo, selected.id, selected.descricao)
})

// ========== Inicialização ==========
document.addEventListener('DOMContentLoaded', () => {
  loadMaterias()
  setupRatingInput()
  checkAuthStatus()
})

// ========= Botão defs ===========

document.getElementById('settings-btn')?.addEventListener('click', () => {
  window.location.href = 'settings.html';
});
