import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/shell/AppShell'
import Dashboard from './pages/Dashboard'
import ResourceView from './pages/ResourceView'
import Easings from './pages/Easings'
import Icons from './pages/Icons'
import NotFound from './pages/NotFound'
import PreviewPage from './pages/PreviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="preview/:slug" element={<PreviewPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Dashboard view="all" />} />
        <Route path="new" element={<Dashboard view="new" />} />
        <Route path="favorites" element={<Dashboard view="favorites" />} />
        <Route path="recent" element={<Dashboard view="recent" />} />
        <Route path="c/:category" element={<Dashboard key="cat" view="category" />} />
        <Route path="r/:slug" element={<ResourceView />} />
        <Route path="icons" element={<Icons />} />
        <Route path="easings" element={<Easings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
