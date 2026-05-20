const express = require('express')
const fs = require('fs')
const app = express()
const PORT = 3000
const db = {}

db.jogadores = JSON.parse(fs.readFileSync('server/data/jogadores.json', 'utf-8'))
db.jogosPorJogador = JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json', 'utf-8'))

app.set('view engine', 'hbs')
app.set('views', 'server/views')

app.get('/', (req, res) => {
  res.render('index', { players: db.jogadores.players })
})

app.get('/jogador/:numero_identificador/', (req, res) => {
  const steamid = req.params.numero_identificador
  
  const player = db.jogadores.players.find(p => p.steamid === steamid)
  if (!player) {
    return res.status(404).send('Jogador não encontrado')
  }

  const playerGames = db.jogosPorJogador[steamid]
  if (!playerGames) {
    return res.status(404).send('Dados de jogos não encontrados')
  }

  const games = playerGames.games || []
  const notPlayedCount = games.filter(g => g.playtime_forever === 0).length
  
  const favoriteGame = games.reduce((max, game) => 
    game.playtime_forever > (max.playtime_forever || 0) ? game : max, {})

  const topFiveGames = [...games]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 5)
    .map(g => ({
      ...g,
      playtimeFormatted: (g.playtime_forever / 60).toFixed(0) + 'h'
    }))
  
  if (favoriteGame.appid) {
    favoriteGame.playtimeFormatted = (favoriteGame.playtime_forever / 60).toFixed(0) + 'h'
  }
  
  res.render('jogador', {
    player,
    gameCount: playerGames.game_count,
    notPlayedCount,
    favoriteGame,
    topFiveGames
  })
})

app.use(express.static('client'))

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
