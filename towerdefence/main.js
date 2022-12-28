const canvas = document.getElementById('game')
const c = canvas.getContext('2d')
const game = new Game()

const initCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height= window.innerHeight
}
window.onload = () => {
    initCanvas()
    game.gameclock = setInterval(() => {game.actionloop(c)}, 160)    
}
window.onresize = initCanvas

const loop = () => {
    if(game.health > 0) {
        c.clearRect(0,0,window.innerWidth, window.innerHeight)
        game.render(c)
        window.requestAnimationFrame(loop)
    }
    else 
        game.clearTimer()
}
window.requestAnimationFrame(loop)

window.addEventListener('keydown', e => {

    if(e.keyCode === 84) {
        if(game.money >= game.turretCost) {
            game.money -= game.turretCost
            game.turrets++
            game.turretCost = Math.round(game.turretCost * 1.5)
        }
    }

    if(e.keyCode === 80) {
        if(game.money >= game.powerCost) {
            game.money -= game.powerCost
            game.power++
            game.powerCost = Math.round(game.powerCost * 1.5)
        }
    }

    if(e.keyCode === 72) {
        if(game.money >= 100) {
            game.money -= 100
            game.health = game.maxHealth
        }
    }

    if(e.keyCode === 82) {
        if(game.money >= game.bulletRicoCost) {
            game.money -= game.bulletRicoCost
            game.bulletRicochetAmount++
            game.bulletRicoCost = Math.round(game.bulletRicoCost * 1.25)
        }
    }
    if(e.keyCode === 76) {
        if(game.money >= game.laserChainCost) {
            game.money -= game.laserChainCost
            game.laserChain++
            game.laserChainCost = Math.round(game.laserChainCost * 1.25)
        }
    }
    console.log(e.keyCode)
})