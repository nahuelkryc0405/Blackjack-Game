// ========================================
// BLACKJACK ARCADE - EDICIÓN DELUXE
// Sistema completo con desbloqueables y logros
// ========================================

class BlackjackGame {
    constructor() {
        // Inicialización del juego
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.bankroll = 1000;
        this.currentBet = 10;
        this.gameInProgress = false;
        this.dealerHoleCard = null;

        // Sistema de progresión
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 100;
        this.totalWins = 0;
        this.totalLosses = 0;
        this.totalPushes = 0;
        this.totalBlackjacks = 0;
        this.totalHands = 0;
        this.highestBankroll = 1000;
        this.biggestWin = 0;
        this.winStreak = 0;
        this.currentStreak = 0;

        // Sistema de sonido
        this.soundEnabled = true;
        this.currentTheme = 'default';

        // Logros y desbloqueables
        this.achievements = this.initAchievements();
        this.unlockables = this.initUnlockables();

        // Cargar datos guardados
        this.loadGame();
        this.updateUI();
        this.initSounds();
    }

    // ========================================
    // SISTEMA DE INICIALIZACIÓN
    // ========================================

    initAchievements() {
        return [
            {
                id: 'first_win',
                name: 'Primera Victoria',
                description: 'Gana tu primera mano',
                icon: '🎉',
                unlocked: false,
                xpReward: 50
            },
            {
                id: 'blackjack_master',
                name: 'Maestro del Blackjack',
                description: 'Consigue 10 blackjacks',
                icon: '♠️',
                unlocked: false,
                condition: () => this.totalBlackjacks >= 10,
                xpReward: 200
            },
            {
                id: 'millionaire',
                name: 'Millonario',
                description: 'Alcanza 10,000 en bankroll',
                icon: '💰',
                unlocked: false,
                condition: () => this.bankroll >= 10000,
                xpReward: 500
            },
            {
                id: 'win_streak_5',
                name: 'Racha Ganadora',
                description: 'Gana 5 manos seguidas',
                icon: '🔥',
                unlocked: false,
                condition: () => this.currentStreak >= 5,
                xpReward: 150
            },
            {
                id: 'win_streak_10',
                name: 'Imparable',
                description: 'Gana 10 manos seguidas',
                icon: '⚡',
                unlocked: false,
                condition: () => this.currentStreak >= 10,
                xpReward: 300
            },
            {
                id: 'high_roller',
                name: 'Apostador Grande',
                description: 'Gana una apuesta de 500 o más',
                icon: '💎',
                unlocked: false,
                xpReward: 250
            },
            {
                id: 'veteran',
                name: 'Veterano',
                description: 'Juega 100 manos',
                icon: '🎖️',
                unlocked: false,
                condition: () => this.totalHands >= 100,
                xpReward: 200
            },
            {
                id: 'level_10',
                name: 'Nivel 10',
                description: 'Alcanza el nivel 10',
                icon: '⭐',
                unlocked: false,
                condition: () => this.level >= 10,
                xpReward: 400
            },
            {
                id: 'comeback_king',
                name: 'Rey del Regreso',
                description: 'Recupera 1000 después de bajar a 100',
                icon: '👑',
                unlocked: false,
                xpReward: 300
            },
            {
                id: 'perfect_21',
                name: '21 Perfecto',
                description: 'Consigue exactamente 21 con 3 o más cartas',
                icon: '🎯',
                unlocked: false,
                xpReward: 100
            }
        ];
    }

