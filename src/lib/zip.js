/**
 * Brauzerning o'zida .zip arxiv yasash — tashqi kutubxonasiz.
 * Siqish uchun o'rnatilgan CompressionStream('deflate-raw') ishlatiladi,
 * u yo'q bo'lsa (yoki foyda bermasa) fayl siqilmasdan yoziladi.
 */

const encoder = new TextEncoder()

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

async function deflateRaw(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function dosDateTime(date) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

/** Bitta faylni arxivga tayyorlaydi: CRC hisoblanadi va imkon bo'lsa siqiladi */
export async function zipEntry(name, bytes) {
  let method = 0
  let data = bytes
  if (typeof CompressionStream === 'function') {
    const deflated = await deflateRaw(bytes)
    if (deflated.length < bytes.length) {
      method = 8
      data = deflated
    }
  }
  return { name: encoder.encode(name), method, crc: crc32(bytes), size: bytes.length, data }
}

/** Tayyor yozuvlardan .zip Blob yig'adi */
export function zipBlob(entries, modified = new Date()) {
  const { time, date } = dosDateTime(modified)
  const files = []
  const directory = []
  let offset = 0

  for (const entry of entries) {
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // fayl nomlari UTF-8
    local.setUint16(8, entry.method, true)
    local.setUint16(10, time, true)
    local.setUint16(12, date, true)
    local.setUint32(14, entry.crc, true)
    local.setUint32(18, entry.data.length, true)
    local.setUint32(22, entry.size, true)
    local.setUint16(26, entry.name.length, true)
    files.push(local, entry.name, entry.data)

    const header = new DataView(new ArrayBuffer(46))
    header.setUint32(0, 0x02014b50, true)
    header.setUint16(4, 20, true)
    header.setUint16(6, 20, true)
    header.setUint16(8, 0x0800, true)
    header.setUint16(10, entry.method, true)
    header.setUint16(12, time, true)
    header.setUint16(14, date, true)
    header.setUint32(16, entry.crc, true)
    header.setUint32(20, entry.data.length, true)
    header.setUint32(24, entry.size, true)
    header.setUint16(28, entry.name.length, true)
    header.setUint32(42, offset, true)
    directory.push(header, entry.name)

    offset += 30 + entry.name.length + entry.data.length
  }

  const directorySize = directory.reduce((sum, part) => sum + part.byteLength, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, directorySize, true)
  end.setUint32(16, offset, true)

  return new Blob([...files, ...directory, end], { type: 'application/zip' })
}

/** Blob'ni fayl sifatida saqlash oynasini ochadi */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
