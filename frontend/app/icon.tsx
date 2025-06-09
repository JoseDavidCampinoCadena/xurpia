import { ImageResponse } from 'next/og'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#39ff14',
          borderRadius: '4px',
          position: 'relative',
          boxShadow: '0 0 20px #00ff41',
        }}
      >
        {/* Bold X Symbol with fluorescent green */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: '900',
          fontFamily: 'Arial, sans-serif',
          color: '#39ff14',
          textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
          transform: 'scale(1.2)',
        }}>
          X
        </div>
        
        {/* Glow effect background */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0,255,65,0.1) 0%, transparent 70%)',
          borderRadius: '4px',
        }} />
      </div>
    ),
    {
      width: 32,
      height: 32,    },
  )
}

export const runtime = 'edge'