    initUnlockables() {
        return [
            {
                id: 'card_back_gold',
                name: 'Reverso Dorado',
                description: 'Reverso de cartas dorado premium',
                icon: '🟨',
                cost: 500,
                unlocked: false,
                type: 'cosmetic'
            },
            {
                id: 'card_back_diamond',
                name: 'Reverso Diamante',
                description: 'Reverso de cartas con diamantes',
                icon: '💎',
                cost: 1000,
                unlocked: false,
                type: 'cosmetic'
            },
            {
                id: 'bonus_multiplier',
                name: 'Multiplicador x1.5',
                description: 'Multiplica ganancias por 1.5',
                icon: '✨',
                cost: 2000,
                unlocked: false,
                type: 'upgrade'
            },
            {
                id: 'insurance_boost',
                name: 'Seguro Mejorado',
                description: 'Reduce pérdidas en 10%',
                icon: '🛡️',
                cost: 1500,
                unlocked: false,
                type: 'upgrade'
            },
            {
                id: 'xp_boost',
                name: 'Impulso de XP',
                description: 'Gana 50% más XP',
                icon: '⚡',
                cost: 1000,
                unlocked: false,
                type: 'upgrade'
            },
            {
                id: 'lucky_charm',
                name: 'Amuleto de Suerte',
                description: 'Mayor probabilidad de cartas altas',
                icon: '🍀',
                cost: 3000,
                unlocked: false,
                type: 'upgrade'
            },
            {
                id: 'theme_dark',
                name: 'Tema Oscuro',
                description: 'Tema oscuro para la interfaz',
                icon: '🌙',
                cost: 300,
                unlocked: false,
                type: 'theme'
            },
            {
                id: 'theme_neon',
                name: 'Tema Neón',
                description: 'Tema neón cyberpunk',
                icon: '🌈',
                cost: 800,
                unlocked: false,
                type: 'theme'
            }
        ];
    }

    initSounds() {
        // Crear contexto de audio Web API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Definir sonidos con frecuencias
        this.sounds = {
            cardDeal: { freq: 440, duration: 0.1 },
            win: { freq: 880, duration: 0.3 },
            lose: { freq: 220, duration: 0.3 },
            levelUp: { freq: 1200, duration: 0.5 },
            achievement: { freq: 1400, duration: 0.4 },
            click: { freq: 600, duration: 0.05 }
        };
    }

