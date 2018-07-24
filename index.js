const { parsed: env } = require('dotenv').load()
const Discord = require('discord.js')
const client = new Discord.Client()
const { spawn } = require('child_process')
const processes = new Map()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  updatePresence()
})

client.on('message', message => {
  if (message.system || message.author.bot) return
  if (processes.has(message.channel.id)) {
    const process = processes.get(message.channel.id)
    process.stdin.write(message.content + '\n')
  } else if (message.content === 'node') {
    const node = spawn('node', ['-i'])
    node.stdout.setEncoding('utf8')
    node.stdout.on('data', data => message.channel.send(data))
    node.stderr.on('data', data => message.channel.send(data))
    node.on('close', code => {
      message.channel.send('process exited with code ' + code)
      processes.delete(message.channel.id)
      updatePresence()
    })
    processes.set(message.channel.id, node)
    updatePresence()
  }
})

client.login(env.TOKEN)

function updatePresence() {
  client.user.setPresence({
    status: processes.size ? 'online' : 'idle',
    game: {
      name: processes.size + ' processes running!',
    },
  })
}
