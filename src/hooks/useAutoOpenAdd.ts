import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Opens the add sheet once on mount when navigated here with { state: { openAdd: true } }. */
export function useAutoOpenAdd(onOpen: () => void) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      onOpen()
      navigate(location.pathname, { replace: true, state: {} })
    }
    // Only check on mount — this page corresponds 1:1 with a fresh
    // navigation, so re-running on every location.state change would risk
    // reopening the sheet after the replace() above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
