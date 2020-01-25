'use strict'

// Global Variables:

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: '00:00',
    minesLeft: 0,
    level: {
        height: 0,
        width: 0,
        mines: 0
    },
    bestScore: { 'Easy': '99:99', 'Hard': '99:99', 'Extreme': '99:99', 'Custom': '99:99' }
}

var gBoard = []
var gMines = []
var gMoves = []

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
const LIVE = '❤️'

var firstClick = true
var hints = 3
var hintOn = false
var safeClicks = 3
var lives = 3

// el Variables:

var elMinLeftCounter = document.querySelector('.mines-left-counter b')
var elModalGameOver = document.querySelector('.modal-game-over')
var elModalVictorious = document.querySelector('.modal-victorious')
var elHintsCount = document.querySelector('span.hints-count')
var elLivesCounter = document.querySelector('.lives-count b')
var elSafeClickCounter = document.querySelector('span.safe-clicks-count')

// Functions:

function initGame() {
    restart(4, 4, 2)
    getbestScore()
}

function restart(height = gGame.level.height, width = gGame.level.width, minesNum = gGame.level.mines) {
    reset()
    gGame.isOn = true
    gGame.level.mines = minesNum
    gGame.level.height = height
    gGame.level.width = width
    gGame.minesLeft = minesNum
    elMinLeftCounter.innerText = gGame.minesLeft
    gBoard = createBoard(height, width)
    renderBoard(gBoard)
    createMines(minesNum, height, width)
    setMinesNegsCount()
    getbestScore()
}

function reset() {
    elModalGameOver.hidden = true
    elModalVictorious.hidden = true
    gMines = []
    gBoard = []
    gMoves = []
    firstClick = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = '00:00'
    hints = 3
    hintOn = false
    elHintsCount.innerText = `(${hints})`
    safeClicks = 3
    elSafeClickCounter.innerText = `(${safeClicks})`
    lives = 3
    elLivesCounter.innerText = LIVE + LIVE + LIVE
    pauseTime()
}

function createMines(num, height, width) {
    for (var i = 0; i < num; i++) {
        createMine(height, width)
    }
}

function createMine(height, width) {
    var i = getRandomInt(0, height)
    var j = getRandomInt(0, width)
    var cell = gBoard[i][j]
    if (cell.value === MINE) {
        createMine(height, width)
    } else {
        var mine = {
            location: { i: i, j: j },
        }
        cell.value = MINE
        cell.isMine = true
        renderCellHidden(mine.location, MINE)
        gMines.push(mine)
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.value === EMPTY) {
                var minesAround = countMinesAround(gBoard, i, j)
                if (minesAround > 0) {
                    cell.value = minesAround
                    cell.minesAroundCount = minesAround
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
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].value === MINE) count++
        }
    }
    return count
}

