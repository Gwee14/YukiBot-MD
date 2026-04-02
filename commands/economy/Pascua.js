import { delay } from "@whiskeysockets/baileys"

export default {
  command: ['event', 'easter'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chat = db.chats[m.chat]
    const user = chat.users[m.sender]
    const bot = db.settings[client.user.id.split(':')[0] + '@s.whatsapp.net']
    const currency = bot.currency || '¥'

    if (chat.adminonly || !chat.economy) {
      return m.reply(`ꕥ La economía está desactivada.`)
    }

    // 💰 COSTO
    const price = 50000

    if (user.coins < price) {
      return m.reply(
`╭━━━〔 💸 〕━━━⬣
❀ *Evento Pascua*

✖️ No tienes suficiente dinero

➤ Necesitas:
*${currency}${price.toLocaleString()}*

╰━━━━━━━━━━━━⬣`)
    }

    // 💸 cobrar
    user.coins -= price

    // 📦 init
    user.eggs ||= 0
    user.chocoEggs ||= 0
    user.heno ||= 0
    user.luck ||= 0
    user.eventPoints ||= 0
    user.lastEvent ||= 0

    const now = Date.now()
    const cd = 5 * 60 * 1000

    if (now - user.lastEvent < cd) {
      const restante = formatTime(cd - (now - user.lastEvent))
      return m.reply(`⏳ Espera: *${restante}*`)
    }

    user.lastEvent = now

    let { key } = await client.sendMessage(m.chat, {
      text: `🐰 explorando easter land...\n▱▱▱▱▱`
    }, { quoted: m })

    await delay(1200)
    await client.sendMessage(m.chat, {
      text: `🥚 buscando huevitos...\n▰▰▱▱▱`,
      edit: key
    })

    await delay(1200)

    let texto = ''

    // 🐰 THE RABBIT
    if (Math.random() < 0.15) {
      const win = Math.random() < 0.5

      if (win) {
        const premio = Math.floor(Math.random() * 5) + 2
        user.eggs += premio
        texto += `🐰 *The Rabbit apareció*\n✨ Ganaste ${premio} huevitos\n\n`
      } else {
        const robo = Math.floor(Math.random() * 3) + 1
        user.eggs = Math.max(0, user.eggs - robo)
        texto += `🐰 *The Rabbit apareció*\n💀 Te robó ${robo} huevitos\n\n`
      }
    }

    // 🥚 normal
    const eggs = Math.floor(Math.random() * 4) + 1
    user.eggs += eggs
    texto += `🥚 +${eggs} huevitos\n`

    // 🍫 chocolate
    if (Math.random() < 0.4) {
      const choco = Math.floor(Math.random() * 3) + 1
      user.chocoEggs += choco
      texto += `🍫 +${choco} chocolate\n`
    }

    // 💀 podrido
    if (Math.random() < 0.2) {
      texto += `💀 huevo podrido encontrado\n`
    }

    // 🌾 heno
    if (Math.random() < 0.3) {
      user.heno += 1
      texto += `🌾 +1 heno\n`
    }

    // 🎁 items
    const items = [
      '🐣 huevo divino',
      '🐰 huevo mágico',
      '🍫 huevo dorado',
      '🌸 huevo floral',
      '💎 huevo brillante',
      '🔥 huevo raro'
    ]
    const item = items[Math.floor(Math.random() * items.length)]

    user.inventory ||= []
    user.inventory.push(item)

    // 🧬 puntos
    const points = eggs + user.chocoEggs
    user.eventPoints += points

    // 🍀 suerte
    if (Math.random() < 0.25) user.luck++

    // 💰 recompensa (NERFEADA para balance)
    const money = Math.floor(Math.random() * 15000) + 5000
    user.coins += money

    await client.sendMessage(m.chat, {
      text:
`╭━━━〔 🐰 〕━━━⬣
❀ *Easter 2026*

${texto}

🎁 Item:
➤ ${item}

🏆 puntos: ${user.eventPoints}
🥚 huevos: ${user.eggs}
🍫 chocolate: ${user.chocoEggs}

💰 +${currency}${money.toLocaleString()}
💸 -${currency}${price.toLocaleString()}

🍀 suerte: ${user.luck}

╰━━━━━━━━━━━━⬣`
    }, { edit: key })
  }
}

function formatTime(ms) {
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}m ${sec}s`
}
