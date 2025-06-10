import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#39ff14',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          textShadow: '0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 40px #39ff14',
        }}
      >
        X
      </div>
    ),
    {
      ...size,
    }
  )
}