
class Vector2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Projectile {
    constructor() {
        this.position = {x:0,y:0}
        this.target = null // 
        // this.parent = parentcontainer,
        this.speed = 1
        this.size = 1
        this.color = 'white'
        this.health = 10
        this.power = 1
        this.ricochet = false
    }
    isRicochet(bool) {
        this.ricochet = bool
    }
    setPower(pwr) {
        this.power = pwr
    }
    setSpeed(spd) {
        this.speed = spd
    }
    setPosition(Vector2) {
        this.position = Vector2
    }
    setTarget(target) {
        this.target = target
    }
    setSize(size) {
        this.size = size
    }
    setColor(color) {
        this.color = color
    }
    setHealth(health) {
        this.health = health
    }

    render(c) {
        if(this.target !== null || this.health === 0) {
            //  Y offset / X offset
            //  tan = vastakkainen / viereinen
            let offsetY = this.target.position.y - this.position.y
            let offsetX = this.target.position.x - this.position.x

            let angle = Math.atan2(offsetY, offsetX)

            this.position.x += Math.cos(angle) * this.speed
            this.position.y += Math.sin(angle) * this.speed

            // draw bullet
            c.beginPath()
            c.shadowBlur = 10;
            c.shadowColor = this.color
            c.fillStyle = this.color
            c.fillRect(
                this.position.x-this.size,
                this.position.y-this.size,
                this.size*2, this.size*2)
            c.shadowBlur = 0;

                // check if has collided with the target
            if(Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)) < this.speed * 2) {
                
                this.health = 0
                this.target.health -= this.power
            }
        }
       
    }

}

class Game {
    constructor() {
        this.maxHealth = 10
        this.health = 10
        this.power = 5
        this.turrets = 1
        this.money = 0
        this.turretCost = 20
        this.powerCost = 30
        this.position = {
            x: window.innerWidth * .5,
            y: window.innerHeight - (window.innerHeight * .1)*2
        }
        this.size = window.innerHeight * .1
        this.projectiles = []
        this.hostiles = []
        this.gametick = 0
        this.projectiletick = 0
        this.readyToShoot = true
        this.gameclock = null
        this.difficulty = 1
        this.difficultyTimer = 0
        this.bulletRicochetAmount = 0
        this.bulletRicoCost = 500
        this.laserChain = 0
        this.laserChainCost = 1500
        this.shootLaser = false
        this.laserTimer = 0
    }
    drawTower(c) {
        const unit = this.size *.35
        c.beginPath()
        c.strokeStyle    = "black"
        c.lineWidth = unit * .1

        c.fillStyle = "darkgreen"
        c.rect(
            this.position.x - unit, 
            this.position.y - unit,
            unit*2,
            unit*2)
        c.fill()
        c.stroke()
    }
    clearTimer() {
        
        window.clearInterval(this.gameclock)
    }
    chainLaser(c) {
        if(this.hostiles.length > 0) {

            let targetHostiles = this.hostiles.sort((a, b) => {
                let aDistX = a.position.x - this.position.x
                let aDistY = a.position.y - this.position.y
                let aDistance = Math.sqrt(Math.pow(aDistX, 2) + Math.pow(aDistY, 2))
                let bDistX = b.position.x - this.position.x
                let bDistY = b.position.y - this.position.y
                let bDistance = Math.sqrt(Math.pow(bDistX, 2) + Math.pow(bDistY, 2))
                return aDistance < bDistance ? -1 : 1; 
            })

            if(this.laserChain > 0) {
                c.beginPath()
                c.moveTo(this.position.x, this.position.y)
                c.strokeStyle = 'white'
                c.shadowBlur = 4
                c.shadowColor = 'red'
                c.lineWidth = 1
                for(let i = 0; i < this.laserChain; i++) {

                    let th = targetHostiles[i] ?? targetHostiles[0]
                    c.lineTo(th.position.x, th.position.y)
                    th.health -= Math.ceil(this.power*.2)
                }
                c.stroke()
                c.shadowBlur = 0
            }
        }
    }

    ricoBullets(bullet) {
        if(this.hostiles.length > 0) {
            let targetHostiles = this.hostiles.sort((a, b) => {
                let aDistX = a.position.x - bullet.position.x
                let aDistY = a.position.y - bullet.position.y
                let aDistance = Math.sqrt(Math.pow(aDistX, 2) + Math.pow(aDistY, 2))
                let bDistX = b.position.x - bullet.position.x
                let bDistY = b.position.y - bullet.position.y
                let bDistance = Math.sqrt(Math.pow(bDistX, 2) + Math.pow(bDistY, 2))
                
                return aDistance < bDistance ? -1 : 1; 
            })

            for(let i = 0; i < this.bulletRicochetAmount; i++) {
                let bulletfragment = new Projectile()
                let th = targetHostiles[i] ?? targetHostiles[0]
                let bPosition = new Vector2(bullet.position.x, bullet.position.y)
                bulletfragment.setPosition(bPosition)
                bulletfragment.setTarget(th)
                bulletfragment.setSpeed(10)
                bulletfragment.setPower(bullet.power / 2)
                bulletfragment.isRicochet(true)
                this.projectiles.push(bulletfragment)
            }

        }
    }

