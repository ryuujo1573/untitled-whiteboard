import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { App } from './App'
import './styles/index.css'
import store from './redux/store'

const vanillaLog = console.log;
Object.assign(console, {
  log(msg: any, ...data: any[]) {
    if (typeof msg === 'object') {
      msg = JSON.parse(JSON.stringify(msg));
    }
    vanillaLog(msg, ...data);
  }
})

ReactDOM.createRoot(document.getElementById('kfc-crazy-thursday-vme50') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