    playSound(soundName) {
        if (!this.soundEnabled) return;

        try {
            const sound = this.sounds[soundName];
            if (!sound) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = sound.freq;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    // ========================================
    // SISTEMA DE CARTAS Y MAZO
    // ========================================

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];

        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({
                    suit: suit,
                    value: value,
                    numValue: this.getCardValue(value)
                });
            }
        }

        // Mezclar el mazo
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    getCardValue(value) {
        if (value === 'A') return 11;
        if (['K', 'Q', 'J'].includes(value)) return 10;
        return parseInt(value);
    }

    drawCard() {
        if (this.deck.length < 10) {
            this.createDeck();
        }
        return this.deck.pop();
    }

    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        for (let card of hand) {
            value += card.numValue;
            if (card.value === 'A') aces++;
        }

        // Ajustar ases si es necesario
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    isBlackjack(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    }

    // ========================================
    // LÓGICA DEL JUEGO
    // ========================================

    deal() {
        if (this.gameInProgress) return;

        const bet = parseInt(document.getElementById('bet-amount').value);

        if (bet > this.bankroll) {
            this.showNotification('Apuesta mayor que el bankroll', 'error');
            return;
        }

        if (bet < 1) {
            this.showNotification('Apuesta mínima es 1', 'error');
            return;
        }

        this.playSound('cardDeal');
        this.currentBet = bet;
        this.gameInProgress = true;
        this.playerHand = [];
        this.dealerHand = [];

        // Crear nuevo mazo si es necesario
        if (this.deck.length < 20) {
            this.createDeck();
        }

        // Repartir cartas iniciales
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        this.playerHand.push(this.drawCard());
        this.dealerHoleCard = this.drawCard();
        this.dealerHand.push(this.dealerHoleCard);

        this.renderHands(true);
        this.updateButtons();

        // Verificar blackjack del jugador
        if (this.isBlackjack(this.playerHand)) {
            setTimeout(() => this.checkBlackjacks(), 500);
        }
    }

    checkBlackjacks() {
        const playerBJ = this.isBlackjack(this.playerHand);
        const dealerBJ = this.isBlackjack(this.dealerHand);

        if (playerBJ && dealerBJ) {
            this.endRound('push', 'Empate - Ambos tienen Blackjack!');
        } else if (playerBJ) {
            this.endRound('blackjack', '¡BLACKJACK! Ganaste x2.5');
        } else if (dealerBJ) {
            this.endRound('lose', 'Dealer tiene Blackjack');
        }
    }

    hit() {
        if (!this.gameInProgress) return;

        this.playSound('cardDeal');
        this.playerHand.push(this.drawCard());
        this.renderHands(true);

        const playerValue = this.calculateHandValue(this.playerHand);

        if (playerValue > 21) {
            this.endRound('bust', '¡Te pasaste! Perdiste');
        } else if (playerValue === 21) {
            // Verificar logro de 21 perfecto
            if (this.playerHand.length >= 3) {
                this.checkAchievement('perfect_21');
            }
            this.stand();
        }
    }

    stand() {
        if (!this.gameInProgress) return;

        this.gameInProgress = false;
        this.renderHands(false);

        // Dealer juega
        setTimeout(() => this.dealerPlay(), 500);
    }

    dealerPlay() {
        const dealerValue = this.calculateHandValue(this.dealerHand);

        if (dealerValue < 17) {
            this.playSound('cardDeal');
            this.dealerHand.push(this.drawCard());
            this.renderHands(false);
            setTimeout(() => this.dealerPlay(), 600);
        } else {
            this.determineWinner();
        }
    }

    double() {
        if (!this.gameInProgress || this.playerHand.length !== 2) return;
        if (this.currentBet * 2 > this.bankroll) {
            this.showNotification('No tienes suficiente bankroll para doblar', 'error');
            return;
        }

        this.currentBet *= 2;
        this.hit();

        if (this.gameInProgress) {
            this.stand();
        }
    }

    determineWinner() {
        const playerValue = this.calculateHandValue(this.playerHand);
        const dealerValue = this.calculateHandValue(this.dealerHand);

        if (dealerValue > 21) {
            this.endRound('win', '¡Dealer se pasó! Ganaste');
        } else if (playerValue > dealerValue) {
            this.endRound('win', '¡Ganaste!');
        } else if (playerValue < dealerValue) {
            this.endRound('lose', 'Perdiste');
        } else {
            this.endRound('push', 'Empate');
        }
    }

    endRound(result, message) {
        this.gameInProgress = false;
        this.totalHands++;

        let winAmount = 0;
        let xpGained = 10;

        // Calcular resultado
        if (result === 'blackjack') {
            winAmount = this.currentBet * 2.5;
            xpGained = 50;
            this.totalBlackjacks++;
            this.totalWins++;
            this.currentStreak++;
            this.playSound('win');
            this.checkAchievement('blackjack_master');
        } else if (result === 'win') {
            winAmount = this.currentBet * 2;
            xpGained = 30;
            this.totalWins++;
            this.currentStreak++;
            this.playSound('win');
            this.checkAchievement('first_win');

            // Verificar logro de apuesta grande
            if (this.currentBet >= 500) {
                this.checkAchievement('high_roller');
            }
        } else if (result === 'push') {
            winAmount = this.currentBet;
            xpGained = 15;
            this.totalPushes++;
        } else {
            winAmount = 0;
            xpGained = 5;
            this.totalLosses++;
            this.currentStreak = 0;
            this.playSound('lose');
        }

        // Aplicar mejoras desbloqueables
        if (this.unlockables.find(u => u.id === 'bonus_multiplier' && u.unlocked) && result !== 'push') {
            winAmount *= 1.5;
        }

        if (this.unlockables.find(u => u.id === 'insurance_boost' && u.unlocked) && result === 'lose') {
            winAmount = this.currentBet * 0.1;
            message += ' (10% recuperado)';
        }

        if (this.unlockables.find(u => u.id === 'xp_boost' && u.unlocked)) {
            xpGained *= 1.5;
        }

        // Actualizar bankroll
        const netGain = winAmount - this.currentBet;
        this.bankroll += netGain;

        if (this.bankroll > this.highestBankroll) {
            this.highestBankroll = this.bankroll;
        }

        if (netGain > this.biggestWin) {
            this.biggestWin = netGain;
        }

        if (this.currentStreak > this.winStreak) {
            this.winStreak = this.currentStreak;
        }

        // Verificar logros de racha
        this.checkAchievement('win_streak_5');
        this.checkAchievement('win_streak_10');
        this.checkAchievement('millionaire');
        this.checkAchievement('veteran');

        // Añadir XP
        this.addXP(Math.floor(xpGained));

        // Mostrar resultado
        this.showResult(result, message);
        this.updateUI();
        this.updateButtons();
        this.saveGame();

        // Renderizar manos finales
        this.renderHands(false);
    }

    // ========================================
    // SISTEMA DE EXPERIENCIA Y NIVELES
    // ========================================

    addXP(amount) {
        this.xp += amount;

        while (this.xp >= this.xpNeeded) {
            this.levelUp();
        }

        this.updateXPBar();
    }

    levelUp() {
        this.xp -= this.xpNeeded;
        this.level++;
        this.xpNeeded = Math.floor(this.xpNeeded * 1.5);

        // Bonificación por subir de nivel
        const bonus = this.level * 50;
        this.bankroll += bonus;

        this.playSound('levelUp');
        this.showNotification(`¡NIVEL ${this.level}! +${bonus} de bonificación`, 'achievement');

        this.checkAchievement('level_10');
    }

    updateXPBar() {
        const percentage = (this.xp / this.xpNeeded) * 100;
        document.getElementById('xp-bar').style.width = percentage + '%';
    }

    // ========================================
    // SISTEMA DE LOGROS
    // ========================================

    checkAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);

        if (!achievement || achievement.unlocked) return;

        let shouldUnlock = false;

        if (achievementId === 'first_win') {
            shouldUnlock = this.totalWins >= 1;
        } else if (achievement.condition) {
            shouldUnlock = achievement.condition();
        }

        if (shouldUnlock) {
            achievement.unlocked = true;
            this.addXP(achievement.xpReward);
            this.playSound('achievement');
            this.showNotification(`🏆 Logro Desbloqueado: ${achievement.name}`, 'achievement');
            this.saveGame();
        }
    }

    showAchievements() {
        const modal = document.getElementById('achievements-modal');
        const list = document.getElementById('achievements-list');

        list.innerHTML = '';

        this.achievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? '' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</div>
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-reward">+${achievement.xpReward} XP</div>
            `;
            list.appendChild(card);
        });

        modal.style.display = 'block';
    }

    // ========================================
    // SISTEMA DE DESBLOQUEABLES
    // ========================================

    showUnlockables() {
        const modal = document.getElementById('unlockables-modal');
        const list = document.getElementById('unlockables-list');

        list.innerHTML = '';

        this.unlockables.forEach(unlockable => {
            const card = document.createElement('div');
            card.className = `unlockable-card ${unlockable.unlocked ? '' : 'locked'}`;
            card.innerHTML = `
                <div class="unlockable-icon">${unlockable.icon}</div>
                <div class="unlockable-name">${unlockable.name}</div>
                <div class="unlockable-cost">${unlockable.unlocked ? 'Desbloqueado' : `💰 ${unlockable.cost}`}</div>
                <div class="unlockable-description">${unlockable.description}</div>
                ${!unlockable.unlocked ? `
                    <button class="unlock-btn" onclick="game.unlockItem('${unlockable.id}')"
                        ${this.bankroll < unlockable.cost ? 'disabled' : ''}>
                        Desbloquear
                    </button>
                ` : ''}
            `;
            list.appendChild(card);
        });

        modal.style.display = 'block';
    }

    unlockItem(itemId) {
        const item = this.unlockables.find(u => u.id === itemId);

        if (!item || item.unlocked) return;

        if (this.bankroll < item.cost) {
            this.showNotification('No tienes suficiente bankroll', 'error');
            return;
        }

        this.bankroll -= item.cost;
        item.unlocked = true;

        // Aplicar tema si es un tema
        if (item.type === 'theme') {
            this.applyTheme(itemId);
        }

        this.playSound('achievement');
        this.showNotification(`¡Desbloqueado: ${item.name}!`, 'success');
        this.updateUI();
        this.saveGame();
        this.showUnlockables(); // Refrescar modal
    }

    applyTheme(themeId) {
        document.body.className = '';

        if (themeId === 'theme_dark') {
            document.body.classList.add('dark-theme');
            this.currentTheme = 'dark';
        } else if (themeId === 'theme_neon') {
            document.body.classList.add('neon-theme');
            this.currentTheme = 'neon';
        } else {
            this.currentTheme = 'default';
        }
    }

    // ========================================
    // RENDERIZADO Y UI
    // ========================================

    renderHands(hideDealer) {
        this.renderHand(this.playerHand, 'player-cards', 'player-score', false);
        this.renderHand(this.dealerHand, 'dealer-cards', 'dealer-score', hideDealer);
    }

    renderHand(hand, containerId, scoreId, hideSecond) {
        const container = document.getElementById(containerId);
        const scoreElement = document.getElementById(scoreId);

        container.innerHTML = '';

        hand.forEach((card, index) => {
            const cardElement = document.createElement('div');

            if (hideSecond && index === 1) {
                cardElement.className = 'card card-back';
                cardElement.innerHTML = '<div class="card-value"></div><div class="card-suit"></div>';
            } else {
                const isRed = card.suit === '♥' || card.suit === '♦';
                cardElement.className = `card ${isRed ? 'red' : 'black'}`;
                cardElement.innerHTML = `
                    <div class="card-value">${card.value}</div>
                    <div class="card-suit">${card.suit}</div>
                    <div class="card-value">${card.value}</div>
                `;
            }

            container.appendChild(cardElement);
        });

        // Actualizar puntuación
        if (hideSecond && hand.length > 1) {
            const firstCard = hand[0];
            scoreElement.textContent = firstCard.numValue;
        } else {
            scoreElement.textContent = this.calculateHandValue(hand);
        }
    }

    showResult(result, message) {
        const resultElement = document.getElementById('result-message');
        resultElement.className = `result-message ${result}`;
        resultElement.textContent = message;

        setTimeout(() => {
            resultElement.className = 'result-message';
            resultElement.textContent = '';
        }, 5000);
    }

    updateUI() {
        document.getElementById('bankroll').textContent = Math.floor(this.bankroll);
        document.getElementById('level').textContent = this.level;
        document.getElementById('xp').textContent = this.xp;
        document.getElementById('xp-needed').textContent = this.xpNeeded;
        document.getElementById('wins').textContent = this.totalWins;
        this.updateXPBar();
    }

    updateButtons() {
        const dealBtn = document.getElementById('deal-btn');
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        const doubleBtn = document.getElementById('double-btn');

        if (this.gameInProgress) {
            dealBtn.disabled = true;
            hitBtn.disabled = false;
            standBtn.disabled = false;
            doubleBtn.disabled = this.playerHand.length !== 2 || this.currentBet * 2 > this.bankroll;
        } else {
            dealBtn.disabled = false;
            hitBtn.disabled = true;
            standBtn.disabled = true;
            doubleBtn.disabled = true;
        }
    }

    // ========================================
    // SISTEMA DE APUESTAS
    // ========================================

    adjustBet(amount) {
        const betInput = document.getElementById('bet-amount');
        let newBet = parseInt(betInput.value) + amount;

        newBet = Math.max(1, Math.min(newBet, this.bankroll));
        betInput.value = newBet;

        this.playSound('click');
    }

    setBetMax() {
        document.getElementById('bet-amount').value = Math.floor(this.bankroll);
        this.playSound('click');
    }

    // ========================================
    // ESTADÍSTICAS
    // ========================================

    showStats() {
        const modal = document.getElementById('stats-modal');
        const content = document.getElementById('stats-content');

        const winRate = this.totalHands > 0
            ? ((this.totalWins / this.totalHands) * 100).toFixed(1)
            : 0;

        content.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-icon">🎮</div>
                <div class="stat-card-value">${this.totalHands}</div>
                <div class="stat-card-label">Manos Jugadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">✅</div>
                <div class="stat-card-value">${this.totalWins}</div>
                <div class="stat-card-label">Victorias</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">❌</div>
                <div class="stat-card-value">${this.totalLosses}</div>
                <div class="stat-card-label">Derrotas</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">🤝</div>
                <div class="stat-card-value">${this.totalPushes}</div>
                <div class="stat-card-label">Empates</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">♠️</div>
                <div class="stat-card-value">${this.totalBlackjacks}</div>
                <div class="stat-card-label">Blackjacks</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">📈</div>
                <div class="stat-card-value">${winRate}%</div>
                <div class="stat-card-label">Tasa de Victoria</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">💰</div>
                <div class="stat-card-value">${Math.floor(this.highestBankroll)}</div>
                <div class="stat-card-label">Mayor Bankroll</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">💎</div>
                <div class="stat-card-value">${Math.floor(this.biggestWin)}</div>
                <div class="stat-card-label">Mayor Ganancia</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">🔥</div>
                <div class="stat-card-value">${this.winStreak}</div>
                <div class="stat-card-label">Mejor Racha</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">⚡</div>
                <div class="stat-card-value">${this.currentStreak}</div>
                <div class="stat-card-label">Racha Actual</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">⭐</div>
                <div class="stat-card-value">${this.level}</div>
                <div class="stat-card-label">Nivel</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon">🏆</div>
                <div class="stat-card-value">${this.achievements.filter(a => a.unlocked).length}/${this.achievements.length}</div>
                <div class="stat-card-label">Logros</div>
            </div>
        `;

        modal.style.display = 'block';
    }

    // ========================================
    // UTILIDADES
    // ========================================

    toggleTheme() {
        const themes = ['default', 'dark', 'neon'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];

        // Verificar si está desbloqueado
        if (nextTheme === 'dark' && !this.unlockables.find(u => u.id === 'theme_dark' && u.unlocked)) {
            this.showNotification('Tema oscuro bloqueado. Desbloquéalo en la tienda.', 'info');
            return;
        }

        if (nextTheme === 'neon' && !this.unlockables.find(u => u.id === 'theme_neon' && u.unlocked)) {
            this.showNotification('Tema neón bloqueado. Desbloquéalo en la tienda.', 'info');
            return;
        }

        this.currentTheme = nextTheme;
        this.applyTheme(nextTheme === 'dark' ? 'theme_dark' : nextTheme === 'neon' ? 'theme_neon' : 'default');
        this.playSound('click');
        this.saveGame();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = document.getElementById('sound-icon');
        icon.textContent = this.soundEnabled ? '🔊' : '🔇';
        this.playSound('click');
        this.saveGame();
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // ========================================
    // SISTEMA DE GUARDADO
    // ========================================

    saveGame() {
        const saveData = {
            bankroll: this.bankroll,
            level: this.level,
            xp: this.xp,
            xpNeeded: this.xpNeeded,
            totalWins: this.totalWins,
            totalLosses: this.totalLosses,
            totalPushes: this.totalPushes,
            totalBlackjacks: this.totalBlackjacks,
            totalHands: this.totalHands,
            highestBankroll: this.highestBankroll,
            biggestWin: this.biggestWin,
            winStreak: this.winStreak,
            currentStreak: this.currentStreak,
            achievements: this.achievements,
            unlockables: this.unlockables,
            soundEnabled: this.soundEnabled,
            currentTheme: this.currentTheme
        };

        localStorage.setItem('blackjackSave', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('blackjackSave');

        if (saveData) {
            try {
                const data = JSON.parse(saveData);

                this.bankroll = data.bankroll || 1000;
                this.level = data.level || 1;
                this.xp = data.xp || 0;
                this.xpNeeded = data.xpNeeded || 100;
                this.totalWins = data.totalWins || 0;
                this.totalLosses = data.totalLosses || 0;
                this.totalPushes = data.totalPushes || 0;
                this.totalBlackjacks = data.totalBlackjacks || 0;
                this.totalHands = data.totalHands || 0;
                this.highestBankroll = data.highestBankroll || 1000;
                this.biggestWin = data.biggestWin || 0;
                this.winStreak = data.winStreak || 0;
                this.currentStreak = data.currentStreak || 0;
                this.soundEnabled = data.soundEnabled !== false;
                this.currentTheme = data.currentTheme || 'default';

                // Restaurar logros y desbloqueables
                if (data.achievements) {
                    data.achievements.forEach((savedAch, index) => {
                        if (this.achievements[index]) {
                            this.achievements[index].unlocked = savedAch.unlocked;
                        }
                    });
                }

                if (data.unlockables) {
                    data.unlockables.forEach((savedUnlock, index) => {
                        if (this.unlockables[index]) {
                            this.unlockables[index].unlocked = savedUnlock.unlocked;
                        }
                    });
                }

                // Aplicar tema guardado
                this.applyTheme(this.currentTheme === 'dark' ? 'theme_dark' : this.currentTheme === 'neon' ? 'theme_neon' : 'default');

                // Actualizar icono de sonido
                const icon = document.getElementById('sound-icon');
                if (icon) icon.textContent = this.soundEnabled ? '🔊' : '🔇';

            } catch (e) {
                console.error('Error loading save:', e);
            }
        }
    }

    resetGame() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso?')) {
            localStorage.removeItem('blackjackSave');
            location.reload();
        }
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new BlackjackGame();

    // Cerrar modales al hacer clic fuera
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !game.gameInProgress) {
            game.deal();
        } else if (e.key === ' ' && game.gameInProgress) {
            e.preventDefault();
            game.hit();
        } else if (e.key === 's' && game.gameInProgress) {
            game.stand();
        } else if (e.key === 'd' && game.gameInProgress) {
            game.double();
        }
    });
});

// Guardar automáticamente antes de cerrar
window.addEventListener('beforeunload', () => {
    if (game) {
        game.saveGame();
    }
});
