/**
 * This is a TypeScript file that contains utility functions and object generation.
 *
 * @fileOverview
 * @module util
 *
 * @description
 * Contains utility variables, utility functions and object generation functions.
 *
 * @author
 * Nisha Shaline Kannapper [31121993]
 *
 * @version
 * Assignment submission version
 */

import { Block, TetType, TetBlueprint, Tet, tetArray, State, Board, difficultyScore } from "./types";
import { tetO, tetI, tetJ, tetL, tetS, tetT, tetZ } from "./types";
import { Instruction } from "./types";
import { clearCanvas, removePieceFromCanvas, renderRow, svg, level1Music, freezeSound, rowClearSound, gameOverSound, calmMusic, calmFreezeSound, level2Music, level3Music, level4Music } from "./view";

/** Constants */

export const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
} as const;

export const Constants = {
    TICK_RATE_0_MS: 600,
    TICK_RATE_1_MS: 500,
    TICK_RATE_2_MS: 400,
    TICK_RATE_3_MS: 300,
    TICK_RATE_4_MS: 200,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
    PREVIEW_WIDTH: 7,
    PREVIEW_HEIGHT: 4,
} as const;

export const BlockSize = {
WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

export const placeholder: Block = {x: 0, y: 0, cssStyle: "", id: -5}

/**
 * Generates a number from 0 to 6.
 * @returns integer in range 0 to 6 (inclusive)
 */
const generateRandomNum_0_6 = (): number => {
    return Math.floor(Math.random() * 7);
    
}

/**
 * Generates a number from 0 to 1.
 * @returns integer in range 0 to 1 (inclusive)
 */
const generateRandomNum_0_1 = (): number => {
    return Math.floor(Math.random() * 2);
    
}

/** Generation functions for game items */

const generateTetType = (zen: boolean): TetType => {
    if (zen) { return tetArray[generateRandomNum_0_1()]; }
    else { return tetArray[generateRandomNum_0_6()]; }
}

/**
 * Generate a Block type object
 * @param x column of block
 * @param y row of block
 * @param css type of block
 * @param id block id
 * @returns Block
 */
const genBlock = (x: number, y: number, css: TetType, id: number): Block => {
    return {x: x, y: y, cssStyle: css, id: id}
}

/**
 * Curried function used to build functions that return Tet type objects
 * @param rotIndex rotation index, used to specify which way tet is facing
 * @returns Tet
 */
const genTet = 
    (rotIndex: number) => 
    (midR: number, centC: number) => 
    (type: TetType, id: number): Tet =>
    
    {
        const typeBlueprint: TetBlueprint =
            type == TetType.O
                ? tetO
            : type == TetType.I
                ? tetI
            : type == TetType.S
                ? tetS
            : type == TetType.Z
                ? tetZ
            : type == TetType.L
                ? tetL
            : type == TetType.J
                ? tetJ
            : tetT

        const blueprint: Tet = 
            rotIndex == 1 
                ? typeBlueprint[1]
            : rotIndex == 2
                        ? typeBlueprint[2]
            : rotIndex == 3
                ? typeBlueprint[3]
            : typeBlueprint[4] 
        
        const blocks: Block[] = blueprint.blocks
        const midRow = midR + blueprint.midRow
        const centCol = centC + blueprint.centCol
            
        return {

            type: blueprint.type, rotation: blueprint.rotation,
            midRow: midRow, centCol: centCol,

            topRow: midRow + blueprint.topRow,
            botRow: midRow + blueprint.botRow,
            leftCol: centCol + blueprint.leftCol,
            rightCol: centCol + blueprint.rightCol,

            blocks: [
                genBlock(
                    blocks[0].x + centCol, blocks[0].y + midRow,
                    type, blocks[0].id + id),
                genBlock(
                    blocks[1].x + centCol, blocks[1].y + midRow, 
                    type, blocks[1].id + id),
                genBlock(
                    blocks[2].x + centCol, blocks[2].y + midRow, 
                    type, blocks[2].id + id),
                genBlock(
                    blocks[3].x + centCol, blocks[3].y + midRow, 
                    type, blocks[3].id + id)
            ]
            
        }
}

/**
 * Function used to generate a Tet object at the top of the grid at the 
 * beginning of a round.
 * @param id used to give Tet blocks ids
 * @returns Tet
 */
export const genNewTet 
    = (id: number, zen: boolean = false): Tet => 
        genTet(1)(0, Math.floor(Constants.GRID_WIDTH/2)-1)(generateTetType(zen), id)

/**
 * Function used to generate a Tet object for the preview section 
 * at the beginning of a round.
 * @param type type of Tet generated
 * @returns Tet
 */
export const genPreviewTet = (type: TetType): Tet => {
    // fixing rendering stuff
    const centCol = 
        type == 
            TetType.I || type == TetType.O ||
            type == TetType.J || type == TetType.T
                ? Math.floor(Constants.PREVIEW_WIDTH/2)
                : Math.floor(Constants.PREVIEW_WIDTH/2)+1

    return genTet(1)(Math.floor(Constants.PREVIEW_HEIGHT/2)-1, centCol)(type, -4)
}

/**
 * Generates a rotated or moved Tet object
 * @param tet original Tet to be rotated or moved
 * @param direction how Tet should be moved/rotated
 * @returns rotated/moved Tet
 */
export const genMovedTet = (tet: Tet, direction: Instruction): Tet => {
    
    if (direction == "rotate-left") {
        const rClockwise = tet.rotation == 1 ? 4 : tet.rotation - 1
        return genTet(
            rClockwise)(tet.midRow, tet.centCol)(tet.type, tet.blocks[0].id)

    } else if (direction == "rotate-right") {
        const rAntiClockwise = tet.rotation == 4 ? 1 : tet.rotation + 1
        return genTet(
            rAntiClockwise)(tet.midRow, tet.centCol)(tet.type, tet.blocks[0].id)
    
    } else if (direction == "left") {
        return genTet(
            tet.rotation)(tet.midRow, tet.centCol-1)(tet.type, tet.blocks[0].id)
    
    } else if (direction == "right") {
        return genTet(
            tet.rotation)(tet.midRow, tet.centCol+1)(tet.type, tet.blocks[0].id)
    
    } else if (direction == "up") {
        return genTet(
            tet.rotation)(tet.midRow-1, tet.centCol)(tet.type, tet.blocks[0].id)
    
    } else if (direction == "down" || direction == "tick0" ||
            direction == "tick1" || direction == "tick2" ||
            direction == "tick3" || direction == "tick4") {
        return genTet(
            tet.rotation)(tet.midRow+1, tet.centCol)(tet.type, tet.blocks[0].id)
    }

    return tet
}


/**
 * Generates function to alter a Board's grid 
 * @param block block to add to the grid
 * @returns Function that returns altered board
 */
const updateBoard 
    = (block: Block) => (b: Board, x: number, y: number): Board => {
        return {
            grid: b.grid.map(
                (row, rowIndex) => rowIndex == y ? row.map(
                    (elem, columnIndex) => columnIndex == x ? block : elem
                ) : row
            )
        }   
}

/**
 * Adds a tetromino to a Board
 * @param b board
 * @param t tetromino
 * @returns altered board
 */
const addTet = (b: Board, t: Tet): Board => {

    return t.blocks.reduce(
        (board, block) => {
            return updateBoard(block)(board, block.x, block.y)
        }, b
    )

}


/**
 * Generates a State object
 * @param gameStart 
 * @param gameEnd 
 * @param roundStart
 * @param frozen 
 * @param pause 
 * @param zenMode
 * @param boardState 
 * @param difficulty
 * @param score 
 * @param highscore
 * @param pieceCount 
 * @param currentTet 
 * @param nextTet 
 * @returns State
 */
const genState = (
    gameStart: boolean,
    gameEnd: boolean,
    roundStart: boolean,
    frozen: boolean,
    pause: boolean,
    zenMode: boolean,

    boardState: Board,
    difficulty: difficultyScore,
    score: number,
    highscore: number,
    pieceCount: number,

    currentTet: Tet,
    nextTet: Tet,

): State => {

    return {
        gameStart: gameStart,
        gameEnd: gameEnd,
        roundStart: roundStart,
        frozen: frozen,
        pause: pause,
        zenMode: zenMode,

        board: boardState,
        difficulty: difficulty,
        score: score,
        highscore: highscore,
        pieceCount: pieceCount,

        currentTet: currentTet,
        nextTet: nextTet,
    }
}

/**
 * Generates the initial game state
 * @param highscore current highscore
 * @returns intial game state
 */
export const genInitialState = (highscore: number = 0): State => {

    level1Music()

    const board: Board = { 
        grid: Array.from({ length: Constants.GRID_HEIGHT }, () =>
            Array.from({ length: Constants.GRID_WIDTH }, () => placeholder))
    } 

    return genState(
        true, false, true, false, false, false, 
        board, difficultyScore.d_1, 0, highscore, 8, 
        genNewTet(0), genNewTet(4))
}

/**
 * Restarts the game state
 * @param s the current game state
 * @returns restarted game state
 */
export const restartState = (s: State): State => {
    clearCanvas(s.currentTet, s.board)
    return genInitialState(s.highscore)
}

/**
 * Moves the current tetromino in the state according to provided instruction
 * @param s state
 * @param i instruction
 * @returns state with moved tetromino
 */
export const moveCurrentTet = (s: State, i: Instruction) => 
    genState(
        s.gameStart, s.gameEnd, s.roundStart, s.frozen, s.pause, s.zenMode,
        s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
        genMovedTet(s.currentTet,i), s.nextTet
        )


/**
 * Function to change pause attribute of a state
 * @param pause new pause value
 * @returns function
 */
const togglePause = (pause: boolean) => (s: State): State => genState(
    s.gameStart, s.gameEnd, s.roundStart, s.frozen, pause, s.zenMode, 
    s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
    s.currentTet, s.nextTet
    )

/**
 * Function to change frozen attribute of a state
 * @param frozen new frozen value
 * @returns function
 */
const toggleFrozen = (frozen: boolean) => (s: State): State => genState(
    s.gameStart, s.gameEnd, s.roundStart, frozen, s.pause, s.zenMode,
    s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
    s.currentTet, s.nextTet
    )

/**
 * Function to change frozen attribute of a state
 * @param frozen new frozen value
 * @returns function
 */
const toggleZen = (zen: boolean) => (s: State): State => genState(
    s.gameStart, s.gameEnd, s.roundStart, s.frozen, s.pause, zen,
    s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
    s.currentTet, s.nextTet
    )

/**
 * Changes game state to be "paused"
 * @param s game state
 * @returns paused game state
 */
export const pause = togglePause(true)

/**
 * Changes game state to be "unpaused"
 * @param s game state
 * @returns unpaused game state
 */
export const unpause = togglePause(false)

/**
 * Changes game state to be "frozen"
 * @param s game state
 * @returns frozen game state
 */
export const freeze = toggleFrozen(true)

/**
 * Changes game state to be "unfrozen"
 * @param s game state
 * @returns unfrozen game state
 */
export const unfreeze = toggleFrozen(false)

/**
 * Changes game state to be "zen"
 * @param s game state
 * @returns zen game state
 */
export const zenActive = (s: State) => {
    calmMusic()
    // updates both current and next Tetromino to be a "calm" block (I or O)
    const zenState 
        = genState(
            s.gameStart, s.gameEnd, s.roundStart, s.frozen, s.pause, s.zenMode,
            s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
            genNewTet(s.currentTet.blocks[0].id, true), 
            genNewTet(s.nextTet.blocks[0].id, true)
        )
    return toggleZen(true)(zenState)
}

/**
 * Changes game state to be not "zen"
 * @param s game state
 * @returns not zen game state
 */
export const zenInactive = (s: State) => {
    
    switch (s.difficulty) {
        case difficultyScore.d_1:
            level1Music()
            break;
        case difficultyScore.d_2:
            level2Music()
            break;
        case difficultyScore.d_3:
            level3Music()
            break;
        case difficultyScore.d_4:
            level4Music()
            break;
    }

    return toggleZen(false)(s)
}

/**
 * Updates game state to change gameStart attribute to false
 * @param s state
 * @returns updated state
 */
export const startGame = (s: State): State => genState(
    false, false, false, false, 
    false,  s.zenMode,
    s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
    s.currentTet, s.nextTet
    )

/**
 * Updates game state to change gameEnd attribute to true
 * @param s state
 * @returns updated state
 */
export const endGame = (s: State): State => {
    return genState(
        s.gameStart, true, s.roundStart, s.frozen, s.pause, s.zenMode,
        s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
        s.currentTet, s.nextTet
        )
}
    

/**
 * Updates game state to change roundStart attribute to true
 * @param s game state
 * @returns State
 */
export const newRound = (s: State): State => {
    // audio cue, indicates piece can no longer move
    if (s.zenMode) { calmFreezeSound(); }
    else { freezeSound(); }
    return genState(
        false, false, true, false, s.pause, s.zenMode, 
        s.board, s.difficulty, s.score, s.highscore, s.pieceCount, 
        s.currentTet, s.nextTet)
}

/**
 * If the round has just started, update the current Tet, 
 * generate the next Tet and update state accordingly
 * @param s state
 * @returns updated state
 */
export const startRound = (s: State): State => {
    const newNextTet = genNewTet(s.pieceCount, s.zenMode)
    const board = addTet(s.board, s.currentTet)

    const updatedState = 
        checkTopRowReached(board) 
            ? endGame(genState(
                s.gameStart, s.gameEnd, false, s.frozen, s.pause, s.zenMode,
                board, s.difficulty, s.score, 
                s.score > s.highscore ? s.score : s.highscore, s.pieceCount, 
                s.currentTet, s.nextTet))

        : checkOverlap(board, s.nextTet) 
            ? endGame(genState(
                s.gameStart, s.gameEnd, false, s.frozen, s.pause, s.zenMode,
                board, s.difficulty, s.score, 
                s.score > s.highscore ? s.score : s.highscore, s.pieceCount+4, 
                s.nextTet, newNextTet))

            :  genState(
                s.gameStart, false, false, s.frozen, s.pause, s.zenMode, 
                board, s.difficulty, s.score, s.highscore, s.pieceCount+4, 
                s.nextTet, newNextTet)

    return score(updatedState, checkFullRow(updatedState.board))

}


/**
 * Removes specified rows from a State's Board and updates score accordingly
 * @param s state
 * @param fullRows rows that are full
 * @returns updated state
 */
export const score = (s: State, fullRows: number[]): State => {
    
    if (fullRows.length == 0) { return s; }

    const newScore = fullRows.length + s.score
    const emptyRow 
        = Array.from({ length: Constants.GRID_WIDTH }, () => placeholder)


    // removes the specified rows
    const removedRowsBoard: Board = {
        grid: s.board.grid.map(
            (row, rowIndex) => { 
                row.map(
                    (block) => 
                        fullRows.includes(rowIndex) ?
                            removePieceFromCanvas(`${block.id}`, svg) : null
                )
                return fullRows.includes(rowIndex) ?
                    [...emptyRow] : row;
            }
        )
    }

    // move the rows above the removed rows down
    const updatedBoard: Board = fullRows.reduce(
        (board, fullRowIndex) => {
            return {grid: board.grid.reverse().map(
                (row, rowIndex, revGrid) => {
                    if (Math.abs(rowIndex-19) <= fullRowIndex) {
                        row.map(
                            (block) => 
                                removePieceFromCanvas(`${block.id}`, svg)
                        )
                        if (Math.abs(rowIndex-19) != 0) {
                            return revGrid[rowIndex+1].map(
                                (block) => 
                                    {return {
                                        x: block.x, y: block.y+1, 
                                        cssStyle: block.cssStyle, id: block.id
                                    } as Block}
                        )}
                    }
                    return row
                }
            ).reverse()} as Board
        }, removedRowsBoard
    )

    // render all the moved rows
    updatedBoard.grid.map(
        (row) => renderRow(row)
    )

    if (s.zenMode) { calmFreezeSound(); }
    else { rowClearSound(); }

    return genState(
        s.gameStart, s.gameEnd, s.roundStart, s.frozen, s.pause, s.zenMode, 
        updatedBoard, calculateDifficulty(newScore), newScore, 
        s.highscore, s.pieceCount, 
        s.currentTet, s.nextTet
        )



}

/**
 * Calculates the game difficulty based on score
 * @param score given score
 * @returns calculated difficulty
 */
const calculateDifficulty = (score: number): difficultyScore => {
    return (score >= difficultyScore.d_4) 
        ? difficultyScore.d_4
    : (score >= difficultyScore.d_3) 
        ? difficultyScore.d_3
    : (score >= difficultyScore.d_2)
        ? difficultyScore.d_2
        : difficultyScore.d_1;

}





/** CHECKS */

/**
 * Checks if the currently moving tetromino is frozen
 * @param s current state 
 * @returns boolean: whether current Tet is frozen
 */
export const checkFrozen = (s:State): boolean => {
    return s.currentTet.blocks.map(
        (block) => checkBlockFrozen(s.board,block)
    ).reduce(
        (isFrozen, val) => isFrozen ? isFrozen : val
    )
}

/**
 * Checks if a block is frozen
 * @param b block to check
 * @param block board to check block against
 * @returns boolean: whether block is frozen
 */
const checkBlockFrozen = (b: Board, block: Block): boolean => {

    if(block.y == Constants.GRID_HEIGHT-1) { return true; }
    if (b.grid[block.y+1][block.x].id != -5) { return true; }
    return false;

}

/**
 * Checks if a tetromino is overlapping with other blocks
 * @param b board to check against tetromino
 * @param t tetromino to check
 * @returns boolean: whether the tetromino is overlapping
 */
export const checkOverlap = (b: Board, t: Tet): boolean => {
    return t.blocks.map(
        (block) => checkBlockOverlap(b,block)
    ).reduce(
        (isOverlap, val) => isOverlap ? isOverlap : val
    )
}

/**
 * Checks if a block is overlapping with other blocks
 * @param b board to check against tetromino
 * @param block board to check
 * @returns boolean: whether the block is overlapping
 */
const checkBlockOverlap = (b: Board, block: Block): boolean => {

    if (b.grid[block.y][block.x].id != -5) { return true; }
    return false;

}

/**
 * Checks if there are blocks in the top row
 * @param b board to check
 * @returns whether there are blocks in he top row
 */
export const checkTopRowReached = (b: Board): boolean => {

    return b.grid[0].map(
        (block) => block.id == -5 ? false : true
        
    ).reduce(
        (isTopReached, val) => isTopReached ? isTopReached : val, false
    )

}

/**
 * Checks for full rows in a board
 * @param b board to check
 * @returns array of indexes of full rows
 */
export const checkFullRow = (b: Board): number[] => {
    return b.grid.map(
        (row, rowIndex) => {
            const isRowFull = row.reduce(
                (rowCheck, val) => val.id == -5 ? false : rowCheck, true
            )
            return isRowFull ? rowIndex : -1

        }
    ).filter(
        (rowIndex) => rowIndex != -1
    )
}

/**
 * Checks if a tetromino can move to a certain location
 * @param b board to check Tet against
 * @param t Tet in new location
 * @returns whether the Tet can move to the new location
 */
export const isTetValid = (b: Board, t: Tet): boolean => {

    if (!(t.topRow >= 0 && t.topRow < Constants.GRID_HEIGHT)
        || !(t.botRow >= 0 && t.botRow < Constants.GRID_HEIGHT)
        || !(t.leftCol >= 0 && t.leftCol < Constants.GRID_WIDTH)
        || !(t.rightCol >= 0 && t.rightCol < Constants.GRID_WIDTH)
        ) { return false; }

    if (checkOverlap(b,t)) { return false; }

    return true;

}

/**
 * Checks if a tick is valid by comparing the instruction to the 
 * game's difficulty and mode
 * @param tick instruction to check
 * @param difficulty difficulty level of game
 * @param zen if calm mode/zen mode is active
 * @returns whether the instruction is a valid tick or not
 */
export const isTickValid 
    = (tick: Instruction, difficulty: difficultyScore, zen: boolean) => {

    switch (tick) {
        case "tick0":
        case "tick1":
        case "tick2":
        case "tick3":
        case "tick4":
            break; // is a valid tick

        case "down":
        case "left":
        case "right":
        case "up":
        case "rotate-left":
        case "rotate-right":
        case "pause":
        case "restart":
        case "calm-mode":
            return false; // is not a tick
    }

    if (zen && 
            (tick == "tick1" || tick == "tick2" || 
            tick == "tick3" || tick == "tick4")
        ) { return false; } // if zen, level tick invalid

    if (tick == "tick0" && !(zen)) { return false; } // zen mode tick check
    if (tick == "tick1" && 
        difficulty != difficultyScore.d_1) {return false;} // level 1 tick check
    if (tick == "tick2" && 
        difficulty != difficultyScore.d_2) {return false;} // level 2 tick check
    if (tick == "tick3" && 
        difficulty != difficultyScore.d_3) {return false;} // level 3 tick check
    if (tick == "tick4" && 
        difficulty != difficultyScore.d_4) {return false;} // level 4 tick check

    return true;
}
