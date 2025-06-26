import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔑 Substitua pelas suas credenciais do Supabase:
const SUPABASE_URL = 'https://llcxblljabowzahodeui.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY3hibGxqYWJvd3phaG9kZXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQyNzgsImV4cCI6MjA2MzIyMDI3OH0.J-2AH-b0kMyItvgymSl_3H7tEdxRMqh_slkdsKKcAQI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =============== ELEMENTOS DO DOM ===============
const searchMateriaInput = document.getElementById('searchMateria')
const materiaSelect = document.getElementById('materiaSelect')
const moduloSelect = document.getElementById('moduloSelect')
const aulaSelect = document.getElementById('aulaSelect')
const lessonList = document.getElementById('lessonList')
const videoPlayer = document.getElementById('videoPlayer')
const youtubePlayer = document.getElementById('youtubePlayer') // Mudança aqui
const videoTitle = document.getElementById('videoTitle')
const commentsSection = document.getElementById('commentsSection')

// Elementos dos comentários
const averageRating = document.getElementById('averageRating')
const averageStars = document.getElementById('averageStars')
const ratingCount = document.getElementById('ratingCount')
const ratingInput = document.getElementById('ratingInput')
const commentInput = document.getElementById('commentInput')
const submitComment = document.getElementById('submitComment')
const commentsList = document.getElementById('commentsList')

// =============== VARIÁVEIS GLOBAIS ===============
let materias = []
let modulos = []
let aulas = []
let currentUser = null
let currentAulaId = null
let selectedRating = 0

// =============== FUNÇÃO PARA CONVERTER URL DO YOUTUBE ===============
function getYouTubeEmbedUrl(url) {
    if (!url) return null
    
    // Regex para extrair o ID do vídeo do YouTube de diferentes formatos de URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    
    if (match && match[2].length === 11) {
        const videoId = match[2]
        return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Se não for uma URL do YouTube válida, retorna null
    console.warn('URL do YouTube inválida:', url)
    return null
}

// =============== FUNÇÕES ORIGINAIS (MANTIDAS) ===============
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
    li.dataset.aulaId = aula.id
    li.addEventListener('click', () => {
      document.querySelectorAll('#lessonList li').forEach(el => el.classList.remove('active'))
      li.classList.add('active')
      playVideo(aula.video_url, aula.titulo, aula.id)
    })
    lessonList.appendChild(li)
  })
}

// =============== FUNÇÃO MODIFICADA PARA YOUTUBE ===============
function playVideo(url, titulo, aulaId) {
  if (!url) {
    console.error('URL do vídeo não fornecida')
    return
  }

  const embedUrl = getYouTubeEmbedUrl(url)
  
  if (!embedUrl) {
    console.error('Não foi possível converter a URL para embed do YouTube:', url)
    alert('URL do YouTube inválida. Verifique se o link está correto.')
    return
  }

  youtubePlayer.src = embedUrl
  videoTitle.textContent = titulo
  videoPlayer.style.display = 'block'
  currentAulaId = aulaId
  
  // Carrega comentários para esta aula
  loadComments(aulaId)
  
  // Scroll suave para o player
  videoPlayer.scrollIntoView({ behavior: 'smooth' })
}

// =============== FUNÇÕES PARA COMENTÁRIOS (MANTIDAS) ===============

function setupRatingInput() {
  const stars = ratingInput.querySelectorAll('.star[data-rating]')
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating)
      updateRatingDisplay(stars, selectedRating)
    })

    star.addEventListener('mouseover', () => {
      const rating = parseInt(star.dataset.rating)
      updateRatingDisplay(stars, rating)
    })
  })

  ratingInput.addEventListener('mouseleave', () => {
    updateRatingDisplay(stars, selectedRating)
  })
}

function updateRatingDisplay(stars, rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('filled')
    } else {
      star.classList.remove('filled')
    }
  })
}

