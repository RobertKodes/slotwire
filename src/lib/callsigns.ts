export type WatchedProgram = {
  id: string
  callsign: string
}

/** Short Morse-ish desk codes for programs that actually move. Vote/system omitted. */
export const WATCHED: WatchedProgram[] = [
  { id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', callsign: 'TKN' },
  { id: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', callsign: 'T22' },
  { id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', callsign: 'ATA' },
  { id: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', callsign: 'JUP' },
  { id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', callsign: 'RAY' },
  { id: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', callsign: 'CLM' },
  { id: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', callsign: 'ORC' },
  { id: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', callsign: 'MTR' },
  { id: 'PhoeNiXZ8ByJGLavoGGDMtATPBMDQsBnNsSUTjQHxjV', callsign: 'PHX' },
  { id: 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH', callsign: 'DFT' },
  { id: 'KLend2g3cP87fffoy8q1mQqGKjrxjC8oSygPx8HrFRB', callsign: 'KAM' },
  { id: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', callsign: 'MTX' },
  { id: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', callsign: 'MMO' },
  { id: 'Stake11111111111111111111111111111111111111', callsign: 'STK' },
  { id: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX', callsign: 'OBK' },
  { id: 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD', callsign: 'MRN' },
]

export function nextWatch(index: number): WatchedProgram {
  return WATCHED[index % WATCHED.length]!
}
