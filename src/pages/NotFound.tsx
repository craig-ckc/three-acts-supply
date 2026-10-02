import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
  const navigate = useNavigate()
  useEffect(() => {
    const prev = document.title
    document.title = 'Not found — Three Acts'
    return () => void (document.title = prev)
  }, [])

  return (
    <>
      <div className="grid flex-1 place-items-center px-6 text-center">
        <div>
          <h1 className="text-[40px] font-medium leading-none tracking-tight">404</h1>
          <p className="mt-3 text-ui text-muted">That page doesn’t exist.</p>
          <Button variant="ink" size="md" className="mt-5" onClick={() => navigate('/')}>
            Back to the Vault
          </Button>
        </div>
      </div>
    </>
  )
}
