function createRng(seed) {
  let value = seed
  return function random() {
    let t = value += 0x6D2B79F5
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomRange(min, max, random) {
  return min + (max - min) * random()
}

function randomInt(min, max, random) {
  return Math.floor(randomRange(min, max + 1, random))
}

function drawGradientBackground(ctx, width, height, random) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#edf8fb')
  gradient.addColorStop(0.5, '#f9fcfd')
  gradient.addColorStop(1, '#e8f3f7')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  for (let y = 24; y < height; y += randomInt(28, 52, random)) {
    ctx.strokeStyle = `rgba(60,90,108,${randomRange(0.02, 0.06, random)})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y + randomRange(-5, 5, random))
    ctx.stroke()
  }
}

function drawImageBackground(ctx, image, width, height, settings) {
  const fit = settings.backgroundFit || 'cover'
  const zoom = Math.max(1, Number(settings.backgroundZoom) || 1)
  const offsetX = Math.max(-1, Math.min(1, (Number(settings.backgroundOffsetX) || 0) / 50))
  const offsetY = Math.max(-1, Math.min(1, (Number(settings.backgroundOffsetY) || 0) / 50))
  const imageWidth = image.width || width
  const imageHeight = image.height || height
  const blur = Math.max(0, Number(settings.backgroundBlur) || 0)

  ctx.save()
  ctx.globalAlpha = Number(settings.backgroundOpacity) || 1
  if (typeof ctx.filter !== 'undefined' && blur > 0) ctx.filter = `blur(${blur}px)`

  if (fit === 'stretch') {
    ctx.drawImage(image, 0, 0, width, height)
  } else if (fit === 'contain') {
    const scale = Math.min(width / imageWidth, height / imageHeight) * zoom
    const drawWidth = imageWidth * scale
    const drawHeight = imageHeight * scale
    const x = (width - drawWidth) / 2 + ((width - drawWidth) / 2) * offsetX
    const y = (height - drawHeight) / 2 + ((height - drawHeight) / 2) * offsetY
    ctx.drawImage(image, x, y, drawWidth, drawHeight)
  } else {
    const scale = Math.max(width / imageWidth, height / imageHeight) * zoom
    const sourceWidth = width / scale
    const sourceHeight = height / scale
    const maxX = Math.max(0, imageWidth - sourceWidth)
    const maxY = Math.max(0, imageHeight - sourceHeight)
    const sourceX = maxX / 2 + maxX / 2 * offsetX
    const sourceY = maxY / 2 + maxY / 2 * offsetY
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height)
  }

  if (typeof ctx.filter !== 'undefined') ctx.filter = 'none'
  ctx.restore()
}

function drawBackground(ctx, width, height, random, settings, backgroundImage) {
  const mode = settings.backgroundMode
  if (mode === 'solid') {
    ctx.fillStyle = /^#[0-9a-f]{6}$/i.test(settings.backgroundColor || '')
      ? settings.backgroundColor
      : '#eef8fa'
    ctx.fillRect(0, 0, width, height)
    return
  }
  if (mode === 'image' && backgroundImage) {
    drawImageBackground(ctx, backgroundImage, width, height, settings)
    return
  }
  if (mode === 'transparent') return
  drawGradientBackground(ctx, width, height, random)
}

function drawZigzags(ctx, width, height, random, count, y1, y2, boost) {
  const top = y1 == null ? 0 : y1
  const bottom = y2 == null ? height : y2
  const opacityBoost = boost || 1
  for (let i = 0; i < count; i += 1) {
    const base = randomRange(top, bottom, random)
    const segments = randomInt(7, 15, random)
    const amplitude = randomRange(18, 72, random)
    const startX = -100
    const endX = width + 100
    const step = (endX - startX) / segments
    const dark = random() < 0.3
    const alpha = Math.min(0.78, (dark
      ? randomRange(0.26, 0.5, random)
      : randomRange(0.08, 0.22, random)) * opacityBoost)
    ctx.strokeStyle = `rgba(${dark ? 44 : 76},${dark ? 68 : 101},${dark ? 84 : 118},${alpha})`
    ctx.lineWidth = dark ? randomRange(2.2, 5.2, random) : randomRange(0.8, 2.1, random)
    ctx.beginPath()
    ctx.moveTo(startX, base + randomRange(-amplitude, amplitude, random))
    for (let segment = 1; segment <= segments; segment += 1) {
      ctx.lineTo(startX + step * segment, base + randomRange(-amplitude, amplitude, random))
    }
    ctx.stroke()
  }
}

function drawCircuit(ctx, width, height, random, count, boost) {
  const opacityBoost = boost || 1
  for (let i = 0; i < count; i += 1) {
    const startX = randomRange(-20, width - 20, random)
    const startY = randomRange(10, height - 20, random)
    const length = randomRange(20, 110, random)
    const alpha = Math.min(0.45, randomRange(0.06, 0.2, random) * opacityBoost)
    ctx.strokeStyle = `rgba(60,86,104,${alpha})`
    ctx.lineWidth = randomRange(0.7, 1.7, random)
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    let currentX = startX
    let currentY = startY
    const steps = randomInt(2, 5, random)
    for (let step = 0; step < steps; step += 1) {
      currentX += randomRange(12, length / 3 + 18, random)
      if (random() < 0.55) currentY += randomRange(-26, 26, random)
      ctx.lineTo(currentX, currentY)
    }
    ctx.stroke()
    if (random() < 0.42) {
      ctx.strokeRect(
        currentX - randomRange(4, 16, random),
        currentY - randomRange(2, 6, random),
        randomRange(10, 30, random),
        randomRange(5, 13, random)
      )
    }
  }
}

function fitText(ctx, text, maxWidth, preferredSize) {
  let size = preferredSize
  while (size > 28) {
    ctx.font = `700 ${size}px "PingFang SC","Microsoft YaHei",sans-serif`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

function createTextLayer(width, height, random, settings, createOffscreenCanvas) {
  const layer = createOffscreenCanvas(width, height)
  const ctx = layer.getContext('2d')
  const lines = (settings.text || '示例文字')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
  const preferredSize = Number(settings.fontSize)
  const gap = preferredSize * 1.5
  const totalHeight = (lines.length - 1) * gap + preferredSize
  let y = height * 0.48 - totalHeight / 2 + preferredSize / 2
  const stroke = Number(settings.stroke)
  const alpha = Number(settings.alpha)
  const jitter = Number(settings.jitter)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'

  lines.forEach((line) => {
    const fontSize = fitText(ctx, line, width * 0.78, preferredSize)
    ctx.font = `700 ${fontSize}px "PingFang SC","Microsoft YaHei",sans-serif`
    const characters = Array.from(line)
    const widths = characters.map((character) => ctx.measureText(character).width)
    const textWidth = widths.reduce((sum, value) => sum + value, 0)
    let x = width / 2 - textWidth / 2

    characters.forEach((character, index) => {
      const characterWidth = widths[index]
      const centerX = x + characterWidth / 2 + randomRange(-jitter, jitter, random)
      const centerY = y + randomRange(-jitter * 0.6, jitter * 0.6, random)
      ctx.lineWidth = stroke + 1.4
      ctx.strokeStyle = `rgba(238,247,250,${Math.min(1, alpha + 0.25)})`
      ctx.strokeText(character, centerX, centerY)
      ctx.lineWidth = stroke
      ctx.strokeStyle = `rgba(45,68,84,${alpha})`
      ctx.strokeText(character, centerX, centerY)
      x += characterWidth + randomRange(-jitter * 0.25, jitter * 0.25, random)
    })
    y += gap
  })

  const damage = Number(settings.damage)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < Math.floor(90 + damage * 300); i += 1) {
    if (random() < damage * 1.55) {
      const x = randomRange(width * 0.16, width * 0.84, random)
      const y = randomRange(height * 0.30, height * 0.66, random)
      const blockWidth = randomRange(5, 28 + damage * 55, random)
      const blockHeight = randomRange(2, 10 + damage * 20, random)
      ctx.fillStyle = 'rgba(0,0,0,.85)'
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(randomRange(-0.75, 0.75, random))
      ctx.fillRect(-blockWidth / 2, -blockHeight / 2, blockWidth, blockHeight)
      ctx.restore()
    }
  }
  ctx.restore()
  return layer
}

function drawLocalLines(ctx, width, height, random, count, y1, y2) {
  for (let i = 0; i < count; i += 1) {
    const x = randomRange(width * 0.17, width * 0.83, random)
    const y = randomRange(y1, y2, random)
    const length = randomRange(30, 210, random)
    ctx.strokeStyle = `rgba(48,70,86,${randomRange(0.18, 0.55, random)})`
    ctx.lineWidth = randomRange(1, 3, random)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + randomRange(-8, 8, random), Math.min(height, y + length))
    ctx.stroke()
    if (random() < 0.4) {
      ctx.strokeRect(
        x - randomRange(5, 18, random),
        y + randomRange(5, Math.max(8, length * 0.7), random),
        randomRange(12, 38, random),
        randomRange(6, 16, random)
      )
    }
  }
}

function drawFragments(ctx, width, random, count, y1, y2) {
  for (let i = 0; i < count; i += 1) {
    const x = randomRange(width * 0.16, width * 0.84, random)
    const y = randomRange(y1, y2, random)
    const length = randomRange(10, 55, random)
    ctx.strokeStyle = `rgba(52,76,92,${randomRange(0.16, 0.48, random)})`
    ctx.lineWidth = randomRange(0.8, 2.4, random)
    ctx.beginPath()
    if (random() < 0.5) {
      ctx.moveTo(x - length / 2, y)
      ctx.lineTo(x + length / 2, y + randomRange(-8, 8, random))
    } else {
      ctx.moveTo(x, y - length / 2)
      ctx.lineTo(x + randomRange(-8, 8, random), y + length / 2)
    }
    ctx.stroke()
  }
}

function applyNoise(ctx, width, height, random, amount) {
  if (amount <= 0) return
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data
  const probability = amount * 0.5
  for (let i = 0; i < pixels.length; i += 4) {
    if (random() < probability && pixels[i + 3] > 0) {
      const noise = randomRange(-18, 18, random) * amount * 5
      pixels[i] += noise
      pixels[i + 1] += noise
      pixels[i + 2] += noise
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyBlur(canvas, ctx, width, height, amount, createOffscreenCanvas) {
  if (amount <= 0 || typeof ctx.filter === 'undefined') return
  const snapshot = createOffscreenCanvas(width, height)
  snapshot.getContext('2d').drawImage(canvas, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.filter = `blur(${amount}px)`
  ctx.drawImage(snapshot, 0, 0)
  ctx.filter = 'none'
}

function renderArtwork(options) {
  const {
    canvas,
    ctx,
    width,
    height,
    seed,
    settings,
    backgroundImage,
    createOffscreenCanvas
  } = options
  const random = createRng(seed)
  const localDensity = Number(settings.local)
  const y1 = height * 0.30
  const y2 = height * 0.68

  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, width, height, random, settings, backgroundImage)
  drawCircuit(ctx, width, height, random, Number(settings.circuit))
  drawZigzags(ctx, width, height, random, Number(settings.zig))
  drawZigzags(ctx, width, height, random, Math.floor(6 * localDensity), y1, y2, 1.15)
  drawFragments(ctx, width, random, Math.floor(28 * localDensity), y1, y2)

  const textLayer = createTextLayer(width, height, random, settings, createOffscreenCanvas)
  ctx.drawImage(textLayer, 0, 0)

  drawLocalLines(ctx, width, height, random, Math.floor(Number(settings.vert) * localDensity), y1, y2)
  drawFragments(ctx, width, random, Math.floor(52 * localDensity), y1, y2)
  drawZigzags(ctx, width, height, random, Math.floor(9 * localDensity), y1, y2, 1.25)

  ctx.save()
  ctx.beginPath()
  ctx.rect(width * 0.12, y1, width * 0.76, y2 - y1)
  ctx.clip()
  drawCircuit(ctx, width, height, random, Math.floor(22 * localDensity), 1.35)
  ctx.restore()

  applyNoise(ctx, width, height, random, Number(settings.noise))
  applyBlur(canvas, ctx, width, height, Number(settings.blur), createOffscreenCanvas)
}

module.exports = {
  renderArtwork
}
