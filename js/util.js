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
    return board;
}

function renderBoard(board) {
    var strHTML = `<p class="smiley" onclick="initGame()">😃</p><table border="0"><tbody>`
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

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}