import { useEffect, useState, type AnchorHTMLAttributes } from 'react'

function parse() {
  const h = window.location.hash.replace(/^#/, '') || '/'
  const [path, q] = h.split('?')
  return { path: path || '/', query: new URLSearchParams(q || ''), segments: (path || '/').split('/').filter(Boolean) }
}

export function useRoute() {
  const [r, setR] = useState(parse)
  useEffect(() => {
    const f = () => {
      setR(parse())
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return r
}

export const navigate = (to: string) => {
  window.location.hash = to
}

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...rest} />
}
