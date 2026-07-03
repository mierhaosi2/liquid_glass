import { useState } from 'react'
import './App.css'
import blueImg from './assets/background/blue.jpg'
import beautifulImg from './assets/background/big-beautiful.png'
import { GlassSwitch } from './GlassSwitch'
import { GlassSlider } from './GlassSlider'
import { GlassNotification } from './GlassNotification'
import { GlassContextMenu } from './GlassContextMenu'
import { GlassCanvas } from './GlassCanvas'

function App() {
  const [switchOn, setSwitchOn] = useState(true)
  const [sliderVal, setSliderVal] = useState(65)

  return (
    <div className="page">
      {/* ── 视频与画布 ── */}
      <section className="section section-canvas">
        <header className="section-header">
          <h2>视频与画布</h2>
          <p>
            Safari 无法对实时视频或画布进行 SVG 滤镜处理，因此每个组件独立运行一个
            WebGL 渲染器来采样内容并绘制镜头。移动鼠标即可控制画布中的镜头位置。
          </p>
        </header>
        <div className="grid">
          <div className="card tall">
            <div className="preview">
              <GlassCanvas />
            </div>
            <div className="card-info">
              <h3>画布</h3>
              <p>一个在生成艺术画布上漫游的玻璃镜头</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 面板组件 ── */}
      <section className="section section-panel">
        <header className="section-header">
          <h2>面板组件</h2>
          <p>
            真正折射背后壁纸的磨砂玻璃面板，而非普通的背景模糊。
            只需设置一次背景，内容就会清晰地呈现在玻璃上方。
          </p>
        </header>
        <div className="grid">
          <div className="card tall">
            <div className="preview no-pad">
              <GlassNotification wallpaper={`url(${blueImg}) center/cover no-repeat`} />
            </div>
            <div className="card-info">
              <h3>通知卡片</h3>
              <p>悬浮在壁纸上的磨砂玻璃通知面板</p>
            </div>
          </div>
          <div className="card tall">
            <div className="preview no-pad">
              <GlassContextMenu wallpaper={`url(${beautifulImg}) center/cover no-repeat`} />
            </div>
            <div className="card-info">
              <h3>右键菜单</h3>
              <p>悬浮在壁纸上的玻璃菜单，右键单击可移动位置</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 交互控件 ── */}
      <section className="section section-controls">
        <header className="section-header">
          <h2>交互控件</h2>
          <p>
            按下时移动部件融化成玻璃镜头，透过镜头折射出轨道内容。
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
                activeColor="#1db8ff"
                trackColor="#0d1f33"
              />
            </div>
            <div className="card-info">
              <h3>开关</h3>
              <p>按下或拖动，白色药丸融化成玻璃镜头</p>
            </div>
          </div>
          <div className="card">
            <div className="preview">
              <GlassSlider
                value={sliderVal}
                onValueChange={setSliderVal}
                width={340}
                thumbHeight={22}
                activeColor="#a259ff"
                trackColor="#2a1f3d"
              />
            </div>
            <div className="card-info">
              <h3>滑块</h3>
              <p>拖动时滑块折射出填充轨道的颜色</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
