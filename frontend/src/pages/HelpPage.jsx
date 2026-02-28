import React from 'react'

export default function HelpPage() {
  const sections = [
    {
      title: '🎙️ Voice AI Assistant',
      content: 'You can use your voice to ask legal questions. Click the microphone icon in the "Ask AI" page or the chat interface. Say "Start Listening" and speak clearly. The AI will provide citations from the Indian Constitution and BNS/BNSS codes.'
    },
    {
      title: '📅 Booking Consultations',
      content: 'To connect with a lawyer, go to "Connect to Lawyer". Search by name, city, or specialization. Click "Book" on a profile to choose a date and time slot. Your request will appear in "My Appointments" once confirmed.'
    },
    {
      title: '📁 Document Sharing',
      content: 'During a chat with a lawyer, use the paperclip icon to upload legal documents (PDF/Images). This is useful for sharing case files, NOCs, or receiving billing documents from your legal representative.'
    },
    {
      title: '⚖️ Legal Database',
      content: 'The platform is updated with the latest Bharat Nyaya Sanhita (BNS) 2023, BNSS, and BSA codes. All AI responses include verifiable legal citations.'
    }
  ];

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How can we help you?</h2>
            <p className="text-muted">Guides and information for the ConstitutionGPT platform</p>
          </div>

          <div className="row g-4 mb-5">
            {sections.map((section, idx) => (
              <div className="col-md-6" key={idx}>
                <div className="card h-100 shadow-sm border-0 p-3" style={{ borderRadius: '12px' }}>
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-primary mb-3">{section.title}</h5>
                    <p className="card-text text-muted small">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card border-0 shadow-sm bg-primary text-white p-4" style={{ borderRadius: '15px' }}>
            <div className="card-body text-center">
              <h4 className="fw-bold mb-3">Still have questions?</h4>
              <p className="mb-4">Our support team is available for technical assistance.</p>
              <a href="mailto:support@constitutiongpt.in" className="btn btn-light px-4 fw-bold text-primary">Contact Support</a>
            </div>
          </div>

          <div className="mt-5 pt-4 text-center border-top">
            <p className="small text-muted mb-0">ConstitutionGPT v2.0 - Empowering Citizens with Legal Clarity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
