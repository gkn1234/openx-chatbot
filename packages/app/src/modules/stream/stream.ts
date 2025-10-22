import type {
  ChatFlowActionOutputStream,
  StreamActionOptions,
} from './types';

declare global {
  interface Error {
    isStreamStopped?: boolean

    /** 流式输出数据 */
    stream?: ChatFlowActionOutputStream
  }
}

export function streamAction(options: StreamActionOptions) {
  const baseUrl = options.baseUrl;

  const {
    clearTimer,
    clearWaitingTimer,
  } = createTimers(options);

  let isRunning = true;

  const doFinish = () => {
    isRunning = false;
    clearTimer();
    clearWaitingTimer();
  };

  const s = new Promise<void>((resolve, reject) => {
    const doResolved = () => {
      doFinish();
      resolve();
    };

    const doError = (e: Error) => {
      doFinish();
      options.onError?.(e);
      reject(e);
    };

    fetch(`${baseUrl}${options.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.key}`,
      },
      body: JSON.stringify(options.params),
    }).then(async (res) => {
      if (!res || !res.ok || !res.body) {
        const data = await res.json();
        throw new Error(data?.message || 'Stream request failed!');
      }

      options.onReady?.(doResolved, doError);

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      const brokenValues: string[] = [];
      // eslint-disable-next-line no-unmodified-loop-condition
      while (isRunning) {
        const { value, done } = await reader.read();

        if (done || !isRunning) {
          break;
        }

        const values = value.split('\n')
          .map((v) => {
            if (!v) {
              return null;
            }

            v = v.trim();

            if (v.startsWith('event: ping')) {
              return null;
            }

            if (v.startsWith('data: ')) {
              v = v.slice(6);
            }
            else {
              // 拼接断章
              v = brokenValues.join('') + v;
              brokenValues.length = 0;
            }

            if (!v.endsWith('}')) {
              // 记录断章
              brokenValues.push(v);
            }

            try {
              const obj = JSON.parse(v);
              return obj;
            }
            catch {
              return null;
            }
          })
          .filter(v => v);

        values.forEach((v) => {
          onResolved(
            options,
            v,
            doResolved,
            doError,
            clearWaitingTimer,
          );
        });
      }

      doResolved();
    }).catch((e) => {
      doError(e);
    });
  });

  return s;
}

function onResolved(
  options: StreamActionOptions,
  stream: ChatFlowActionOutputStream,
  done: () => void,
  error: (e: Error) => void,
  clearWaitingTimer: () => void,
) {
  if (stream.event === 'workflow_started') {
    options.onWorkflowStarted?.(stream, done, error);
  }
  if (stream.event === 'workflow_finished') {
    const { data = {} } = stream;
    if (data.status === 'succeeded') {
      options.onWorkflowSuccess?.(stream, done, error);
      done();
      return;
    }

    const err = new Error(data.error || 'Workflow failed!');
    err.stream = stream;
    if (data.status === 'stopped') {
      err.isStreamStopped = true;
    }
    error(err);
  }
  if (stream.event === 'node_started') {
    options.onNodeStarted?.(stream, done, error);
  }
  if (stream.event === 'node_finished') {
    options.onNodeFinished?.(stream, done, error);
  }
  if (stream.event === 'text_chunk') {
    clearWaitingTimer();
    options.onTextChunk?.(stream, done, error);
  }
  if (stream.event === 'message') {
    clearWaitingTimer();
    options.onMessage?.(stream, done, error);
  }
  if (stream.event === 'message_replace') {
    clearWaitingTimer();
    options.onMessageReplace?.(stream, done, error);
  }
  if (stream.event === 'error') {
    const err = new Error(stream.message || 'Stream action error!');
    if (stream.message?.includes('Aborted')) {
      // 自定义内源助手中断时会抛出 Aborted 错误，需要标记一下，避免报错或者调用错误统计
      err.isStreamStopped = true;
    }
    err.stream = stream;
    error(err);
  }
}

function createTimers(options: StreamActionOptions) {
  const {
    waitingTimeout,
    timeout,
    onTimeout,
  } = options;

  let watingTimer: ReturnType<typeof setTimeout> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  if (waitingTimeout && onTimeout) {
    watingTimer = setTimeout(() => {
      onTimeout('waiting');
      clearWaitingTimer();
    }, waitingTimeout);
  }

  if (timeout && onTimeout) {
    timer = setTimeout(() => {
      onTimeout('all');
      clearTimer();
    }, timeout);
  }

  function clearWaitingTimer() {
    if (watingTimer) {
      clearTimeout(watingTimer);
      watingTimer = null;
    }
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { clearWaitingTimer, clearTimer };
}
