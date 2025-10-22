import { mount } from '../src/index.full'

const client = mount({
  url: 'http://localhost:5173?log=true',
  log: true,
  onReady: () => {

  },
  onConfig: (config) => {
  },
  onFlowActive: (flow, times) => {

  },
  onOpen: () => {
    client.proxy.postMessage({
      action: 'getChatFlows',
      params: ['111111'],
    })
  },
  onGetter(getterId, getterKey) {
    if (getterKey === 'pageContent') {
      const content = document.body.textContent || ''
      client.proxy.postMessage({
        action: 'sendGetterData',
        params: [getterId, {
          content,
          type: 'summary',
        }],
      })
    }
  },
  onData(key, val) {
    if (key === '111111') {
      const target = val.find(item => item.inputs.belonging_id === 508)
      if (target) {
        client.proxy.postMessage({
          action: 'activateChatFlowById',
          params: [target.id],
        })
      }
      else {
        client.proxy.postMessage({
          action: 'toHome',
          params: ['replace'],
        })
        client.proxy.postMessage({
          action: 'setSkill',
          params: [
            'ask-project',
            {
              belongingId: 508,
            },
          ],
        })
      }
    }
  },
})

;(window as any).client = client

;(document.getElementById('app') as any).innerHTML = `
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
<p>ssssssssssssssssssssssssssss</p>
`
