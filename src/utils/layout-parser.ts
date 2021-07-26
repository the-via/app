const LS = {
  START: 1,
  DEFINE: 2,
  LAYOUT1D_START: 3,
  LAYOUT1D_END: 4,
  LAYOUT2D_START: 5,
  LAYOUT2D_ROW_START: 6,
  LAYOUT2D_COL_START: 7,
  LAYOUT2D_COL_CONTINUE: 8,
  LAYOUT2D_COL_END: 9,
  LAYOUT2D_ROW_END: 10,
  LAYOUT2D_END: 11,
};

function error(state: any, nextToken: string) {
  console.error('Current State', state, 'Next: ', nextToken);
}

function tokenizer(state: any, next: string): any {
  const tnext = next.trim();
  const {prev, res} = state;
  // skip empty strings
  if (tnext === '') {
    return state;
  }

  if (prev === LS.START) {
    // skip
    if (tnext === '#define') {
      return {...state, prev: LS.DEFINE};
    }
  } else if (prev === LS.DEFINE) {
    const parenIdx = tnext.indexOf('(');
    const length = tnext.length;
    // If the ( is the last character of the token we're good :)
    if (parenIdx === length - 1) {
      const name = tnext.slice(0, length - 1);
      return {
        ...state,
        prev: LS.LAYOUT1D_START,
        res: {
          name,
          layout1D: [],
          layout2D: [],
        },
      };
    }
  } else if (prev === LS.LAYOUT1D_START) {
    const commaIdx = tnext.indexOf(',');

    if (commaIdx === 0) {
      return tokenizer(state, tnext.slice(1));
    }

    const parenIdx = tnext.indexOf(')');
    const length = tnext.length;
    if (parenIdx === 0) {
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT1D_END,
          res: {...res, layout2D: [[]]},
        },
        tnext.slice(1),
      );
    } else if (commaIdx === length - 1) {
      const keycode = tnext.slice(0, length - 1);
      const {layout1D} = res;
      return {
        ...state,
        prev: LS.LAYOUT1D_START,
        res: {...res, layout1D: [...layout1D, keycode]},
      };
    } else if (parenIdx === length - 1) {
      const keycode = tnext.slice(0, length - 1);
      const {layout1D} = res;
      return {
        ...state,
        prev: LS.LAYOUT1D_END,
        res: {...res, layout1D: [...layout1D, keycode], layout2D: [[]]},
      };
    } else if (parenIdx === -1 && commaIdx === -1) {
      const keycode = tnext;
      const {layout1D} = res;
      return {
        ...state,
        prev: LS.LAYOUT1D_START,
        res: {...res, layout1D: [...layout1D, keycode], layout2D: [[]]},
      };
    }
  } else if (prev === LS.LAYOUT1D_END) {
    if (tnext[0] === '{') {
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_START,
        },
        tnext.slice(1),
      );
    }
  } else if (prev === LS.LAYOUT2D_START) {
    if (tnext[0] === '{') {
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_COL_START,
        },
        tnext.slice(1),
      );
    }
  } else if (prev === LS.LAYOUT2D_COL_END) {
    if (tnext[0] === ',') {
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_COL_END,
        },
        tnext.slice(1),
      );
    } else if (tnext[0] === '}') {
      return state;
    } else if (tnext[0] === '{') {
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_COL_START,
          res: {...res, layout2D: [...res.layout2D, []]},
        },
        tnext.slice(1),
      );
    }
  } else if (prev === LS.LAYOUT2D_COL_START) {
    const commaIdx = tnext.indexOf(',');
    const bracketIdx = tnext.indexOf('}');
    if (commaIdx === 0) {
      return tokenizer(state, tnext.slice(1));
    }

    if (bracketIdx === 0) {
      const {layout2D} = res;
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_COL_END,
          res: {...res, layout2D: [...layout2D]},
        },
        tnext.slice(bracketIdx),
      );
    } else if (bracketIdx > 0) {
      const {layout2D} = res;
      const lastRow = layout2D[layout2D.length - 1];
      layout2D[layout2D.length - 1] = [...lastRow, tnext.slice(0, bracketIdx)];
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_COL_END,
          res: {...res, layout2D: [...layout2D]},
        },
        tnext.slice(bracketIdx),
      );
    } else if (commaIdx !== -1) {
      const {layout2D} = res;
      const lastRow = layout2D[layout2D.length - 1];
      layout2D[layout2D.length - 1] = [...lastRow, tnext.slice(0, commaIdx)];
      return tokenizer(
        {
          ...state,
          prev: LS.LAYOUT2D_COL_START,
          res: {...res, layout2D},
        },
        tnext.slice(commaIdx),
      );
    } else if (bracketIdx === -1 && commaIdx === -1) {
      const {layout2D} = res;
      const lastRow = layout2D[layout2D.length - 1];
      layout2D[layout2D.length - 1] = [...lastRow, tnext];
      return {
        ...state,
        prev: LS.LAYOUT2D_COL_START,
        res: {...res, layout2D},
      };
    }
  }
  error(state, tnext);
  throw 'Bad Token found';
}

export function parseLayout(layout: string) {
  const tokens = layout.split(/\s+/g);
  const {res} = tokens.reduce(tokenizer, {prev: LS.START, res: {}});
  const {layout1D, layout2D} = res;
  const [rows, cols] = [layout2D.length, layout2D[0].length];
  const indexMap = Object.assign(
    {},
    ...layout2D.map((arr: number[], i: number) =>
      Object.assign(
        {},
        ...arr.map((val: number, j: number) => ({
          [val]: {col: j, row: i},
        })),
      ),
    ),
  );
  return {rows, cols, layout: layout1D.map((val: number) => indexMap[val])};
}
