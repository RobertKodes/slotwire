import { Hud } from './Hud.tsx'
import { PaperTape } from './PaperTape.tsx'
import { ReplayDock } from './ReplayDock.tsx'
import { Sounder } from './Sounder.tsx'
import { TelegraphKey } from './TelegraphKey.tsx'
import { useCircuit } from '../hooks/useCircuit.ts'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.ts'

export function Desk() {
  const reduced = usePrefersReducedMotion()
  const circuit = useCircuit()
  const { snap } = circuit
  const armed = snap.mode === 'live'
  const idle = snap.mode === 'idle'

  return (
    <div className={`desk ${idle ? 'is-idle' : 'is-lit'} line-${snap.line}`}>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="lamp-cone" aria-hidden="true" />

      <header className="mast">
        <div className="wu-badge" aria-hidden="true">
          <span>W</span>
          <span>U</span>
        </div>
        <div className="mast-titles">
          <h1>SLOTWIRE</h1>
          <p>TELEGRAPH DESK · SOLANA MAINNET · ROBERTKODES LAB SW-1</p>
        </div>
        <div className="mast-circuit">
          <span>CIRCUIT</span>
          <strong>SOL-MAIN</strong>
        </div>
      </header>

      <div className="bench">
        <Sounder
          strike={snap.strike}
          live={snap.mode !== 'idle'}
          idle={idle}
          reduced={reduced}
        />
        <Hud snap={snap} onMute={circuit.setMute} />
      </div>

      <PaperTape snap={snap} reduced={reduced} />

      <footer className="rail">
        <TelegraphKey
          armed={armed}
          searching={snap.line === 'searching'}
          onToggle={() => {
            if (armed) circuit.kill()
            else circuit.arm()
          }}
        />
        <ReplayDock
          snap={snap}
          onSave={circuit.downloadTape}
          onReplay={() => circuit.startReplay()}
          onLive={() => circuit.arm()}
          onScrub={circuit.setReplayMs}
          onLoad={(file) => void circuit.loadTapeFile(file)}
        />
      </footer>
    </div>
  )
}
