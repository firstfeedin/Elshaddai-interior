import { useState } from 'react'

const materials = [
  { name: 'Teak Wood',    color: '#8B6343', bg: 'bg-amber-800' },
  { name: 'White Oak',    color: '#C8AD8A', bg: 'bg-amber-300' },
  { name: 'Marble Grey',  color: '#9E9E9E', bg: 'bg-gray-400' },
  { name: 'Navy Blue',    color: '#1e3a5f', bg: 'bg-blue-900' },
  { name: 'Forest Green', color: '#2D5016', bg: 'bg-green-900' },
]

const rooms = [
  { label: 'Living Room', img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80' },
  { label: 'Kitchen',     img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80' },
  { label: 'Bedroom',     img: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80' },
]

export default function Visualization3D() {
  const [activeRoom, setActiveRoom]     = useState(0)
  const [activeMat, setActiveMat]       = useState(0)
  const [showAfter, setShowAfter]       = useState(false)
  const [sliderX, setSliderX]           = useState(50)

  return (
    <section id="visualization" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">3D Visualisation</span>
          <h2 className="section-title mt-3 mb-4">
            See It Before We Build It
          </h2>
          <p className="font-body text-stone-500 text-sm max-w-lg mx-auto leading-relaxed">
            Interact with your space in real-time — switch materials, move furniture, compare before and after, all before a single rupee is spent.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Controls panel */}
          <div className="bg-white border border-stone-100 rounded-sm p-6 shadow-sm space-y-7">

            {/* Room selector */}
            <div>
              <p className="text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase mb-3">Select Room</p>
              <div className="space-y-2">
                {rooms.map((r, i) => (
                  <button key={i} onClick={() => setActiveRoom(i)}
                    className={`w-full text-left px-4 py-2.5 rounded-sm text-sm font-body transition-all duration-200 ${
                      activeRoom === i
                        ? 'bg-navy-900 text-white font-medium'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material selector */}
            <div>
              <p className="text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase mb-3">Material Switch</p>
              <div className="grid grid-cols-5 gap-2">
                {materials.map((m, i) => (
                  <button key={i} onClick={() => setActiveMat(i)}
                    title={m.name}
                    className={`w-full aspect-square rounded-sm border-2 transition-all duration-200 ${activeMat === i ? 'border-gold-500 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: m.color }} />
                ))}
              </div>
              <p className="text-xs text-stone-400 font-body mt-2">
                Active: <span className="text-gold-600 font-semibold">{materials[activeMat].name}</span>
              </p>
            </div>

            {/* Feature buttons */}
            <div>
              <p className="text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase mb-3">View Controls</p>
              <div className="grid grid-cols-2 gap-2">
                {['🔄 Rotate', '🔍 Zoom', '🪑 Furniture Edit', '💡 Lighting'].map((btn, i) => (
                  <button key={i}
                    className="px-3 py-2 text-xs font-body bg-stone-50 border border-stone-200 rounded-sm text-stone-600 hover:bg-navy-50 hover:border-navy-200 hover:text-navy-700 transition-all duration-200 text-left">
                    {btn}
                  </button>
                ))}
              </div>
            </div>

            {/* Before / After toggle */}
            <div>
              <p className="text-xs font-body font-semibold text-stone-500 tracking-[0.2em] uppercase mb-3">Compare View</p>
              <div className="flex rounded-sm overflow-hidden border border-stone-200">
                <button onClick={() => setShowAfter(false)}
                  className={`flex-1 py-2 text-xs font-body font-medium transition-colors ${!showAfter ? 'bg-navy-900 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
                  Before
                </button>
                <button onClick={() => setShowAfter(true)}
                  className={`flex-1 py-2 text-xs font-body font-medium transition-colors ${showAfter ? 'bg-gold-500 text-white' : 'bg-white text-stone-500 hover:bg-stone-50'}`}>
                  After
                </button>
              </div>
            </div>

            <a href="#design-wizard" className="btn-gold w-full justify-center text-xs py-3">
              ✦ Start My 3D Design
            </a>
          </div>

          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <div className="relative rounded-sm overflow-hidden shadow-2xl bg-navy-950 aspect-[4/3]">
              <img
                src={rooms[activeRoom].img}
                alt={rooms[activeRoom].label}
                className="w-full h-full object-cover transition-all duration-700"
                style={{ filter: showAfter ? `saturate(1.3) hue-rotate(${activeMat * 20}deg)` : 'grayscale(0.3) brightness(0.85)' }}
              />

              {/* Overlay tint for material */}
              <div className="absolute inset-0 transition-all duration-700 pointer-events-none"
                style={{ backgroundColor: materials[activeMat].color, opacity: showAfter ? 0.12 : 0 }} />

              {/* Before/After badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 text-xs font-body font-semibold rounded-sm ${showAfter ? 'bg-gold-500 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                  {showAfter ? '✦ After — AI Designed' : 'Before'}
                </span>
              </div>

              {/* Room label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="bg-navy-950/70 backdrop-blur-sm px-4 py-2 rounded-sm">
                  <p className="font-body text-white text-xs font-semibold">{rooms[activeRoom].label}</p>
                  <p className="font-body text-white/50 text-[10px]">
                    Material: {materials[activeMat].name}
                  </p>
                </div>
                <div className="bg-navy-950/70 backdrop-blur-sm px-3 py-2 rounded-sm text-right">
                  <p className="font-body text-gold-400 text-xs font-semibold">AI Designed</p>
                  <p className="font-body text-white/50 text-[10px]">El Shaddai Platform</p>
                </div>
              </div>

              {/* Crosshair decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <div className="w-px h-8 bg-white mx-auto" />
                <div className="h-px w-8 bg-white" />
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3 mt-4">
              {rooms.map((r, i) => (
                <button key={i} onClick={() => setActiveRoom(i)}
                  className={`relative rounded-sm overflow-hidden flex-1 aspect-video border-2 transition-all duration-200 img-zoom ${activeRoom === i ? 'border-gold-400' : 'border-transparent hover:border-stone-300'}`}>
                  <img src={r.img} alt={r.label} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-navy-950/40 flex items-end p-2 transition-opacity ${activeRoom === i ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-white text-[10px] font-body">{r.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
