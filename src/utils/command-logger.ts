type Entry = {
  kbAddr: string;
  request: number[];
  response: number[];
  ts: number;
};

const entryLog: Entry[] = [];

export const logCommand = (
  kbAddr: string,
  request: number[],
  response: number[],
) => {
  entryLog.push({kbAddr, request, response, ts: Date.now()});
};

export const getLog = ((window as any).__getLogs = () => {
  return entryLog;
});

window.addEventListener('message', (m) => {
  console.log('cl', m);
  if (m.data.command === 'fetchLogs') {
    window.postMessage({command: 'getLogs', payload: getLog()}, '*');
  }
});
