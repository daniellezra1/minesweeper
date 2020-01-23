'use strict'

// Global Variables:

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    minesLeft: 0,
    level: {
        height: 0,
        width: 0,
        mines: 0
    },
    bestScore: { 'Easy': '99:99', 'Hard': '99:99', 'Extreme': '99:99', 'Custom': '99:99' }
}

var gMines = []
var gBoard = []

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
var firstClick = true
var hints = 3
var hintOn = false
var safeClicks = 3
var lives = 3

// Functions:

function initGame(height = gGame.level.height, width = gGame.level.width, minesNum = gGame.level.mines) {
    document.querySelector('.modal-game-over').hidden = true
    document.querySelector('.modal-victorious').hidden = true
    firstClick = true
    gGame.isOn = true
    gGame.level.mines = minesNum
    gGame.level.height = height
    gGame.level.width = width
    getbestScore()
    gMines = []
    gMines = createMines(minesNum, height, width)
    gBoard = createBoard(height, width)
    hints = 3
    hintOn = false
    document.querySelector('span.hints-count').innerText = `(${hints})`
    safeClicks = 3
    document.querySelector('span.safe-clicks-count').innerText = `(${safeClicks})`
    lives = 3
    document.querySelector('.lives-count b').innerText = '❤️❤️❤️'
    renderBoard(gBoard)
    setMines()
    setMinesNegsCount()
    pauseTime()
    gGame.minesLeft = minesNum
    document.querySelector('.mines-left-counter b').innerText = gGame.minesLeft
}

function cellClicked(event, i, j) {
    if (event.button === 0 || event.button === 1) {
        if (firstClick) {
            gTimeInterval = setInterval(displayTime, 1000)
            firstClick = false
            while (gBoard[i][j].value === MINE) {
                gBoard = []
                gMines = []
                gMines = createMines(gGame.level.mines, gGame.level.height, gGame.level.width)
                gBoard = createBoard(gGame.level.height, gGame.level.width)
                renderBoard(gBoard)
                setMines()
                setMinesNegsCount()
            }
            checkCell(i, j)
            return
        } else {
            checkCell(i, j)
        }
    } else if (event.button === 2) {
        if (firstClick) {
            gTimeInterval = setInterval(displayTime, 1000)
            firstClick = false
        }
        markedCell(i, j)
    }
}

function checkCell(i, j) {
    if (gBoard[i][j].isMarked) return
    if (!gGame.isOn) return

    var location = { i: i, j: j }

    if (hintOn) {
        revealCellsHint(gBoard, i, j)
        hintOn = false
    } else {

        gGame.shownCount++
        if (gBoard[i][j].isMine) {

            if (lives > 0) {
                useLive()
                document.querySelector('.mines-left-counter b').innerText = --gGame.minesLeft
                gBoard[i][j].isMarked = true
                gBoard[i][j].isShown = true
                renderCellVisible(location, gBoard[i][j].value)
                checkVictory()
            } else {
                gBoard[i][j].isShown = true
                for (var d = 0; d < gMines.length; d++) {
                    renderCellVisible(gMines[d].location, MINE)
                }
                gGame.isOn = false
                document.querySelector('.modal-game-over').hidden = false
                document.querySelector('.smiley').innerText = '😥'
                clearInterval(gTimeInterval)
            }

        } else if (typeof (gBoard[i][j]).value === 'number') {
            gBoard[i][j].isShown = true
            renderCellVisible(location, gBoard[i][j].value)
            checkVictory()
        } else {
            expandShown(gBoard, i, j)
            checkVictory()
        }

    }
}

function markedCell(i, j) {
    var minLeftCounter = document.querySelector('.mines-left-counter b')
    var location = { i: i, j: j }
    if (gBoard[i][j].isShown) return
    if (!gBoard[i][j].isMarked) {
        if (gBoard[i][j].value === EMPTY) {
            renderCellVisible(location, FLAG)
            gGame.markedCount++
            minLeftCounter.innerText = --gGame.minesLeft
            gBoard[i][j].isMarked = true
        }
        if (gBoard[i][j].value === MINE) {
            renderCellVisible(location, FLAG)
            gGame.markedCount++
            gBoard[i][j].isMarked = true
            minLeftCounter.innerText = --gGame.minesLeft
            checkVictory()
        }
        if (typeof (gBoard[i][j]).value === 'number') {
            renderCellVisible(location, FLAG)
            gGame.markedCount++
            gBoard[i][j].isMarked = true
            minLeftCounter.innerText = --gGame.minesLeft
        }
    } else {
        if (gBoard[i][j].value === EMPTY) {
            renderCellHidden(location, EMPTY)
            gGame.markedCount--
            gBoard[i][j].isMarked = false
            minLeftCounter.innerText = ++gGame.minesLeft
        }
        if (gBoard[i][j].value === MINE) {
            renderCellHidden(location, MINE)
            gGame.markedCount--
            gBoard[i][j].isMarked = false
            minLeftCounter.innerText = ++gGame.minesLeft
        }
        if (typeof (gBoard[i][j]).value === 'number') {
            renderCellHidden(location, gBoard[i][j].value)
            gGame.markedCount--
            gBoard[i][j].isMarked = false
            minLeftCounter.innerText = ++gGame.minesLeft
        }
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].value === EMPTY) {
                var minesAround = countMinesAround(gBoard, i, j)
                if (minesAround > 0) {
                    gBoard[i][j].value = minesAround
                    gBoard[i][j].minesAroundCount = minesAround
                    var location = { i: i, j: j }
                    renderCellHidden(location, minesAround)
                }
            }
        }
    }
}

