const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc:'./img/background.png'
})

const shop = new Sprite({
	position: {
		x: 600,
		y: 225
	},
	imageSrc:'./img/shop.png',
	scale: 2,
	frameMax: 6
})
const player = new Fighter({
	position: {
		x: 0,
		y: 0
	},
	velocity: {
		x:0,
		y:10
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './img/samuraiMack/Idle.png',
	frameMax: 8,
	scale: 2.5,
	offset: {
		x: 250,
		y: 157
	},
	sprites: {
		idle: {
			imageSrc: './img/samuraiMack/Idle.png',
			frameMax: 8
		},
		run: {
			imageSrc: './img/samuraiMack/Run.png',
			frameMax: 8,
		},
		jump: {
			imageSrc: './img/samuraiMack/Jump.png',
			frameMax: 2,
		},
		fall: {
			imageSrc: './img/samuraiMack/Fall.png',
			frameMax: 2,
		},
		attack1: {
			imageSrc: './img/samuraiMack/Attack1.png',
			frameMax: 6,
		},
		takeHit: {
			imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
			frameMax: 4,
		},
		death: {
			imageSrc: './img/samuraiMack/Death.png',
			frameMax: 6,
		}
	},
	attackBox: {
		offset: {
			x: 50,
			y: 40
		},
		width: 170,
		height: 50
	}
})

const enemy = new Fighter({
	position: {
		x: 400,
		y: 100
	},
	velocity: {
		x:0,
		y:0
	},
	color: 'blue',
	offset: {
		x: -50,
		y: 0
	},
	imageSrc: './img/kenji/Idle.png',
	frameMax: 4,
	scale: 2.5,
	offset: {
		x: 250,
		y: 169
	},
	sprites: {
		idle: {
			imageSrc: './img/kenji/Idle.png',
			frameMax: 4
		},
		run: {
			imageSrc: './img/kenji/Run.png',
			frameMax: 8,
		},
		jump: {
			imageSrc: './img/kenji/Jump.png',
			frameMax: 2,
		},
		fall: {
			imageSrc: './img/kenji/Fall.png',
			frameMax: 2,
		},
		attack1: {
			imageSrc: './img/kenji/Attack1.png',
			frameMax: 4,
		},
		takeHit: {
			imageSrc: './img/kenji/Take hit.png',
			frameMax: 3,
		},
		death: {
			imageSrc: './img/kenji/Death.png',
			frameMax: 7,
		}
	},
	attackBox: {
		offset: {
			x: -204,
			y: 40
		},
		width: 160,
		height: 50
	}
})


console.log(player)

const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	//w: {
	//	pressed: false
	//},
	ArrowRight: {
		pressed: false
	},
	ArrowLeft: {
		pressed: false
	}
}


decreaseTimer()

function animate() {
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height)
	background.update()
	shop.update()
	c.fillStyle = 'rgba(255, 255, 255, .1)'
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.update()
	enemy.update()

	player.velocity.x=0
	enemy.velocity.x=0

	//player movement
	if (keys.a.pressed && player.lastKey === 'a') {
		if(player.position.x > 0)
		{
			player.velocity.x = -5
		}
		player.switchSprite('run')
	} else if (keys.d.pressed && player.lastKey === 'd') {
		if(player.position.x + player.width < canvas.width)
			player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle')
	}

	if(player.velocity.y < 0) {
		player.switchSprite('jump')
	} else if (player.velocity.y > 0) {
		player.switchSprite('fall')
	}

	//enemy movement
	if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
		if(enemy.position.x > 0)
			enemy.velocity.x = -5
		enemy.switchSprite('run')
	} else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
		if(enemy.position.x + enemy.width < canvas.width)
			enemy.velocity.x = 5
		enemy.switchSprite('run')
	} else {
		enemy.switchSprite('idle')
	}

	if(enemy.velocity.y < 0) {
		enemy.switchSprite('jump')
	} else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}

	// detect for collision & enemy gets hit
	if(
		rectangularCollision({
			rectangle1: player,
			rectangle2: enemy
		}) &&
		player.isAttacking && player.framesCurrent === 4
	) {
		enemy.takeHit()
		player.isAttacking = false

		gsap.to('#enemyHealth', {
			width: enemy.health + '%'
		})
	}

	// if player misses
	if(player.isAttacking && player.framesCurrent === 4) {
		player.isAttacking = false
	}

	// where the player gets hit
	if(
		rectangularCollision({
			rectangle1: enemy,
			rectangle2: player
		}) &&
		enemy.isAttacking && 
		enemy.framesCurrent === 2
	) {
		player.takeHit()
		enemy.isAttacking = false

		gsap.to('#playerHealth', {
			width: player.health + '%'
		})
	}

	// if enemy misses
	if(enemy.isAttacking && enemy.framesCurrent === 2) {
		enemy.isAttacking = false
	}

	// end game based on health
	if (enemy.health <= 0 || player.health <=0){
		determineWinner({ player, enemy, timerId })
	}
}

animate()

window.addEventListener('keydown', (event) => {
	if (!player.dead) {
			switch(event.key) {
			case 'd':
				keys.d.pressed = true
				player.lastKey = 'd'
				break
			case 'a':
				keys.a.pressed = true
				player.lastKey = 'a'
				break
			case 'w':
				if(player.position.y > 0 && player.numberOfJumps < 2)
				{
					player.velocity.y = -17
					player.numberOfJumps++;
				}
				break

			case ' ':
				player.attack()
				break
		}
	}
	
	if (!enemy.dead) {
			switch (event.key) {
			case 'ArrowRight':
				keys.ArrowRight.pressed = true
				enemy.lastKey = 'ArrowRight'
				break
			case 'ArrowLeft':
				keys.ArrowLeft.pressed = true
				enemy.lastKey = 'ArrowLeft'
				break
			case 'ArrowUp':
				if(enemy.position.y > 0 && enemy.numberOfJumps < 2)
				{
					enemy.velocity.y = -17
					enemy.numberOfJumps++;
				}
				break

			case 'ArrowDown':
				enemy.attack()
				//enemy.isAttacking = true
				break
		}
	}
	
})

window.addEventListener('keyup', (event) => {
	switch(event.key) {
		case 'd':
			keys.d.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		//case 'w':
		//	keys.a.pressed = false
		//	break	
	}

	//enemy keys
	switch(event.key) {
		case 'ArrowRight':
			keys.ArrowRight.pressed = false
			break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false
			break
		//case 'ArrowUp':
		//	keys.ArrowUp.pressed = false
		//	break	
	}

})






