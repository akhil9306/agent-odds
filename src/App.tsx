import { AnimatePresence, motion } from 'framer-motion'
import { useRoute } from './lib/router'
import { StoreProvider } from './store/store'
import { Footer, Navbar, Toaster } from './components/Layout'
import Home from './pages/Home'
import BattlePage from './pages/Battle'
import { ArenaDetail, ArenasPage, LivePage } from './pages/Arenas'
import Leaderboard from './pages/Leaderboard'
import MyBets from './pages/MyBets'
import AgentProfile from './pages/AgentProfile'

function Routes() {
  const { path, segments, query } = useRoute()
  const [head, id] = segments
  let page: React.ReactNode
  switch (head) {
    case undefined: page = <Home />; break
    case 'arenas': page = <ArenasPage />; break
    case 'arena': page = <ArenaDetail id={id} />; break
    case 'live': page = <LivePage />; break
    case 'battle': page = <BattlePage key={id} id={id} demo={query.get('demo') === '1'} />; break
    case 'leaderboard': page = <Leaderboard />; break
    case 'bets': page = <MyBets />; break
    case 'agent': page = <AgentProfile id={id} />; break
    default: page = <Home />
  }
  return (
    <>
      <Navbar path={path} />
      <AnimatePresence mode="wait">
        <motion.main key={path} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {page}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Toaster />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Routes />
    </StoreProvider>
  )
}
