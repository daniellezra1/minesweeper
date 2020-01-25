'use strict'

function createBoard(height, width) {
    var board = [];
    for (var i = 0; i < height; i++) {
        board.push([]);
        for (var j = 0; j < width; j++) {
            board[i][j] = {
                value: EMPTY,
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = `<p class="smiley" onclick="restart()">😃</p><table border="0"><tbody>`
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j].value
            var className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onmousedown="cellClicked(event, ${i}, ${j})"><span hidden>${cell}</span></td>`
        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`
    var elGameBoard = document.querySelector('.game-board')
    elGameBoard.innerHTML = strHTML
}

function renderCellVisible(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = `<span visible>${value}</span>`
    elCell.classList.add("visible")
    elCell.classList.remove("hidden")
}

function renderCellHidden(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = `<span hidden>${value}</span>`
    elCell.classList.add("hidden")
    elCell.classList.remove("visible")
}

var darkMode = false

function setMode(elBtn) {
    if (!darkMode) {
        elBtn.innerText = 'Light Mode'
        darkMode = true
    } else {
        elBtn.innerText = 'Dark Mode'
        darkMode = false
    }
    document.querySelector('body').classList.toggle('dark-mode')
}

var gTimeInterval = null
var seconds = 0
var minutes = 0
var newSeconds = 0
var newMinutes = 0
var elStopwatch = document.querySelector('.stopwatch b')

function displayTime() {
    seconds++
    newSeconds = (seconds < 10) ? '0' + seconds.toString() : seconds
    newMinutes = (minutes < 10) ? '0' + minutes.toString() : minutes
    if (seconds / 60 === 1) {
        seconds = 0
        minutes++
    }
    gGame.secsPassed = `${newMinutes}:${newSeconds}`
    elStopwatch.innerText = `${newMinutes}:${newSeconds}`
    gGame.shownCount = shownCount()
}

function pauseTime() {
    clearInterval(gTimeInterval)
    gTimeInterval = null
    seconds = 0
    minutes = 0
    newSeconds = 0
    newMinutes = 0
    elStopwatch.innerText = '00:00'
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

function shownCount() {
    var count = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown) count++
        }
    }
    return count
}

// Retrieve the object from storage
function getbestScore() {
    if (!localStorage.getItem('bestScore')) {
        localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
    } else {
        var retrievedObject = localStorage.getItem('bestScore')
        var bestScore = JSON.parse(retrievedObject)
        var levelBestTime = document.querySelector('.best-score b')
        if (gGame.level.height === 4 && gGame.level.width === 4) {
            if (bestScore.Easy === '99:99') {
                levelBestTime.innerText = '----'
            } else {
                levelBestTime.innerText = bestScore.Easy
                gGame.bestScore.Easy = bestScore.Easy
            }
        } else if (gGame.level.height === 8 && gGame.level.width === 8) {
            if (bestScore.Hard === '99:99') {
                levelBestTime.innerText = '----'
            } else {
                levelBestTime.innerText = bestScore.Hard
                gGame.bestScore.Hard = bestScore.Hard
            }
        } else if (gGame.level.height === 12 && gGame.level.width === 12) {
            if (bestScore.Extreme === '99:99') {
                levelBestTime.innerText = '----'
            } else {
                levelBestTime.innerText = bestScore.Extreme
                gGame.bestScore.Extreme = bestScore.Extreme
            }
        } else {
            if (bestScore.Custom === '99:99') {
                levelBestTime.innerText = '----'
            } else {
                levelBestTime.innerText = bestScore.Custom
                gGame.bestScore.Custom = bestScore.Custom
            }
        }
    }
}

// Put the object into storage
function setbestScore() {
    var retrievedObject = localStorage.getItem('bestScore')
    var bestScore = JSON.parse(retrievedObject)

    if (gGame.level.height === 4 && gGame.level.width === 4) {
        if (minutes < +bestScore.Easy.split(':')[0]) {
            gGame.bestScore.Easy = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        } else if ((minutes === +bestScore.Easy.split(':')[0]) && (seconds <= +bestScore.Easy.split(':')[1])) {
            gGame.bestScore.Easy = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        }
    } else if (gGame.level.height === 8 && gGame.level.width === 8) {
        if (minutes < +bestScore.Hard.split(':')[0]) {
            gGame.bestScore.Hard = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        } else if ((minutes === +bestScore.Hard.split(':')[0]) && (seconds <= +bestScore.Hard.split(':')[1])) {
            gGame.bestScore.Hard = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        }
    } else if (gGame.level.height === 12 && gGame.level.width === 12) {
        if (minutes < +bestScore.Extreme.split(':')[0]) {
            gGame.bestScore.Extreme = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        } else if ((minutes === +bestScore.Extreme.split(':')[0]) && (seconds <= +bestScore.Extreme.split(':')[1])) {
            gGame.bestScore.Extreme = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        }
    } else {
        if (minutes < +bestScore.Custom.split(':')[0]) {
            gGame.bestScore.Custom = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        } else if ((minutes === +bestScore.Custom.split(':')[0]) && (seconds <= +bestScore.Custom.split(':')[1])) {
            gGame.bestScore.Custom = `${minutes}:${seconds}`
            localStorage.setItem('bestScore', JSON.stringify(gGame.bestScore))
        }
    }
}