/* ============ preloader (boot animation on first load) ============ */
const preloader = document.querySelector('#preloader')
if (preloader) {
  document.body.classList.add('is-loading')
  document.documentElement.style.overflow = 'hidden'
  const fill = preloader.querySelector('.preloader__bar-fill')
  const lineText = preloader.querySelector('.preloader__line-text')
  const alreadySeen = sessionStorage.getItem('mpt-preloaded')
  const steps = ['booting interface', 'loading assets', 'compiling styles', 'ready']
  let pct = 0
  let stepIdx = 0

  const finish = () => {
    preloader.classList.add('preloader--done')
    document.body.classList.remove('is-loading')
    document.body.classList.add('is-ready')
    document.documentElement.style.overflow = ''
    sessionStorage.setItem('mpt-preloaded', '1')
    setTimeout(() => preloader.remove(), 700)
  }

  if (alreadySeen) {
    // skip the long boot sequence on repeat visits within the session,
    // but still let the hero play its entrance animation
    finish()
  } else {
    const tick = () => {
      pct = Math.min(100, pct + Math.random() * 18 + 6)
      if (fill) fill.style.width = pct + '%'
      const newStep = Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length))
      if (newStep !== stepIdx) { stepIdx = newStep; if (lineText) lineText.textContent = steps[stepIdx] }
      if (pct < 100) {
        setTimeout(tick, 160 + Math.random() * 140)
      } else {
        if (lineText) lineText.textContent = steps[steps.length - 1]
        setTimeout(finish, 350)
      }
    }
    setTimeout(tick, 200)
  }
}

/* ============ scroll progress bar ============ */
const scrollProgress = document.querySelector('#scrollProgress')
if (scrollProgress) {
  const updateProgress = () => {
    const h = document.documentElement
    const scrolled = h.scrollTop
    const max = h.scrollHeight - h.clientHeight
    scrollProgress.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%'
  }
  document.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
}

/* ============ hero glow parallax on scroll ============ */
const parallaxGlows = document.querySelectorAll('.hero__glow')
if (parallaxGlows.length) {
  document.addEventListener('scroll', () => {
    const y = window.scrollY * 0.15
    parallaxGlows.forEach((g, i) => {
      g.style.transform = `translateY(${y * (i % 2 === 0 ? 1 : -1)}px)`
    })
  }, { passive: true })
}

/* ============ header scroll state ============ */
const header = document.querySelector('.header')
const onScroll = () => {
  if (!header) return
  if (window.scrollY > 40) header.classList.add('header--scrolled')
  else header.classList.remove('header--scrolled')
}
document.addEventListener('scroll', onScroll)
onScroll()

/* ============ mobile menu ============ */
const ham = document.querySelector('.ham')
const mobileMenu = document.querySelector('.mobile-menu')
if (ham && mobileMenu) {
  ham.addEventListener('click', () => {
    ham.classList.toggle('ham--active')
    mobileMenu.classList.toggle('mobile-menu--active')
  })
  mobileMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      ham.classList.remove('ham--active')
      mobileMenu.classList.remove('mobile-menu--active')
    })
  })
}

/* ============ logo -> home ============ */
document.querySelectorAll('[data-home]').forEach((el) => {
  el.addEventListener('click', () => { location.href = 'index.html' })
})

/* ============ terminal-style role typer ============ */
const roleEl = document.querySelector('[data-typer]')
if (roleEl) {
  const words = JSON.parse(roleEl.getAttribute('data-typer'))
  let wi = 0, ci = 0, deleting = false
  const span = roleEl.querySelector('.typer-text')
  const tick = () => {
    const word = words[wi]
    if (!deleting) {
      ci++
      span.textContent = word.slice(0, ci)
      if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return }
    } else {
      ci--
      span.textContent = word.slice(0, ci)
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length }
    }
    setTimeout(tick, deleting ? 45 : 85)
  }
  tick()
}

/* ============ scroll reveal ============ */
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger')
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible')
      io.unobserve(entry.target)
    }
  })
}, { threshold: 0.15 })
revealEls.forEach((el) => io.observe(el))

/* ============ hero grid canvas ============ */
const canvas = document.querySelector('.hero__grid-canvas')
if (canvas) {
  const ctx = canvas.getContext('2d')
  let w, h, mx = -9999, my = -9999
  const spacing = 42

  function resize() {
    w = canvas.width = canvas.offsetWidth
    h = canvas.height = canvas.offsetHeight
  }
  window.addEventListener('resize', resize)
  resize()

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    mx = e.clientX - rect.left
    my = e.clientY - rect.top
  })
  window.addEventListener('mouseleave', () => { mx = -9999; my = -9999 })

  function draw() {
    ctx.clearRect(0, 0, w, h)
    for (let x = 0; x < w + spacing; x += spacing) {
      for (let y = 0; y < h + spacing; y += spacing) {
        const d = Math.hypot(x - mx, y - my)
        const influence = Math.max(0, 1 - d / 220)
        const r = 1 + influence * 2.2
        const alpha = 0.12 + influence * 0.7
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = influence > 0.05
          ? `rgba(52,240,224,${alpha})`
          : 'rgba(139,150,168,0.16)'
        ctx.fill()
      }
    }
    requestAnimationFrame(draw)
  }
  draw()
}

/* ============ video modal ============ */
const modal = document.querySelector('.video-modal')
if (modal) {
  const video = modal.querySelector('video')
  const closeBtn = modal.querySelector('.video-modal__close')
  document.querySelectorAll('[data-video]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      video.querySelector('source').src = btn.getAttribute('data-video')
      video.load()
      modal.classList.add('video-modal--active')
      video.play().catch(() => {})
    })
  })
  const close = () => {
    modal.classList.remove('video-modal--active')
    video.pause()
  }
  closeBtn.addEventListener('click', close)
  modal.addEventListener('click', (e) => { if (e.target === modal) close() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
}

/* ============ contact form ============ */
/* Sends straight to your inbox via Web3Forms (free, no backend needed).
   1. Go to https://web3forms.com and create a free access key with your email.
   2. Paste that key into the hidden "access_key" input in index.html.
   Until a real key is set, the form falls back to opening a pre-filled email instead. */
const contactForm = document.querySelector('#contactForm')
if (contactForm) {
  const statusEl = contactForm.querySelector('#contactFormStatus')
  const submitBtn = contactForm.querySelector('#contactSubmitBtn')

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const accessKey = contactForm.querySelector('[name="access_key"]').value
    const name = contactForm.querySelector('#name').value
    const email = contactForm.querySelector('#email').value
    const message = contactForm.querySelector('#message').value

    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      const subject = encodeURIComponent(`Portfolio contact from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:mahath2001@gmail.com?subject=${subject}&body=${body}`
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'Sending…'
    statusEl.textContent = ''
    statusEl.className = 'form-status'

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      })
      const result = await res.json()
      if (result.success) {
        statusEl.textContent = "Message sent — I'll get back to you soon."
        statusEl.classList.add('form-status--ok')
        contactForm.reset()
      } else {
        throw new Error(result.message || 'Something went wrong')
      }
    } catch (err) {
      statusEl.textContent = "Couldn't send — please email mahath2001@gmail.com directly."
      statusEl.classList.add('form-status--err')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Send Message'
    }
  })
}
