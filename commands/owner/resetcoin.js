import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['resetcoin', 'resetmoney'],
  isOwner: true,
  run: async (client, m, args) => {
    try {

      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : null)
      const who = await resolveLidToRealJid(who2, client, m.chat)

      if (!who) {
        return client.reply(m.chat, '❀ Por favor, menciona al usuario o cita un mensaje.', m)
      }

      await m.react('🕒')

      if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { users: {} }
      if (!global.db.data.chats[m.chat].users) global.db.data.chats[m.chat].users = {}

      const userData = global.db.data.chats[m.chat].users

      if (!userData[who]) {
        userData[who] = { coins: 0, bank: 0 }
      }

      // 💀 RESETEO TOTAL
      userData[who].coins = 0
      userData[who].bank = 0

      await m.react('✔️')

      return client.reply(m.chat,
`❀ *Dinero Reiniciado*

ꕥ El usuario fue limpiado
✧ Coins: 0
✧ Bank: 0

@${who.split('@')[0]}`, m, { mentions: [who] })

    } catch (error) {
      console.error(error)
      await m.react('✖️')
      return client.reply(m.chat,
`⚠︎ Se ha producido un problema.\n${error.message}`, m)
    }
  }
}
