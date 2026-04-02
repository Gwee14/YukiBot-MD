import { delay } from "@whiskeysockets/baileys"

export default {
  command: ['loot', 'drop'],
  category: 'rpg',
  run: async (client, m) => {
    const db = global.db.data
    const chat = db.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = db.settings[botId]
    const currency = bot.currency || '¥'

    const isOwner2 = [
      botId,
      ...(bot.owner ? [bot.owner] : []),
      ...global.owner.map(num => num + '@s.whatsapp.net')
    ].includes(m.sender)

    if (chat.adminonly || !chat.economy) {
      return m.reply(`ꕥ La economía está desactivada.`)
    }

    // 🧠 ANTI SPAM
    user.lastLoot ||= 0
    user.spamLoot ||= 0

    const now = Date.now()
    const cooldown = isOwner2 ? 0 : 5 * 60 * 1000

    if (now - user.lastLoot < cooldown) {
      user.spamLoot++

      if (user.spamLoot >= 3) {
        const multa = Math.floor((user.coins || 0) * 0.05)
        user.coins = Math.max(0, user.coins - multa)

        return m.reply(
`╭━〔 ⚠️ ANTI-SPAM 〕━⬣
✖️ Estás abusando

💸 Multa:
➤ -${currency}${multa.toLocaleString()}

╰━━━━━━━━━━━━⬣`)
      }

      const restante = formatTime(cooldown - (now - user.lastLoot))
      return m.reply(`⏳ Espera: *${restante}*`)
    }

    user.lastLoot = now
    user.spamLoot = 0

    // 🍀 SUERTE
    user.luck ||= 0
    const luckBoost = user.luck * 0.015

    // 🎬 ANIMACIÓN
    let { key } = await client.sendMessage(m.chat, {
      text: `🌸 Evento Pascua...\n▰▱▱▱▱▱`
    }, { quoted: m })

    await delay(1200)
    await client.sendMessage(m.chat, {
      text: `🌸 Buscando reliquias...\n▰▰▰▱▱▱`,
      edit: key
    })

    await delay(1200)

    const rand = Math.random() + luckBoost

    let item = ''
    let rare = ''
    let value = 0

    // 🌈 DIVINO (ULTRA RARO)
    if (rand < 0.005) {
      item = '🌟 Huevo Celestial Supremo'
      rare = '✨ DIVINO'
      value = 200000

    // 🌈 MÍTICO
    } else if (rand < 0.02) {
      const mythics = [
        '🥚 Reliquia de Pascua Divina',
        '👑 Corona del Conejo Sagrado',
        '🐉 Alma de Dragón Antiguo'
      ]
      item = mythics[Math.floor(Math.random() * mythics.length)]
      rare = '🌈 MÍTICO'
      value = 150000

    // 🔥 LEGENDARIO
    } else if (rand < 0.06) {
      const leg = [
        '🔥 Espada del Alba',
        '🐰 Orejas Sagradas',
        '💎 Corazón Arcano',
        '⚡ Núcleo Energético'
      ]
      item = leg[Math.floor(Math.random() * leg.length)]
      rare = '🔥 LEGENDARIO'
      value = 100000

    // 💜 ÉPICO
    } else if (rand < 0.15) {
      const epic = [
        '🍫 Chocolate Encantado',
        '🧿 Amuleto Oscuro',
        '📿 Collar Místico',
        '🔮 Esfera Arcana'
      ]
      item = epic[Math.floor(Math.random() * epic.length)]
      rare = '💜 ÉPICO'
      value = 60000

    // 💙 RARO
    } else if (rand < 0.30) {
      const rareItems = [
        '🌸 Flor Antigua',
        '🗡 Fragmento Rúnico',
        '📜 Pergamino viejo',
        '🧪 Poción rara'
      ]
      item = rareItems[Math.floor(Math.random() * rareItems.length)]
      rare = '💙 RARO'
      value = 25000

    // 💚 COMÚN+
    } else if (rand < 0.55) {
      const common = [
        '🛡 Escudo gastado',
        '🪓 Hacha vieja',
        '🥕 Zanahoria fresca',
        '🍞 Pan duro'
      ]
      item = common[Math.floor(Math.random() * common.length)]
      rare = '💚 COMÚN'
      value = 10000

    // 🤍 BASURA
    } else {
      const basura = [
        '🪨 Piedra inútil',
        '🧻 Papel roto',
        '🥾 Zapato viejo',
        '🪵 Madera podrida'
      ]
      item = basura[Math.floor(Math.random() * basura.length)]
      rare = '🤍 BASURA'
      value = 3000
    }

    // 🎒 INVENTARIO
    user.inventory ||= []
    user.inventory.push({ name: item, value, rare })

    // 💸 BONUS
    const bonus = Math.floor(value * 0.2)
    user.coins += bonus

    // 🍀 SUERTE
    if (Math.random() < 0.25) user.luck++

    await client.sendMessage(m.chat, {
      text:
`╭━━━〔 🌸 〕━━━⬣
❀ *Exploración Pascua*

${rare}

ꕥ Item:
➤ *${item}*

💰 Valor:
➤ ${currency}${value.toLocaleString()}

✦ Bonus:
➤ +${currency}${bonus.toLocaleString()}

🍀 Suerte:
➤ ${user.luck}

${isOwner2 ? '👑 OWNER BONUS' : ''}

╰━━━━━━━━━━━━⬣`
    }, { edit: key })
  }
}

function formatTime(ms) {
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}m ${sec}s`
}
