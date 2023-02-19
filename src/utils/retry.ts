export const createRetry = (
  retryCount: number,
  initTimeoutIncrement: number,
) => {
  const state = {retriesLeft: retryCount, timeoutWait: initTimeoutIncrement};
  const retriesLeft = () => {
    return state.retriesLeft >= 1;
  };
  const clear = () => {
    console.log('Clearing retries back to:', retryCount);
    state.retriesLeft = retryCount;
    state.timeoutWait = initTimeoutIncrement;
  };
  const retry = (fn: Function) => {
    state.retriesLeft = state.retriesLeft - 1;
    if (state.retriesLeft <= 0) {
      console.error('Exhausted all retries');
    } else {
      console.log(`Retrying after waiting ${state.timeoutWait}`);
      setTimeout(fn, state.timeoutWait);
      state.timeoutWait = state.timeoutWait * 2;
    }
  };
  return {retry, clear, retriesLeft};
};
