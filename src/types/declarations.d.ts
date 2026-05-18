declare module '@supabase/ssr';

// Minimal pixi.js v7 types for our usage
declare module 'pixi.js' {
  export const Assets: {
    load(url: string): Promise<Texture>;
  };

  export class Texture {
    width: number;
    height: number;
    source: any;
  }

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
    children: any[];
    addChild: (child: any) => any;
    addChildAt: (child: any, index: number) => any;
    removeChild: (child: any) => any;
    removeChildren: () => any;
    getChildByName: (name: string) => any;
  }

  export class Graphics extends Container {
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

  export class Sprite extends Container {
    constructor(texture?: Texture);
    texture: Texture;
    width: number;
    height: number;
    scale: { set: (x: number, y?: number) => void };
    anchor: { set: (x: number, y?: number) => void };
    rotation: number;
    alpha: number;
  }

  export class Text extends Container {
    constructor(text?: string, style?: any);
    anchor: { set: (x: number, y?: number) => void };
    style: any;
  }
}