function cellClicked(event, i, j) {
    if (event.button === 0 || event.button === 1) {
        if (firstClick) {
            gTimeInterval = setInterval(displayTime, 1000)
            firstClick = false
            while (gBoard[i][j].value === MINE) {
                gBoard = []
                gMines = []
                gBoard = createBoard(gGame.level.height, gGame.level.width)
                renderBoard(gBoard)
                createMines(gGame.level.mines, gGame.level.height, gGame.level.width)
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

    var cell = gBoard[i][j]
    if (cell.isMarked) return
    if (!gGame.isOn) return
    var location = { i: i, j: j }

    if (hintOn) {
        revealCellsHint(gBoard, i, j)
        hintOn = false
    } else {

        if (cell.isMine) {

            if (lives > 0) {
                useLive()
                elMinLeftCounter.innerText = --gGame.minesLeft
                cell.isMarked = true
                cell.isShown = true
                renderCellVisible(location, LIVE)
                checkVictory()
            } else {
                cell.isShown = true
                for (var d = 0; d < gMines.length; d++) {
                    renderCellVisible(gMines[d].location, MINE)
                }
                gGame.isOn = false
                elModalGameOver.hidden = false
                document.querySelector('.smiley').innerText = '😥'
                clearInterval(gTimeInterval)
            }
            gMoves.push(location)

        } else if (typeof (cell.value) === 'number') {
            cell.isShown = true
            renderCellVisible(location, cell.value)
            gMoves.push(location)
            checkVictory()
        } else {
            expandShown(gBoard, i, j)
            checkVictory()
        }
    }
}

function markedCell(i, j) {
    var cell = gBoard[i][j]
    var location = { i: i, j: j }
    if (cell.isShown) return
    if (!cell.isMarked) {
        if (cell.value === EMPTY) {
            renderCellVisible(location, FLAG)
            gGame.markedCount++
            elMinLeftCounter.innerText = --gGame.minesLeft
            cell.isMarked = true
        }
        if (cell.value === MINE) {
            renderCellVisible(location, FLAG)
            gGame.markedCount++
            cell.isMarked = true
            elMinLeftCounter.innerText = --gGame.minesLeft
            checkVictory()
        }
        if (typeof (cell.value) === 'number') {
            renderCellVisible(location, FLAG)
            gGame.markedCount++
            cell.isMarked = true
            elMinLeftCounter.innerText = --gGame.minesLeft
        }
    } else {
        if (cell.value === EMPTY) {
            renderCellHidden(location, EMPTY)
            gGame.markedCount--
            cell.isMarked = false
            elMinLeftCounter.innerText = ++gGame.minesLeft
        }
        if (cell.value === MINE) {
            renderCellHidden(location, MINE)
            gGame.markedCount--
            cell.isMarked = false
            elMinLeftCounter.innerText = ++gGame.minesLeft
        }
        if (typeof (cell.value) === 'number') {
            renderCellHidden(location, cell.value)
            gGame.markedCount--
            cell.isMarked = false
            elMinLeftCounter.innerText = ++gGame.minesLeft
        }
    }
    gMoves.push(location)
}

function getHint() {
    if (!gGame.isOn) {
        return
    }
    if (hints > 0) {
        hintOn = true
        hints--
        elHintsCount.innerText = `(${hints})`
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
        var cell = gBoard[i][j]
        if (!cell.isShown && !cell.isMine && !cell.isMarked) {
            var location = { i: i, j: j }
            renderCellVisible(location, cell.value)
            safeClicks--
            elSafeClickCounter.innerText = `(${safeClicks})`
            setTimeout(function () { renderCellHidden(location, cell.value) }, 1000)
        } else {
            getSafeClick()
        }

    }
}

function useLive() {
    if (lives === 3) {
        lives--
        elLivesCounter.innerText = LIVE + LIVE
    } else if (lives === 2) {
        lives--
        elLivesCounter.innerText = LIVE
    } else if (lives === 1) {
        lives--
        elLivesCounter.innerText = '0'
    }
}

function expandShown(gBoard, rowIdx, colIdx) {
    var locations = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var cell = gBoard[i][j]
            if (j < 0 || j >= gBoard[0].length) continue
            if (cell.isShown) continue
            if ((i === rowIdx && j === colIdx) || (typeof (cell.value) === 'number')) {
                var location = { i: i, j: j }
                cell.isShown = true
                renderCellVisible(location, cell.value)
                locations.push(location)
            } else {
                expandShown(gBoard, i, j)
            }
        }
    }
    gMoves.push(...locations)
}

function checkVictory() {
    var victory = true
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine && !cell.isMarked) {
                victory = false
            } else if (!cell.isMine && !cell.isShown) {
                victory = false
            }
        }
    }
    if (victory) {
        gGame.isOn = false
        gGame.shownCount = shownCount()
        clearInterval(gTimeInterval)
        setbestScore()
        elModalVictorious.hidden = false
        document.querySelector('.smiley').innerText = '😎'
    }
}

function customGame() {
    var height = +prompt('Choose the height')
    var width = +prompt('Choose the width')
    var minesNum = +prompt('Choose the mines number')
    restart(height, width, minesNum)
}

function undoClicked() {
    if (gMoves.length === 0) return
    var lastMove = gMoves[gMoves.length - 1]
    var cell = gBoard[lastMove.i][lastMove.j]
    if (cell.isMine && cell.isShown) {
        if (cell.isMarked) {
            cell.isMarked = false
            cell.isShown = false
            lives++
            elMinLeftCounter.innerText = ++gGame.minesLeft
            if (elLivesCounter.innerText === '0') {
                elLivesCounter.innerText = ''
            }
            elLivesCounter.innerText += LIVE
            renderCellHidden(lastMove, cell.value)
            shownCount()
            gMoves.pop()
        } else {
            cell.isShown = false
            for (var d = 0; d < gMines.length; d++) {
                renderCellHidden(gMines[d].location, MINE)
            }
            gGame.isOn = true
            document.querySelector('.smiley').innerText = '😃'
            elModalGameOver.hidden = true
            gTimeInterval = setInterval(displayTime, 1000)
            gMoves.pop()
        }
    } else if (cell.isMarked || (!cell.isShown && !cell.isMarked)) {
        markedCell(lastMove.i, lastMove.j)
        gMoves.pop()
        gMoves.pop()
    } else if (cell.isShown) {
        cell.isShown = false
        renderCellHidden(lastMove, cell.value)
        shownCount()
        gMoves.pop()
    }
}