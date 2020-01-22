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
    }
}

var gMines = []
var gBoard = []

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
var firstClick = true

// Functions:

function initGame(height = gGame.level.height, width = gGame.level.width, minesNum = gGame.level.mines) {
    document.querySelector('.modal-game-over').hidden = true
    document.querySelector('.modal-victorious').hidden = true
    firstClick = true
    gGame.isOn = true
    gGame.level.mines = minesNum
    gGame.level.height = height
    gGame.level.width = width
    gMines = []
    gMines = createMines(minesNum, height, width)
    gBoard = createBoard(height, width)
    renderBoard(gBoard)
    setMines()
    setMinesNegsCount()
    gGame.minesLeft = minesNum
    document.querySelector('.mines-left-counter b').innerText = gGame.minesLeft
}

function cellClicked(event, i, j) {
    if (event.button === 0 || event.button === 1) {
        if (firstClick) {
            while (gBoard[i][j].value === MINE) {
                gBoard = []
                gMines = []
                gMines = createMines(gGame.level.mines, gGame.level.height, gGame.level.width)
                gBoard = createBoard(gGame.level.height, gGame.level.width)
                renderBoard(gBoard)
                setMines()
                setMinesNegsCount()
            }
            firstClick = false
            checkCell(i, j)
            return
        } else {
            checkCell(i, j)
        }
    } else if (event.button === 2) {
        markedCell(i, j)
    }
}

function checkCell(i, j) {
    if (gBoard[i][j].isMarked) return
    if (!gGame.isOn) return

    var location = { i: i, j: j }
    gGame.shownCount++
    if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true
        for (var d = 0; d < gMines.length; d++) {
            renderCellVisible(gMines[d].location, MINE)
        }
        gGame.isOn = false
        document.querySelector('.modal-game-over').hidden = false
        document.querySelector('.smiley').innerText = '😥'
        console.log('Game over')
    } else if (typeof (gBoard[i][j]).value === 'number') {
        gBoard[i][j].isShown = true
        renderCellVisible(location, gBoard[i][j].value)
        checkVictory()
    } else {
        expandShown(gBoard, i, j)
        gBoard[i][j].isShown = true
        renderCellVisible(location, gBoard[i][j].value)
        checkVictory()
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
        isCover: false,
        isExplode: false
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
        document.querySelector('.modal-victorious').hidden = false
        document.querySelector('.smiley').innerText = '😎'
        console.log('WINNER')
    }
}



// expandShown functions:

function expandShown(gBoard, rowIdx, colIdx) {
    var newRowIdx = []
    var newColIdx = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var location = { i: i, j: j }
            gBoard[i][j].isShown = true
            renderCellVisible(location, gBoard[i][j].value)
            if (gBoard[i][j].value === EMPTY) {
                newRowIdx.push(i)
                newColIdx.push(j)
            }
        }
    }
    console.log(newRowIdx)
    console.log(newColIdx)

    for (var i = 0; i < newRowIdx.length; i++) {
        expandShown(gBoard, newRowIdx[i], newColIdx[i])
    }
    checkVictory()
}

function expandShown(gBoard, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var location = { i: i, j: j }
            gBoard[i][j].isShown = true
            renderCellVisible(location, gBoard[i][j].value)
        }
    }
    checkVictory()
}