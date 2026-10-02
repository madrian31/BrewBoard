import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ContentProvider } from './features/content/ContentProvider'
import { routes } from './routes'

// Data router (hindi <BrowserRouter>) para magamit ang useBlocker sa editor.
const router = createBrowserRouter(routes)

export default function App() {
  return (
    <ContentProvider>
      <RouterProvider router={router} />
    </ContentProvider>
  )
}
