const BLOB_DEFS = [
    { fx: 0.15, fy: 0.20, r: 320, rgb: [59,  130, 246], a: 0.22, vx:  0.38, vy:  0.28 },
    { fx: 0.85, fy: 0.80, r: 290, rgb: [167, 139, 250], a: 0.20, vx: -0.32, vy: -0.38 },
    { fx: 0.80, fy: 0.18, r: 250, rgb: [56,  189, 248], a: 0.15, vx: -0.26, vy:  0.32 },
    { fx: 0.18, fy: 0.78, r: 270, rgb: [99,  102, 241], a: 0.17, vx:  0.28, vy: -0.26 },
]

const GAP        = 36
const DOT_R      = 0.9
const LINE_ALPHA = 0.028
const DOT_ALPHA  = 0.07

class Pulse {
    constructor(w, h) {
        this.horiz = Math.random() > 0.5
        this.speed = 0.9 + Math.random() * 1.4
        this.alpha = 0.18 + Math.random() * 0.18
        this.len   = 55 + Math.random() * 70
        if (this.horiz) {
            this.axis = Math.round(Math.random() * Math.ceil(h / GAP)) * GAP + GAP / 2
            this.pos  = -this.len
            this.end  = w + this.len
        } else {
            this.axis = Math.round(Math.random() * Math.ceil(w / GAP)) * GAP + GAP / 2
            this.pos  = -this.len
            this.end  = h + this.len
        }
    }

    done() { return this.pos > this.end }
    tick(dt = 1) { this.pos += this.speed * dt }

    draw(ctx) {
        const head = this.pos
        const tail = this.pos - this.len
        let grad
        if (this.horiz) {
            grad = ctx.createLinearGradient(tail, this.axis, head, this.axis)
        } else {
            grad = ctx.createLinearGradient(this.axis, tail, this.axis, head)
        }
        grad.addColorStop(0,    `rgba(96,165,250,0)`)
        grad.addColorStop(0.55, `rgba(96,165,250,${this.alpha})`)
        grad.addColorStop(0.85, `rgba(180,210,255,${this.alpha * 0.7})`)
        grad.addColorStop(1,    `rgba(220,235,255,${this.alpha * 0.3})`)

        ctx.save()
        ctx.strokeStyle = grad
        ctx.lineWidth   = 1.2
        ctx.shadowColor = `rgba(96,165,250,${this.alpha * 0.5})`
        ctx.shadowBlur  = 4
        ctx.beginPath()
        if (this.horiz) {
            ctx.moveTo(tail, this.axis)
            ctx.lineTo(head, this.axis)
        } else {
            ctx.moveTo(this.axis, tail)
            ctx.lineTo(this.axis, head)
        }
        ctx.stroke()
        ctx.restore()
    }
}

const canvas = document.getElementById('bg-canvas')
const ctx    = canvas.getContext('2d')

const gridOff = document.createElement('canvas')
const gCtx    = gridOff.getContext('2d')

const blobs = BLOB_DEFS.map(b => ({
    ...b,
    cx: b.fx * window.innerWidth,
    cy: b.fy * window.innerHeight,
}))

const pulses  = []
let lastSpawn = 0

function buildGrid(w, h) {
    gridOff.width  = w
    gridOff.height = h
    gCtx.clearRect(0, 0, w, h)

    gCtx.strokeStyle = `rgba(96,165,250,${LINE_ALPHA})`
    gCtx.lineWidth   = 1
    for (let x = GAP / 2; x <= w; x += GAP) {
        gCtx.beginPath(); gCtx.moveTo(x, 0); gCtx.lineTo(x, h); gCtx.stroke()
    }
    for (let y = GAP / 2; y <= h; y += GAP) {
        gCtx.beginPath(); gCtx.moveTo(0, y); gCtx.lineTo(w, y); gCtx.stroke()
    }

    gCtx.fillStyle = `rgba(96,165,250,${DOT_ALPHA})`
    for (let x = GAP / 2; x <= w; x += GAP) {
        for (let y = GAP / 2; y <= h; y += GAP) {
            gCtx.beginPath()
            gCtx.arc(x, y, DOT_R, 0, Math.PI * 2)
            gCtx.fill()
        }
    }
}

function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width  = w
    canvas.height = h
    buildGrid(w, h)
}

let lastFrameTs = null
let rafId = null

function frame(ts) {
    if (lastFrameTs === null) lastFrameTs = ts
    const dt = Math.min(ts - lastFrameTs, 50) / 16.67
    lastFrameTs = ts

    const { width: w, height: h } = canvas
    ctx.clearRect(0, 0, w, h)

    ctx.drawImage(gridOff, 0, 0)

    if (ts - lastSpawn > 2200) {
        const count = Math.random() > 0.45 ? 2 : 1
        for (let i = 0; i < count; i++) pulses.push(new Pulse(w, h))
        lastSpawn = ts
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].draw(ctx)
        pulses[i].tick(dt)
        if (pulses[i].done()) pulses.splice(i, 1)
    }

    for (const b of blobs) {
        b.cx += b.vx * dt
        b.cy += b.vy * dt
        const pad = b.r * 0.5
        if (b.cx < -pad || b.cx > w + pad) b.vx *= -1
        if (b.cy < -pad || b.cy > h + pad) b.vy *= -1

        const grad = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r)
        grad.addColorStop(0, `rgba(${b.rgb},${b.a})`)
        grad.addColorStop(1, `rgba(${b.rgb},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2)
        ctx.fill()
    }

    rafId = requestAnimationFrame(frame)
}

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        lastFrameTs = null
        lastSpawn = performance.now()
        if (!rafId) rafId = requestAnimationFrame(frame)
    } else {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    }
})

window.addEventListener('resize', resize)
resize()
rafId = requestAnimationFrame(frame)
