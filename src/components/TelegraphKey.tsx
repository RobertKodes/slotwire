type Props = {
  armed: boolean
  searching: boolean
  onToggle: () => void
}

export function TelegraphKey({ armed, searching, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`key ${armed ? 'is-armed' : ''} ${searching ? 'is-searching' : ''}`}
      onClick={onToggle}
      aria-pressed={armed}
      aria-label={armed ? 'Kill circuit' : 'Arm circuit'}
    >
      <span className="key-wood">
        <span className="key-anvil" />
        <span className="key-lever">
          <span className="key-knob" />
        </span>
        <span className="key-plate">KEY</span>
      </span>
      <span className="key-copy">
        <strong>{armed ? 'ARMED' : 'ARM'}</strong>
        <em>{armed ? 'tap to kill circuit' : 'press to open the wire'}</em>
      </span>
    </button>
  )
}
