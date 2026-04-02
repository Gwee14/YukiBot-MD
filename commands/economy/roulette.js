export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix) => {

    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.economy)
      return m.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`)

    const user = chatData.users[m.sender]
    const currency = botSettings.currency || 'Monedas'

    if (args.length < 2)
      return m.reply(`《✧》 Debes ingresar una cantidad de ${currency} y apostar a un color.`)

    let amount, color

    if (!isNaN(parseInt(args[0]))) {
      amount = parseInt(args[0])
      color = args[1].toLowerCase()
    } else if (!isNaN(parseInt(args[1]))) {
      color = args[0].toLowerCase()
      amount = parseInt(args[1])
    } else {
      return m.reply(`《✧》 Formato inválido. Ejemplo: *rt 2000 black* o *rt black 2000*`)
    }

    const validColors = ['red', 'black', 'green']

    if (isNaN(amount) || amount < 200)
      return m.reply(`《✧》 La cantidad mínima de ${currency} a apostar es 200.`)

    if (!validColors.includes(color))
      return m.reply(`《✧》 Por favor, elige un color válido: red, black, green.`)

    if (user.coins < amount)
      return m.reply(`《✧》 No tienes suficientes *${currency}* para hacer esta apuesta.`)

    // 💸 quitar apuesta primero
    user.coins -= amount

    // 🎡 PROBABILIDADES NERFEADAS
    const roll = Math.random()
    let resultColor = ''

    if (roll < 0.45) resultColor = 'red'
    else if (roll < 0.90) resultColor = 'black'
    else resultColor = 'green' // solo 10%

    // 🧠 ANTI RICOS
    let richPenalty = 0
    if (user.coins > 100000) richPenalty = 0.10
    if (user.coins > 500000) richPenalty = 0.20
    if (user.coins > 1000000) richPenalty = 0.30

    if (resultColor === color) {

      let reward = 0

      if (resultColor === 'green') {
        // 💀 mega nerf green
        reward = Math.floor(amount * (8 - richPenalty * 5))
      } else {
        reward = Math.floor(amount * (1.5 - richPenalty))
      }

      reward = Math.max(1, reward)

      user.coins += reward

      await client.sendMessage(chatId, {
        text: `「✿」 La ruleta salió en *${resultColor}* y has ganado *¥${reward.toLocaleString()} ${currency}*.`,
        mentions: [senderId]
      }, { quoted: m })

    } else {

      // 💀 castigo extra
      if (Math.random() < 0.25) {
        let extra = Math.floor(amount * 0.5)
        user.coins = Math.max(0, user.coins - extra)
      }

      await client.sendMessage(chatId, {
        text: `「✿」 La ruleta salió en *${resultColor}* y has perdido *¥${amount.toLocaleString()} ${currency}*.`,
        mentions: [senderId]
      }, { quoted: m })
    }
  },
}
