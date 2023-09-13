/**
 * This is a TypeScript file that contains view related constants and functions.
 *
 * @fileOverview
 * @module view
 * 
 * @description
 * Handles view related functionality.
 *
 * @author
 * Nisha Shaline Kannapper [31121993]
 *
 * @version
 * Assignment submission version
 */

import { State, Block, Tet, Board, difficultyScore } from "./types";
import { BlockSize, genPreviewTet } from "./util";

/** Elements */

// Canvas elements
export const svg 
    = document.querySelector("#svgCanvas") as SVGGraphicsElement & HTMLElement;
export const preview 
    = document.querySelector("#svgPreview") as SVGGraphicsElement & HTMLElement;
export const gameover 
    = document.querySelector("#gameOver") as SVGGraphicsElement & HTMLElement;
export const container 
    = document.querySelector("#main") as HTMLElement;

// Text fields
export const levelText 
    = document.querySelector("#levelText") as HTMLElement;
export const scoreText 
    = document.querySelector("#scoreText") as HTMLElement;
export const highScoreText 
    = document.querySelector("#highScoreText") as HTMLElement;

// the music
export const gameMusic = {
    LEVEL_1: 
        document.getElementById("level1Music") as HTMLAudioElement,
    LEVEL_2: 
        document.getElementById("level2Music") as HTMLAudioElement,
    LEVEL_3: 
        document.getElementById("level3Music") as HTMLAudioElement,
    LEVEL_4: 
        document.getElementById("level4Music") as HTMLAudioElement,
    GAME_OVER: 
        document.getElementById("gameOverMusic") as HTMLAudioElement,
    FREEZE: 
        document.getElementById("freezeSound") as HTMLAudioElement,
    ROW_CLEAR: 
        document.getElementById("rowClearSound") as HTMLAudioElement,
    GAME_OVER_SOUND: 
        document.getElementById("gameOverSound") as HTMLAudioElement,
    CALM_MUSIC: 
        document.getElementById("calmMusic") as HTMLAudioElement,
    CALM_FREEZE: 
        document.getElementById("calmFreeze") as HTMLAudioElement,
    CALM_GAME_OVER: 
        document.getElementById("calmGameOver") as HTMLAudioElement,
}


/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
export const show = (elem: SVGGraphicsElement) => {
    elem.setAttribute("visibility", "visible");
    elem.parentNode!.appendChild(elem);
};
    
/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
export const hide = (elem: SVGGraphicsElement) =>
    elem.setAttribute("visibility", "hidden");
    
/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
export const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
    id: string

    ) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    elem.setAttribute("id", id)
    return elem;
    };
    
    
/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
export const render = (s: State) => {

    s.currentTet.blocks.map(
        (block) => {
            removePieceFromCanvas(`${block.id}`, svg);
            addPieceToCanvas(block, `${block.id}`, svg);
        }
    )

    const previewTet = genPreviewTet(s.nextTet.type)

    previewTet.blocks.map(
        (block) => {
            removePieceFromCanvas(`${block.id}`, preview);
            addPieceToCanvas(block, `${block.id}`, preview);
        }
    )
    
    levelText.textContent = 
        s.gameEnd 
            ? ":("
        : s.zenMode 
            ? "Calm Mode"
        : s.difficulty == difficultyScore.d_1 
            ? "1"
        : s.difficulty == difficultyScore.d_2
            ? "2"
        : s.difficulty == difficultyScore.d_3
            ? "3"
            : "4"
            
    scoreText.textContent = `${s.score}`
    highScoreText.textContent = `${s.highscore}`

};

/**
 * Removes a block from the canvas by id
 * @param id id of block to remove
 * @param section SVGElement to remove block from
 */
export const removePieceFromCanvas 
    = (id: string, section: SVGElement) => {

    const toRemove = document.getElementById(id);
    if (toRemove) {
        section.removeChild(toRemove);
    }
    
};

/**
 * Adds a block to the canvas
 * @param block block to add
 * @param id id to give element representing block
 * @param section SVGElement to add block to
 */
export const addPieceToCanvas 
    = (block: Block, id: string, section: SVGElement) => {

    const rect = createSvgElement(section.namespaceURI, "rect", {
        height: `${BlockSize.HEIGHT}`,
        width: `${BlockSize.WIDTH}`,
        x: `${block.x*BlockSize.WIDTH}`,
        y: `${block.y*BlockSize.HEIGHT}`,
        style: block.cssStyle,
        
        }, id );
    
    section.appendChild(rect);
    
};

/**
 * Renders all the blocks in an 1D array
 * @param row 1D array of blocks
 */
export const renderRow = (row: Block[]) => {
    row.map(
        (block) => {
            if (block.id != -5) {
                removePieceFromCanvas(`${block.id}`, svg);
                addPieceToCanvas(block, `${block.id}`, svg);
            }
        }
    )
}

/**
 * Clears all the blocks off the element representing the board
 * @param currTet current tetromino to remove
 * @param b board of blocks to remove
 */
