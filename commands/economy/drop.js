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

    // 💰 COSTO
    const price = 200000
    if (!isOwner2) {
      if (user.coins < price) {
        return m.reply(
`╭─❀「 💸 」❀─╮
   ʚ exploración bloqueada ɞ

   ✖️ no tienes suficiente dinero
   ➤ ${currency}${price.toLocaleString()}

╰──────────────╯`)
      }
      user.coins -= price
    }

    // 🧠 anti spam
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
`╭─❀「 ⚠️ 」❀─╮
  ฅ anti-spam activado
  💸 -${currency}${multa.toLocaleString()}
╰──────────────╯`)
      }

      const restante = formatTime(cooldown - (now - user.lastLoot))
      return m.reply(`⏳ espera: *${restante}*`)
    }

    user.lastLoot = now
    user.spamLoot = 0

    // 🍀 suerte
    user.luck ||= 0
    const luckBoost = user.luck * 0.02

    // 🎬 animación
    let { key } = await client.sendMessage(m.chat, {
      text: `🐾 buscando cositas...\nฅ▱▱▱▱▱`
    }, { quoted: m })

    await delay(1200)
    await client.sendMessage(m.chat, {
      text: `🐾 olfateando...\nฅ▰▰▱▱▱`,
      edit: key
    })

    await delay(1200)

    const rand = Math.random() + luckBoost

    let item = ''
    let rare = ''
    let min = 0
    let max = 0

    // 🌟 DIVINO
    if (rand < 0.005) {
      const divine = [
        '🐱✨ huevo neko celestial',
        '🌌🐾 esencia del cosmos'
      ]
      item = divine[Math.floor(Math.random() * divine.length)]
      rare = '🌟 divino'
      min = 300000
      max = 500000

    // 🌈 MÍTICO
    } else if (rand < 0.02) {
      const mythics = [
        '🐰🌸 reliquia pascua',
        '🐱👑 corona neko',
        '🐉🔥 alma antigua',
        '🌙🐾 fragmento lunar',
        '🌀💫 núcleo arcano'
      ]
      item = mythics[Math.floor(Math.random() * mythics.length)]
      rare = '🌈 mítico'
      min = 180000
      max = 300000

    // 🔥 LEGENDARIO
    } else if (rand < 0.06) {
      const leg = [
        '🐾⚡ garra eléctrica',
        '🐱💎 gema brillante',
        '🐰🍫 huevo dulce',
        '🌙🔮 esfera mágica',
        '🔥🗡 filo ardiente',
        '🌸✨ pétalo eterno'
      ]
      item = leg[Math.floor(Math.random() * leg.length)]
      rare = '🔥 legendario'
      min = 120000
      max = 200000

    // 💜 ÉPICO
    } else if (rand < 0.15) {
      const epic = [
        '🐾💜 amuleto neko',
        '🌸📿 collar floral',
        '🍡✨ dulce mágico',
        '🧿🌙 ojo protector',
        '🐱🎀 lazo bendito',
        '🌿💫 esencia natural'
      ]
      item = epic[Math.floor(Math.random() * epic.length)]
      rare = '💜 épico'
      min = 60000
      max = 120000

    // 💙 RARO
    } else if (rand < 0.30) {
      const rareItems = [
        '🐱🗡 garra afilada',
        '🌸🧪 poción floral',
        '📜🐾 pergamino neko',
        '🍃✨ hoja brillante',
        '🧃💧 frasco mágico',
        '🐾🪶 pluma ligera'
      ]
      item = rareItems[Math.floor(Math.random() * rareItems.length)]
      rare = '💙 raro'
      min = 20000
      max = 60000

    // 💚 COMÚN
    } else if (rand < 0.55) {
      const common = [
        '🐾🥕 zanahoria',
        '🐱🍞 pan',
        '🌿🪵 madera',
        '🐰🪨 piedrita',
        '🍎🐾 manzana',
        '🌾🌿 trigo'
      ]
      item = common[Math.floor(Math.random() * common.length)]
      rare = '💚 común'
      min = 5000
      max = 20000

    // 🤍 BASURA
    } else {
      const basura = [
        '🧻🐾 papel roto',
        '🥾🐱 zapato viejo',
        '🪨💤 piedra',
        '🪵😴 madera rota',
        '🥫🐾 lata vacía',
        '📦💀 caja rota'
      ]
      item = basura[Math.floor(Math.random() * basura.length)]
      rare = '🤍 básico'
      min = 1000
      max = 5000
    }

    // 💰 valor dinámico con suerte
    const luckFactor = 1 + (user.luck * 0.01)
    let value = Math.floor(Math.random() * (max - min) + min)
    value = Math.floor(value * luckFactor)

    // 🎒 inventario
    user.inventory ||= []
    user.inventory.push({ name: item, value, rare })

    // 💸 bonus
    const bonus = Math.floor(value * 0.15)
    user.coins += bonus

    // 🍀 subir suerte
    if (Math.random() < 0.3) user.luck++

    await client.sendMessage(m.chat, {
      text:
`╭─❀「 🐾 」❀─╮
   ʚ exploración neko ɞ

   ${rare}

   ✧ encontraste:
   ➤ ${item}

   💰 valor:
   ➤ ${currency}${value.toLocaleString()}

   ✦ bonus:
   ➤ +${currency}${bonus.toLocaleString()}

   🍀 suerte: ${user.luck}
   ${isOwner2 ? '\n   👑 bonus neko activo' : ''}

╰──────────────╯`
    }, { edit: key })
  }
}

function formatTime(ms) {
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}m ${sec}s`
}