function updateAverageRating(stars, rating) {
  stars.forEach((star, index) => {
    if (index < Math.floor(rating)) {
      star.classList.add('filled')
    } else if (index < rating) {
      // Para estrelas parciais, você pode adicionar uma classe especial se quiser
      star.classList.remove('filled')
    } else {
      star.classList.remove('filled')
    }
  })
}

async function loadComments(aulaId) {
  commentsList.innerHTML = '<div class="loading">Carregando comentários...</div>'
  
  const { data, error } = await supabase
    .from('aula_comments')
    .select(`
      *,
      user_email
    `)
    .eq('aula_id', aulaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao carregar comentários:', error)
    commentsList.innerHTML = '<div class="no-comments">Erro ao carregar comentários</div>'
    return
  }

  renderComments(data)
  updateRatingSummary(data)
}

function renderComments(comments) {
  if (!comments || comments.length === 0) {
    commentsList.innerHTML = '<div class="no-comments">Seja o primeiro a comentar este vídeo!</div>'
    return
  }

  commentsList.innerHTML = comments.map(comment => `
    <div class="comment">
      <div class="comment-header">
        <div>
          <div class="comment-author">${comment.user_email}</div>
          <div class="comment-date">${formatDate(comment.created_at)}</div>
        </div>
        <div class="comment-rating">
          ${generateStarsHTML(comment.rating)}
        </div>
      </div>
      <p class="comment-text">${escapeHtml(comment.comment)}</p>
    </div>
  `).join('')
}

function generateStarsHTML(rating) {
  return Array.from({length: 5}, (_, i) => 
    `<span class="star ${i < rating ? 'filled' : ''}">★</span>`
  ).join('')
}

function updateRatingSummary(comments) {
  if (!comments || comments.length === 0) {
    averageRating.textContent = '0.0'
    ratingCount.textContent = '0 avaliações'
    updateAverageRating(averageStars.querySelectorAll('.star'), 0)
    return
  }

const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0)
  const average = totalRating / comments.length

  averageRating.textContent = average.toFixed(1)
  ratingCount.textContent = `${comments.length} ${comments.length === 1 ? 'avaliação' : 'avaliações'}`
  updateAverageRating(averageStars.querySelectorAll('.star'), average)
}

// =============== UTILITÁRIOS ===============
function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// =============== ENVIO DE COMENTÁRIOS ===============
submitComment.addEventListener('click', async () => {
  if (!currentAulaId || selectedRating === 0 || !commentInput.value.trim()) {
    alert('Por favor, forneça uma nota e um comentário.')
    return
  }

  const commentData = {
    aula_id: currentAulaId,
    rating: selectedRating,
    comment: commentInput.value.trim(),
    user_email: 'usuário@exemplo.com' // Substitua por autenticação real, se disponível
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

// =============== EVENTOS INICIAIS ===============
materiaSelect.addEventListener('change', () => {
  const materiaId = materiaSelect.value
  loadModulos(materiaId)
})

moduloSelect.addEventListener('change', () => {
  const moduloId = moduloSelect.value
  loadAulas(moduloId)
})

aulaSelect.addEventListener('change', () => {
  const selected = aulas.find(a => a.id == aulaSelect.value)
  if (selected) {
    playVideo(selected.video_url, selected.titulo, selected.id)
  }
})

document.addEventListener('DOMContentLoaded', () => {
  loadMaterias()
  setupRatingInput()
})


// Verificação de autenticação
async function checkAuthStatus() {
  const { data: { user } } = await supabase.auth.getUser()

  const userMenu = document.getElementById('user-menu')
  const userEmailSpan = document.getElementById('user-email')
  const userDropdown = document.getElementById('user-dropdown')

  if (user) {
             currentUser = user
             userMenu.classList.remove('hidden')
             userEmailSpan.textContent = user.email
            } else {
             window.location.href = 'login.html'
            }

             userEmailSpan.addEventListener('click', () => {
             userDropdown.classList.toggle('hidden')
            })

            document.getElementById('logout-btn').addEventListener('click', async () => {
                await supabase.auth.signOut()
                window.location.href = 'index.html'
            })
}


        // Inicialização
        loadMaterias()
        checkAuthStatus()
        setupRatingInput()