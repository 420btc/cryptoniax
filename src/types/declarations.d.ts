declare module '@supabase/ssr';

// Minimal pixi.js types for our usage
declare module 'pixi.js' {
  export class Application {
    constructor(options?: any);
    view: HTMLCanvasElement;
    stage: Container;
    screen: { width: number; height: number };
    renderer: { resize: (w: number, h: number) => void };
    ticker: { add: (fn: () => void) => void; remove: (fn: () => void) => void };
    destroy: (removeView?: boolean, options?: any) => void;
  }
  export class Container {
    name?: string;
    x?: number;
    y?: number;
    addChild: (child: any) => any;
    removeChild: (child: any) => any;
    getChildByName: (name: string) => any;
  }
  export class Graphics {
    beginFill: (color: number, alpha?: number) => Graphics;
    endFill: () => Graphics;
    drawRect: (x: number, y: number, w: number, h: number) => Graphics;
    drawRoundedRect: (x: number, y: number, w: number, h: number, r: number) => Graphics;
    drawCircle: (x: number, y: number, r: number) => Graphics;
    drawEllipse: (x: number, y: number, w: number, h: number) => Graphics;
    moveTo: (x: number, y: number) => Graphics;
    lineTo: (x: number, y: number) => Graphics;
    closePath: () => Graphics;
    lineStyle: (width?: number, color?: number, alpha?: number) => Graphics;
  }
  export class Text {
    constructor(text?: string, style?: any);
    x?: number;
    y?: number;
    name?: string;
  }
}
