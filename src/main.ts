/**
 * This is a TypeScript file that contains the main game loop.
 *
 * @fileOverview
 * @module main
 *
 * @description
 * Runs the main game loop.
 *
 * @author
 * Nisha Shaline Kannapper [31121993]
 *
 * @version
 * Assignment submission version
 */

import "./style.css";
import { scan } from "rxjs/operators";

import { Viewport, genInitialState } from "./util";
import { tick } from "./state";
import { State,  Instruction } from "./types";
import { show, hide, render, level1Music } from "./view";
import { getInput } from "./observable";
import { svg, preview, gameover } from "./view";



/**
 * This is the function called on page load. Main game loop
 * is called here.
 */
export function main() {

  /** Initial game state */
  const initialState: State = genInitialState()

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  const input$ = getInput();

  /** Main game loop */
  const source$ = input$
    .pipe(
      scan((s: State, input: Instruction) => 
        (tick(s,input)), initialState)
      )

    .subscribe((s: State) => {
      
      render(s);
      

      if (s.gameEnd) {
        show(gameover);
      } else {
        hide(gameover);
      }

    });
}


// Runs main function on window load.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
