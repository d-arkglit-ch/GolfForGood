import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import { routes } from '../Routes'

export default function RouteRenderer() {
  const renderRoute = (route) => {
    let element = route.element

    // Wrap with AdminRoute
    if (route.admin) {
      element = <AdminRoute>{element}</AdminRoute>
    }
    // Wrap with ProtectedRoute
    else if (route.protected) {
      element = (
        <ProtectedRoute requireSubscription={route.requireSubscription}>
          {element}
        </ProtectedRoute>
      )
    }

    return <Route key={route.path} path={route.path} element={element} />
  }

  return <Routes>{routes.map(renderRoute)}</Routes>
}