function countMinesAround(gBoard, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (gBoard[i][j].value === MINE) count++;
        }
    }
    return count;
}

function setMines() {
    for (var i = 0; i < gMines.length; i++) {
        gBoard[gMines[i].location.i][gMines[i].location.j].value = MINE
        gBoard[gMines[i].location.i][gMines[i].location.j].isMine = true
        renderCellHidden(gMines[i].location, MINE)
    }
}

function createMines(num, height, width) {
    var id = 1
    for (var i = 0; i < num; i++) {
        var mine = createMine(id++, height, width)
        gMines.push(mine)
    }
    return gMines
}

function createMine(id, height, width) {
    var i = getRandomInt(0, height)
    var j = getRandomInt(0, width)
    var mine = {
        id: id,
        location: { i: i, j: j },
    }
    return mine
}

function checkVictory() {
    var victory = true
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine === true && gBoard[i][j].isMarked === false) {
                victory = false
            } else if (gBoard[i][j].isMine === false && gBoard[i][j].isShown === false) {
                victory = false
            }
        }
    }
    if (victory) {
        gGame.isOn = false
        clearInterval(gTimeInterval)
        setbestScore()
        document.querySelector('.modal-victorious').hidden = false
        document.querySelector('.smiley').innerText = '😎'
    }
}

function customGame() {
    var height = +prompt('Choose the height')
    var width = +prompt('Choose the width')
    var minesNum = +prompt('Choose the mines number')
    initGame(height, width, minesNum)
}

function getHint() {
    if (!gGame.isOn) {
        return
    }
    if (hints > 0) {
        hintOn = true
        hints--
        document.querySelector('span.hints-count').innerText = `(${hints})`
    }
}

function revealCellsHint(gBoard, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;

            var location = { i: i, j: j }
            renderCellVisible(location, gBoard[i][j].value)
        }
    }
    setTimeout(function () {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j >= gBoard[0].length) continue;
                if (!gBoard[i][j].isShown) {
                    location = { i: i, j: j }
                    renderCellHidden(location, gBoard[i][j].value)
                }
            }
        }
    }, 1000)
}

function getSafeClick() {
    if (!gGame.isOn) {
        return
    }
    if (firstClick) {
        gTimeInterval = setInterval(displayTime, 1000)
        firstClick = false
    }
    if (safeClicks > 0) {
        var i = getRandomInt(0, gGame.level.height)
        var j = getRandomInt(0, gGame.level.width)
        if (!gBoard[i][j].isShown && !gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
            var location = { i: i, j: j }
            renderCellVisible(location, gBoard[i][j].value)
            safeClicks--
            document.querySelector('span.safe-clicks-count').innerText = `(${safeClicks})`
            setTimeout(function () { renderCellHidden(location, gBoard[i][j].value) }, 1000)
        } else {
            getSafeClick()
        }

    }
}

function useLive() {
    if (lives === 3) {
        lives--
        document.querySelector('.lives-count b').innerText = '❤️❤️'
    } else if (lives === 2) {
        lives--
        document.querySelector('.lives-count b').innerText = '❤️'
    } else if (lives === 1) {
        lives--
        document.querySelector('.lives-count b').innerText = '0'
    }
}

function expandShown(gBoard, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (gBoard[i][j].isShown === true) continue
            if (i === rowIdx && j === colIdx) {
                var location = { i: i, j: j }
                gBoard[i][j].isShown = true
                renderCellVisible(location, gBoard[i][j].value)
            } else if (typeof (gBoard[i][j]).value === 'number') {
                var location = { i: i, j: j }
                gBoard[i][j].isShown = true
                renderCellVisible(location, gBoard[i][j].value)
            } else {
                expandShown(gBoard, i, j)
            }

        }

    }
}