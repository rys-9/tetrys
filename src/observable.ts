/**
 * This is a TypeScript file that contains observables and observable-
 * related functions.
 *
 * @fileOverview
 * @module observable
 *
 * @description
 * Handles Observable generation.
 *
 * @author
 * Nisha Shaline Kannapper [31121993]
 *
 * @version
 * Assignment submission version
 */

import { fromEvent, interval, merge } from "rxjs";
import { map, filter } from "rxjs/operators";

import { Constants } from "./util";
import { Key, Instruction } from "./types";


/** Creates an Observable that emits values that triggers the game state
 * and canvas to update */
export const getInput = () => {

    /** User input */
    const key$ = fromEvent<KeyboardEvent>(document, "keypress");

    const fromKey = (keyCode: Key, instruction: Instruction) =>
    key$.pipe(
        filter(({ code }) => code === keyCode),
        map((): Instruction => instruction),
        );



    /** Observables */

    const left$ = fromKey("KeyA", "left");
    const right$ = fromKey("KeyD", "right");
    const down$ = fromKey("KeyS", "down");
    const up$ = fromKey("KeyW", "up");
    const antiClockwise$ = fromKey("KeyQ", "rotate-left");
    const clockwise$ = fromKey("KeyE", "rotate-right");
    const pause$ = fromKey("KeyR", "pause");
    const restart$ = fromKey("KeyP", "restart");
    const calm$ = fromKey("KeyZ","calm-mode")


    
    /** Determines the rate of time steps */
    const tick0$ = interval(Constants.TICK_RATE_0_MS).pipe(
        map((): Instruction => "tick0"));
    const tick1$ = interval(Constants.TICK_RATE_1_MS).pipe(
        map((): Instruction => "tick1"));
    const tick2$ = interval(Constants.TICK_RATE_2_MS).pipe(
        map((): Instruction => "tick2"));
    const tick3$ = interval(Constants.TICK_RATE_3_MS).pipe
    (map((): Instruction => "tick3"));
    const tick4$ = interval(Constants.TICK_RATE_4_MS).pipe(
        map((): Instruction => "tick4"));

    return merge(
        left$,right$,down$,up$,
        antiClockwise$,clockwise$,
        pause$,restart$,calm$,
        tick0$,tick1$,tick2$,tick3$,tick4$);

};