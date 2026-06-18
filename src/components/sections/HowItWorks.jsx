const steps = [
  {
    num: '01',
    icon: '📋',
    title: 'Enter Requirements',
    desc: 'Fill our Quick Design Wizard — property type, area, rooms, budget and preferred style.',
    tag: 'You do this',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'AI Creates Design',
    desc: 'Our AI engine generates 3D design concepts, BOQ, material palette and cost estimate instantly.',
    tag: 'AI powered',
  },
  {
    num: '03',
    icon: '👨‍🎨',
    title: 'Expert Designer Reviews',
    desc: 'A senior designer — backed by 50+ years of engineering experience — refines the AI output and adds professional touch.',
    tag: '50+ yrs expertise',
  },
  {
    num: '04',
    icon: '✅',
    title: 'You Approve Design',
    desc: 'Review your 3D design, tweak materials and furniture, then approve to lock in the final plan.',
    tag: 'Your control',
  },
  {
    num: '05',
    icon: '🏭',
    title: 'Manufacturing',
    desc: 'Your approved design goes into our precision manufacturing unit. Track production status in real-time.',
    tag: 'In-house factory',
  },
  {
    num: '06',
    icon: '🔧',
    title: 'Installation & Handover',
    desc: 'Our certified installation team fits everything on-site. Final walkthrough, warranty and after-care included.',
    tag: 'Warranty included',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-label">Simple Process</span>
          <h2 className="section-title mt-3 mb-4">
            How El Shaddai Works
          </h2>
          <p className="font-body text-stone-500 max-w-xl mx-auto text-sm leading-relaxed">
            From your first idea to the final installation — our AI platform + veteran engineering team handles every step seamlessly.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white rounded-sm border border-stone-100 p-7 hover:border-gold-300 hover:shadow-lg hover:shadow-gold-100 transition-all duration-300 group">
              {/* Step number */}
              <div className="absolute -top-4 -left-2 font-display text-7xl font-light text-stone-100 group-hover:text-gold-100 transition-colors duration-300 select-none leading-none">
                {step.num}
              </div>

              {/* Icon */}
              <div className="relative mb-4 text-3xl">{step.icon}</div>

              {/* Tag */}
              <span className="inline-block text-[10px] tracking-[0.2em] uppercase font-body font-semibold text-gold-500 bg-gold-50 px-2.5 py-1 rounded-sm mb-3">
                {step.tag}
              </span>

              <h3 className="font-display text-xl text-navy-950 font-medium mb-2">{step.title}</h3>
              <p className="font-body text-sm text-stone-500 leading-relaxed">{step.desc}</p>

              {/* Arrow connector (not on last column items) */}
              {i < steps.length - 1 && (i + 1) % 3 !== 0 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 4l6 6-6 6" stroke="#d4941f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <a href="#design-wizard" className="btn-gold px-10 py-4">
            Start My Design Journey ✦
          </a>
          <p className="font-body text-xs text-stone-400 mt-4">Average project: 3–6 weeks from design approval to installation</p>
        </div>
      </div>
    </section>
  )
}
