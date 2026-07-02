import { useState } from 'react'
import './App.css'
import { GlassSwitch } from './GlassSwitch'
import { GlassSlider } from './GlassSlider'
import { GlassNotification } from './GlassNotification'
import { GlassContextMenu } from './GlassContextMenu'
import { GlassVideoControls } from './GlassVideoControls'
import { GlassCanvas } from './GlassCanvas'

// Free test video with good colours for the glass effect
const VIDEO_SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4";

function App() {
  const [switchOn, setSwitchOn] = useState(true)
  const [sliderVal, setSliderVal] = useState(65)

  return (
    <div className="page">
      {/* ── Video & Canvas ── */}
      <section className="section">
        <header className="section-header">
          <h2>Video &amp; Canvas</h2>
          <p>
            Safari won&apos;t SVG-filter a live video or canvas, so each runs on one WebGL
            renderer that samples the source and draws its lenses. Move the pointer over
            the canvas to steer it.
          </p>
        </header>
        <div className="grid">
          <div className="card tall">
            <div className="preview">
              <GlassVideoControls src={VIDEO_SRC} />
            </div>
            <div className="card-info">
              <h3>Video player</h3>
              <p>Each transport control is a lens bending the live video</p>
            </div>
          </div>
          <div className="card tall">
            <div className="preview">
              <GlassCanvas />
            </div>
            <div className="card-info">
              <h3>Canvas</h3>
              <p>A lens roaming over a generative canvas scene</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Components ── */}
      <section className="section">
        <header className="section-header">
          <h2>Components</h2>
          <p>
            Frosted glass panels that truly refract the wallpaper behind them, not a flat
            backdrop blur. Set the background once; content sits crisp on top.
          </p>
        </header>
        <div className="grid">
          <div className="card tall">
            <div className="preview no-pad">
              <GlassNotification />
            </div>
            <div className="card-info">
              <h3>Notification</h3>
              <p>A frosted glass card over a wallpaper</p>
            </div>
          </div>
          <div className="card tall">
            <div className="preview no-pad">
              <GlassContextMenu />
            </div>
            <div className="card-info">
              <h3>Context menu</h3>
              <p>A glass menu over a wallpaper; right-click to move it</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Controls ── */}
      <section className="section">
        <header className="section-header">
          <h2>Controls</h2>
          <p>
            Interactive controls where the moving part dissolves into a lens that bends
            the track through it.
          </p>
        </header>
        <div className="grid">
          <div className="card">
            <div className="preview">
              <GlassSwitch
                checked={switchOn}
                onCheckedChange={setSwitchOn}
                width={74}
                height={30}
                activeColor="#0a84ff"
                trackColor="#3a3a3c"
              />
            </div>
            <div className="card-info">
              <h3>Switch</h3>
              <p>Press or drag, and the pill melts into a lens</p>
            </div>
          </div>
          <div className="card">
            <div className="preview">
              <GlassSlider
                value={sliderVal}
                onValueChange={setSliderVal}
                width={340}
                thumbHeight={22}
                activeColor="#0a84ff"
                trackColor="#3a3a3c"
              />
            </div>
            <div className="card-info">
              <h3>Slider</h3>
              <p>The thumb bends the fill through it</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
