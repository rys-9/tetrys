/**
 * This is a TypeScript file that game state and state-related functions.
 *
 * @fileOverview
 * @module state
 *
 * @description
 * Handles tick logic.
 *
 * @author
 * Nisha Shaline Kannapper [31121993]
 *
 * @version
 * Assignment submission version
 */

import "./style.css";

import { checkFrozen, startGame, newRound, startRound, pause, unpause, freeze, genMovedTet, isTetValid, moveCurrentTet, restartState, zenInactive, zenActive, unfreeze, isTickValid } from "./util";
import { State, Instruction, difficultyScore } from "./types";
import { level1Music, level2Music, level3Music, level4Music, gameOverMusic, gameOverSound, calmGameOverMusic } from "./view";


/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
export const tick = (s: State, i: Instruction ): State => {

    if (i == "restart") {
        return restartState(s)
    }

    if (i == "calm-mode") {
        if (s.zenMode) { return zenInactive(s); }
        else { return zenActive(s); }
    }

    if (i == "pause") {
        return s.pause ? unpause(s) : pause(s)
    }


    const checkedState: {state: State, instruct: boolean, update: boolean}
        = checkState(s, i)

    const instructedState
        = checkedState.instruct ?
            instructState(checkedState.state, i) : checkedState.state

    const updatedState
        = checkedState.update ?
            updateState(instructedState, i) : instructedState;


    if (!(s.gameEnd) && updatedState.gameEnd) {
        if (s.zenMode) {
            calmGameOverMusic()
        } else {
            gameOverMusic()
            gameOverSound()
        }


    } else if (s.difficulty != updatedState.difficulty) {
        if (!(s.zenMode)) {
            switch (updatedState.difficulty) {
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
        }
    }

    return updatedState;
};

/**
 * Checks game state to see if the state should be altered by the other 
 * functions in tick(s), and returns an object with the updated state and 
 * whether it should be altered by instructState(s) and updateState(s).
 * @param s state
 * @param i instruction
 * @returns object with updated state, whether it should be altered by 
 * instructState(s), whether it should be altered by updateState(s).
 */
const checkState 
    = (s: State, i: Instruction)
    : {state: State, instruct: boolean, update: boolean} => 
{
        const toInstruct = s.gameStart || s.gameEnd || 
            (s.frozen && isTickValid(i, s.difficulty, s.zenMode)) ?
                false : true

        const toUpdate = s.gameStart || s.gameEnd ? false : true

        if (s.gameStart) {
            return {state: startGame(s),
                instruct: toInstruct, update: toUpdate}

        } else if (s.gameEnd) {
            return {state: s, 
                instruct: toInstruct, update: toUpdate}

        } else if (s.frozen && isTickValid(i, s.difficulty, s.zenMode)) {
            return {state: newRound(s), 
                instruct: toInstruct, update: toUpdate}
        }

        return {state: s, instruct: toInstruct, update: toUpdate}
}

/**
 * Determines whether and how a tetromino should move, and moves it accordingly
 * @param s state
 * @param direction type of movement
 * @returns state with moved tetromino
 */
const instructState = (s: State, direction: Instruction ): State => {

    switch (direction) {
        case "tick0":
        case "tick1":
        case "tick2":
        case "tick3":
        case "tick4":
            if (s.pause) { return s; }
            if (!(isTickValid(direction, s.difficulty, s.zenMode))) { return s; }
            break;

        case "up":
            if (!(s.pause)) {return s; }
            break;
    }

    const movedTet = genMovedTet(s.currentTet, direction)
    if (isTetValid(s.board, movedTet)) {
        return moveCurrentTet(s,direction)
    }

    return s;

}

/**
 * Updates state if a round is starting or if the currently 
 * moving tetromino should freeze in its place
 * @param s state
 * @param i instruction
 * @returns updated state
 */
const updateState = (s: State, i: Instruction): State => {

    if (s.roundStart) {
        return startRound(s)
    }

    const frozenCheck = checkFrozen(s)
    if (!(frozenCheck)) { 
        return s.frozen ? unfreeze(s) : s
    }

    return s.frozen ? s 
        : isTickValid(i, s.difficulty, s.zenMode) 
            ? freeze(s)
            : s

}
