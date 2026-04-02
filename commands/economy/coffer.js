export default {
  command: ['coffer', 'cofre'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix) => {

    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const currency = global.db.data.settings[botId].currency

    if (chat.adminonly || !chat.economy) {
      return client.reply(m.chat, `ꕥ La economía está desactivada.\nActívala con *${usedPrefix}economy on*`, m)
    }

    if (user.coins == null) user.coins = 0
    if (user.bank == null) user.bank = 0

    const isAdmin = m.isAdmin || m.isOwner
    const precio = 50000

    // 💸 Pago
    if (!isAdmin) {
      if (user.coins < precio) {
        return m.reply(`🐰 El *Cofre de Pascua* cuesta *¥${precio.toLocaleString()} ${currency}*`)
      }
      user.coins -= precio
    }

    // 🎲 RNG
    const rand = Math.random()
    let cantidad = 0
    let nombre = ''
    let emoji = ''
    let message = ''

    if (rand < 0.05) {
      // 🟡 LEGENDARIO
      cantidad = Math.floor(Math.random() * (120000 - 80000 + 1)) + 80000
      nombre = 'Huevo Legendario'
      emoji = '🌟'
      message = `¡INCREÍBLE! Abriste un *${nombre}* ${emoji}`

    } else if (rand < 0.15) {
      // 🟣 ÉPICO
      cantidad = Math.floor(Math.random() * (70000 - 50000 + 1)) + 50000
      nombre = 'Huevo Épico'
      emoji = '💜'
      message = `Wow… conseguiste un *${nombre}* ${emoji}`

    } else if (rand < 0.35) {
      // 🔵 RARO
      cantidad = Math.floor(Math.random() * (40000 - 20000 + 1)) + 20000
      nombre = 'Huevo Raro'
      emoji = '🔷'
      message = `Nada mal, abriste un *${nombre}* ${emoji}`

    } else if (rand < 0.65) {
      // 🟢 COMÚN
      cantidad = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000
      nombre = 'Huevo Común'
      emoji = '🥚'
      message = `Obtuviste un *${nombre}* ${emoji}`

    } else if (rand < 0.85) {
      // ⚪ POBRE
      cantidad = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000
      nombre = 'Huevo Simple'
      emoji = '🤍'
      message = `Hmm… solo un *${nombre}* ${emoji}`

    } else {
      // 💀 TRAMPA
      cantidad = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000

      if (user.coins >= cantidad) {
        user.coins -= cantidad
      } else {
        const restante = cantidad - user.coins
        user.coins = 0
        user.bank = Math.max(0, user.bank - restante)
      }

      return client.sendMessage(m.chat, {
        text: `「🐣 COFRE DE PASCUA 」\n\n💀 El cofre era una trampa...\nPerdiste *¥${cantidad.toLocaleString()} ${currency}*`
      }, { quoted: m })
    }

    // 💰 Dar recompensa
    user.coins += cantidad

    await client.sendMessage(m.chat, {
      text: `「🐣 COFRE DE PASCUA 」\n\n${message}\nGanaste *¥${cantidad.toLocaleString()} ${currency}* ${emoji}`
    }, { quoted: m })
  }
}