    actionloop(c) {
        this.gametick++
        this.projectiletick++
        this.laserTimer++
        
        if(this.laserTimer >= 18) {
            
            this.shootLaser = true
            if(this.laserTimer >= 20) {
                this.laserTimer = 0
                this.shootLaser = false
            }
        }

        // add hostile
        if(this.gametick % 5 === 0) {
            this.gametick = 0
            this.difficultyTimer++
            if(this.difficultyTimer >= 100) {
                this.difficulty++
                this.difficultyTimer = 0
            }

            for(let i = 0; i < this.difficulty; i++) {

                let hostile = new Projectile()
                let randX = Math.floor(Math.random() * window.innerWidth)
                let randY = Math.floor(Math.random() * 100)
                let randSpd = 1 + (10 * (this.difficulty / 100))
                let randSize = 2 + 40 * (this.difficulty / 100)
                let hostileHealth = 10 * this.difficulty
        
                hostile.setPosition(new Vector2(randX, randY))
                hostile.setTarget(this)
                hostile.setSpeed(randSpd)
                hostile.setSize(randSize)
                hostile.setColor('darkblue')
                hostile.setHealth(hostileHealth)
                hostile.setPower(this.difficulty)

                this.hostiles.push(hostile)
            }
        }
        if(this.projectiletick >= 6) {
            this.readyToShoot = true
        }

        if(this.readyToShoot) {
            // select nearest object
            if(this.hostiles.length > 0) {
                let targetHostiles = this.hostiles.sort((a, b) => {
                    let aDistX = a.position.x - this.position.x
                    let aDistY = a.position.y - this.position.y
                    let aDistance = Math.sqrt(Math.pow(aDistX, 2) + Math.pow(aDistY, 2))
                    let bDistX = b.position.x - this.position.x
                    let bDistY = b.position.y - this.position.y
                    let bDistance = Math.sqrt(Math.pow(bDistX, 2) + Math.pow(bDistY, 2))
                    
                    return aDistance < bDistance ? -1 : 1; 
                })

                for(let i = 0; i < this.turrets; i++) {
                    let bullet = new Projectile()
                    let bPosition = new Vector2(this.position.x, this.position.y)
                    bullet.setPosition(bPosition)
                    bullet.setTarget(targetHostiles[i] ?? targetHostiles[0])
                    bullet.setSpeed(10)
                    bullet.setPower(this.power)
                    this.projectiles.push(bullet)
                }

                this.projectiletick = 0
                this.readyToShoot = false

            }
        }

    }

    clearProjectiles() {
        if(this.projectiles.length > 0)
            for(let i = 0; i < this.projectiles.length; i++) 
                if(this.projectiles[i].target === null || this.projectiles[i].health <= 0) {
                    if(this.bulletRicochetAmount > 0 && !this.projectiles[i].ricochet)
                        this.ricoBullets(this.projectiles[i])
                    this.projectiles.splice(i, 1)
                    if(i > 0) i--
                }
            
    }
    clearHostiles() {
        if(this.hostiles.length > 0)
            for(let i = 0; i < this.hostiles.length; i++) 
                if(this.hostiles[i].target === null || this.hostiles[i].health <= 0) {
                    this.hostiles.splice(i, 1)
                    if(i > 0) i--
                    this.money += 5 * this.difficulty
                }
            
    }
    
    info(c) {
        if(this.health >= 0) {
            c.beginPath()
            c.fillStyle = 'red'
            c.fillRect(
                window.innerWidth * .5 -100,
                window.innerHeight-10,
                this.health / this.maxHealth * 200,
                -20)
        }

        c.beginPath()
        c.strokeStyle = 'darkred'
        c.rect(
            window.innerWidth * .5 -100,
            window.innerHeight-10,
            200,
            -20)
        c.stroke()


        c.font = '16px Arial'
        c.fillStyle = 'white'
        //turrets
        c.fillText('Turrets: '+this.turrets, 5, window.innerHeight-85)
        c.fillText('[T] $'+this.turretCost, 175, window.innerHeight-85)
        //power
        c.fillText('Power: '+this.power, 5, window.innerHeight-60)
        c.fillText('[P] $'+this.powerCost, 175, window.innerHeight-60)
        //money
        c.fillText('Money: '+this.money, 5, window.innerHeight-10)
        //Health
        c.fillText('[H] $100', window.innerWidth * .5 - 175, window.innerHeight-15)
        //ricochet
        c.fillText('Bullet ricochet: '+this.bulletRicochetAmount, 5, window.innerHeight-110)
        c.fillText('[R] $'+this.bulletRicoCost, 175, window.innerHeight-110)
        //laser
        c.fillText('Laser chain: '+this.laserChain, 5, window.innerHeight-135)
        c.fillText('[L] $'+this.laserChainCost, 175, window.innerHeight-135)
        
        //level
        c.fillText('Difficult level: '+this.difficulty, window.innerWidth/2 -100, window.innerHeight-55)

        c.beginPath()
        c.fillStyle = 'blue'
        c.fillRect(
            window.innerWidth * .5 -100,
            window.innerHeight-36,
            this.difficultyTimer / 100 * 200,
            -12)
        
        
        c.beginPath()
        c.strokeStyle = 'darkblue'
        c.rect(
            window.innerWidth * .5 -100,
            window.innerHeight-36,
            200,
            -12)
        c.stroke()
    }
    render(c) {
        this.clearProjectiles()
        this.clearHostiles()
        //first render the main tower in the middle
        this.drawTower(c)
        //draw hostiles
        if(this.hostiles.length > 0)
            for(let h of this.hostiles)
                h.render(c)
        //draw projectiles
        if(this.projectiles.length > 0)
            for(let p of this.projectiles)
                p.render(c)

        if(this.shootLaser)
            this.chainLaser(c)

        //draw info
        this.info(c)
    }
}