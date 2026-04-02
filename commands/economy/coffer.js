export default {
  command: ['coffer', 'cofre'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix) => {
    try {

      const chat = global.db.data.chats[m.chat]
      const user = chat.users[m.sender]
      const bot = global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net']
      const currency = bot.currency || '$'

      if (chat.adminonly || !chat.economy) {
        return client.reply(m.chat,
`╭─❍ 「 ✿ Economía 」
│
│ ✖️ ➤ Sistema desactivado
│ ✧ Usa:
│ ➤ *${usedPrefix}economy on*
│
╰──────────────❍`, m)
      }

      if (user.coins == null) user.coins = 0
      if (user.bank == null) user.bank = 0

      const isOwner = m.isOwner
      const precio = 50000

      await m.react('🕒')

      let adminMsg = ''
      if (!isOwner) {
        if (user.coins < precio) {
          await m.react('✖️')
          return client.reply(m.chat,
`╭─❍ 「 ✿ Cofre de Pascua 」
│
│ ✖️ ➤ No tienes suficiente dinero
│ ✧ Precio:
│ ➤ ¥${precio.toLocaleString()} ${currency}
│
╰──────────────❍`, m)
        }
        user.coins -= precio
      } else {
        adminMsg =
`│ 👑 ➤ BONUS OWNER
│ ✧ Apertura gratuita
│`
      }

      const rand = Math.random()
      let cantidad = 0
      let resultado = ''

      if (rand < 0.05) {
        cantidad = Math.floor(Math.random() * (120000 - 80000 + 1)) + 80000
        resultado = `✦ Huevo Legendario`

      } else if (rand < 0.15) {
        cantidad = Math.floor(Math.random() * (70000 - 50000 + 1)) + 50000
        resultado = `✦ Huevo Épico`

      } else if (rand < 0.35) {
        cantidad = Math.floor(Math.random() * (40000 - 20000 + 1)) + 20000
        resultado = `✦ Huevo Raro`

      } else if (rand < 0.65) {
        cantidad = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000
        resultado = `✦ Huevo Común`

      } else if (rand < 0.85) {
        cantidad = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000
        resultado = `✦ Huevo Simple`

      } else {
        cantidad = Math.floor(Math.random() * (20000 - 5000 + 1)) + 5000

        if (user.coins >= cantidad) {
          user.coins -= cantidad
        } else {
          const restante = cantidad - user.coins
          user.coins = 0
          user.bank = Math.max(0, user.bank - restante)
        }

        await m.react('✖️')
        return client.reply(m.chat,
`╭─❍ 「 ✿ Cofre de Pascua 」
│
│ ✖️ ➤ Has caído en una trampa
│
│ ✧ Pierdes:
│ ➤ ¥${cantidad.toLocaleString()} ${currency}
│
╰──────────────❍`, m)
      }

      user.coins += cantidad

      await m.react('✔️')

      return client.reply(m.chat,
`╭─❍ 「 ✿ Cofre de Pascua 」
│
${adminMsg}│ ✦ ➤ Apertura completada
│
│ ✿ ${resultado}
│
│ ✧ Recompensa:
│ ➤ ¥${cantidad.toLocaleString()} ${currency}
│
│ ✧ Estado:
│ ➤ Éxito ✨
│
╰──────────────❍`, m)

    } catch (e) {
      console.error(e)
      await m.react('✖️')
      return client.reply(m.chat,
`╭─❍ 「 ⚠️ Error 」
│
│ ✖️ ➤ Ocurrió un problema
│ ✧ ${e.message}
│
╰──────────────❍`, m)
    }
  }
}
