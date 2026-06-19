import { useState } from 'react'

const faqs = [
  {
    q: 'How does the AI design work?',
    a: "You fill our Quick Design Wizard (takes 2 minutes) with your property type, area, rooms, budget and style preference. Our AI engine instantly generates multiple 3D design concepts including furniture layout, material palette, lighting plan and cost estimate. A senior designer — with 50+ years of expertise — then reviews and refines the AI output before presenting it to you.",
  },
  {
    q: 'How much does an El Shaddai interior project cost?',
    a: "Costs depend on area, number of rooms and material quality. A typical 2BHK apartment (1000–1200 sq ft) with premium finishes ranges from ₹8–14 Lakhs. Use our Cost Estimator for an instant personalised figure. All prices include design, manufacturing, installation and a 5-year warranty.",
  },
  {
    q: 'Can I modify the AI-generated design?',
    a: "Absolutely. The AI design is your starting point, not the final word. After the initial generation, you can change materials, swap furniture, adjust layouts and modify any room in our interactive 3D viewer. Our designer is available for video calls to walk through changes. You only approve when you're 100% happy.",
  },
  {
    q: 'How long does the entire process take?',
    a: "AI design generation: instant. Designer review and client approval: 3–5 days. Manufacturing: 14–21 days. Installation: 5–10 days depending on project size. Total: typically 4–6 weeks from approval to handover. Rush projects (with premium) can be completed in 3 weeks.",
  },
  {
    q: 'Do you manufacture your own furniture?',
    a: "Yes. We have our own in-house manufacturing unit with CNC precision machinery. This means zero middlemen, tighter quality control, faster delivery and direct warranty on every piece. Your design goes directly from our screen to our factory floor.",
  },
  {
    q: 'What is included in the 5-year warranty?',
    a: "All manufactured items (modular kitchen, wardrobes, TV units, etc.) carry a 5-year structural warranty against defects. Installation workmanship is warranted for 2 years. False ceiling and civil work carry a 1-year warranty. We also include a free annual maintenance visit in Year 1.",
  },
  {
    q: 'Do you work outside Hyderabad?',
    a: "Currently we operate in Hyderabad, Secunderabad, Warangal, Nizamabad, Karimnagar, Bangalore, Mumbai, Pune and more cities. We are expanding rapidly. Enter your city in the consultation form and we will confirm availability.",
  },
  {
    q: 'Is there a cost for the initial AI design brief?',
    a: "The Quick Design Wizard and initial AI design brief are completely free. No credit card, no commitment. You only pay when you formally approve the final design and sign the project agreement.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="py-24 bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-label">FAQ</span>
          <h2 className="section-title mt-3 mb-4">
            Questions We Get Asked
          </h2>
          <p className="font-body text-stone-500 text-sm">
            Can't find your answer? <a href="#contact" className="text-gold-600 hover:underline font-semibold">Talk to our team →</a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`border rounded-sm overflow-hidden transition-all duration-300 ${open === i ? 'border-navy-200 shadow-md shadow-navy-100' : 'border-stone-200 bg-white'}`}>
              <button
                className="w-full text-left flex items-center justify-between px-6 py-5 gap-4"
                onClick={() => setOpen(open === i ? -1 : i)}>
                <span className={`font-body text-sm font-semibold transition-colors duration-200 ${open === i ? 'text-navy-800' : 'text-stone-700'}`}>
                  {faq.q}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${open === i ? 'bg-navy-900 border-navy-900 rotate-45' : 'bg-white border-stone-300'}`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke={open === i ? 'white' : '#78716c'} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-400 ${open === i ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-6 pb-5 border-t border-stone-100 pt-4">
                  <p className="font-body text-sm text-stone-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 bg-navy-950 rounded-sm">
          <h3 className="font-display text-2xl text-white font-light mb-2">Still have questions?</h3>
          <p className="font-body text-white/50 text-sm mb-5">Our team is available Mon–Sat, 9 AM – 7 PM IST.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:contactus@divinemercyitsol.com" className="btn-gold px-7 py-3 text-sm">✉️ Email Us</a>
            <a href="#contact" className="btn-outline-light px-7 py-3 text-sm">Book Consultation</a>
          </div>
        </div>
      </div>
    </section>
  )
}