export const clearCanvas = (currTet: Tet, b: Board) => {
    currTet.blocks.map(
        (block) => removePieceFromCanvas(`${block.id}`, svg)
    )

    b.grid.map(
        (row) => row.map(
            (block) => block.id != -5 ? 
                removePieceFromCanvas(`${block.id}`, svg) : null
        )
    )
}

/**
 * Generates a function to play a specific song
 * @param song number representing a song
 * @returns function that plays the song
 */
const playSong = (song: number) => () => {
    if (!(gameMusic.LEVEL_1.paused)){ gameMusic.LEVEL_1.pause(); }
    if (!(gameMusic.LEVEL_2.paused)){ gameMusic.LEVEL_2.pause(); }
    if (!(gameMusic.LEVEL_3.paused)){ gameMusic.LEVEL_3.pause(); }
    if (!(gameMusic.LEVEL_4.paused)){ gameMusic.LEVEL_4.pause(); }
    if (!(gameMusic.GAME_OVER.paused)){ gameMusic.GAME_OVER.pause(); }
    if (!(gameMusic.GAME_OVER_SOUND.paused)){ 
        gameMusic.GAME_OVER_SOUND.pause();
        gameMusic.GAME_OVER_SOUND.load() 
    }
    if (!(gameMusic.CALM_MUSIC.paused)){ gameMusic.CALM_MUSIC.pause(); }
    if (!(gameMusic.CALM_GAME_OVER.paused)){ gameMusic.CALM_GAME_OVER.pause(); }

    switch (song) {
        case 1:
            gameMusic.LEVEL_1.play()
            gameMusic.LEVEL_1.volume = 0.4
            break;
        case 2:
            gameMusic.LEVEL_2.play()
            gameMusic.LEVEL_2.volume = 0.4
            break;
        case 3:
            gameMusic.LEVEL_3.play()
            gameMusic.LEVEL_3.volume = 0.4
            break;
        case 4:
            gameMusic.LEVEL_4.play()
            gameMusic.LEVEL_4.volume = 0.4
            break;
        case 5:
            gameMusic.GAME_OVER.play()
            gameMusic.GAME_OVER.volume = 0.4
            break;
        case 6:
            gameMusic.CALM_MUSIC.play()
            gameMusic.CALM_MUSIC.volume = 0.4
            break;
        case 7:
            gameMusic.CALM_GAME_OVER.play()
            gameMusic.CALM_GAME_OVER.volume = 0.4
            break;
    }
    
}

/**
 * Plays music for Level 1
 */
export const level1Music = playSong(1)

/**
 * Plays music for Level 2
 */
export const level2Music = playSong(2)

/**
 * Plays music for Level 3
 */
export const level3Music = playSong(3)

/**
 * Plays music for Level 4
 */
export const level4Music = playSong(4)

/**
 * Plays music for when the game ends
 */
export const gameOverMusic = playSong(5)

/**
 * Plays music for calm mode
 */
export const calmMusic = playSong(6)

/**
 * Plays music for when the game ends [CALM MODE]
 */
export const calmGameOverMusic = playSong(7)


/**
 * Generates a function to play a specific sound effect
 * @param effect number representing a sound effect
 * @returns function to play a sound effect 
 */
const playSoundEffect = (effect: 1|2|3|4) => () => {
    if (!(gameMusic.FREEZE.paused)){ 
        gameMusic.FREEZE.pause();
        gameMusic.FREEZE.load() 
    }
    if (!(gameMusic.ROW_CLEAR.paused)){ 
        gameMusic.ROW_CLEAR.pause();
        gameMusic.ROW_CLEAR.load() 
    }
    if (!(gameMusic.GAME_OVER_SOUND.paused)){ 
        gameMusic.GAME_OVER_SOUND.pause();
        gameMusic.GAME_OVER_SOUND.load() 
    }
    if (!(gameMusic.CALM_FREEZE.paused)){ 
        gameMusic.CALM_FREEZE.pause();
        gameMusic.CALM_FREEZE.load() 
    }

    switch (effect) {
        case 1:
            gameMusic.FREEZE.volume = 0.05
            gameMusic.FREEZE.play()
            break;
        case 2:
            gameMusic.ROW_CLEAR.volume = 1
            gameMusic.ROW_CLEAR.play()
            break;
        case 3:
            gameMusic.GAME_OVER_SOUND.volume = 0.4
            gameMusic.GAME_OVER_SOUND.play()
        case 4:
            gameMusic.CALM_FREEZE.volume = 0.5
            gameMusic.CALM_FREEZE.play()
    }
}

/**
 * Plays sound effect for when a block freezes in place
 */
export const freezeSound = playSoundEffect(1)

/**
 * Plays sound effect for when a block freezes in place [CALM MODE]
 */
export const calmFreezeSound = playSoundEffect(4)

/**
 * Plays sound effect for when a row is cleared
 */
export const rowClearSound = playSoundEffect(2)

/**
 * Plays sound effect for the game is over
 */
export const gameOverSound = playSoundEffect(3)
