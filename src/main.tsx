import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import App from './App'
import { initializeAuth } from './features/auth/authSlice'
import { store } from './store'

store.dispatch(initializeAuth())

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  )
} else {
  console.error('Root element not found')
}
