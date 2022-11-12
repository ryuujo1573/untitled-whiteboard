import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { App } from './App'
import './styles/index.css'
import store from './redux/store'

ReactDOM.createRoot(document.getElementById('kfc-crazy-thursday-vme50') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
