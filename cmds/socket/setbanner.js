import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['setbanner', 'setbotbanner'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply(mess.socket)
    const value = args.join(' ').trim()

    if (!value && !m.quoted && !m.message.imageMessage && !m.message.videoMessage)
      return m.reply('✎ Debes enviar o citar una imagen o video para cambiar el banner del bot.')

    if (value.startsWith('http')) {
      config.banner = value
      return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply('✎ Responde a una imagen válida.')

    const buffer = await q.download()
    if (!buffer) return m.reply('✎ No se pudo descargar la imagen.')

    const url = await uploadImage(buffer, mime)
    config.banner = url

    return m.reply(`✿ Se ha actualizado el banner de *${config.namebot}*!`)
  },
};

// 🔁 SOLO ESTA FUNCIÓN CAMBIADA
async function uploadImage(buffer, mime) {
  const body = new FormData()
  body.append('file', buffer, `file.${mime.split('/')[1]}`)

  // 1. Subimos temporalmente a file.io
  const temp = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body,
    headers: body.getHeaders()
  })

  const tempJson = await temp.json()
  if (!tempJson.success || !tempJson.link) throw 'Error subiendo temporalmente'

  // 2. Subimos a EvoGB (permanente)
  const res = await fetch("https://evogb.win/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: tempJson.link,
      author: "Bot"
    })
  })

  const json = await res.json()
  if (!json || !json.url) throw 'Error en EvoGB'

  return json.url
}
