import { useState } from 'react'
import ApiService from '../services/api'

export default function HelpPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg('Please fill out both subject and message.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await ApiService.submitQuery(subject, message);
      setSuccessMsg('Your request has been submitted successfully to the admin team!');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit the request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
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

          <div className="card shadow-sm mb-5" style={{ borderRadius: '15px' }}>
            <div className="card-header bg-primary text-white p-4" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <h4 className="fw-bold mb-1">Send a Request / Query</h4>
              <p className="mb-0 text-white-50">Want a new blog post? Have a feature request? Let our admin know!</p>
            </div>
            <div className="card-body p-4">
              {successMsg && <div className="alert alert-success">{successMsg}</div>}
              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label fw-bold">Subject</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="subject" 
                    placeholder="E.g., Suggestion for a blog post"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="form-label fw-bold">Message</label>
                  <textarea 
                    className="form-control" 
                    id="message" 
                    rows="4" 
                    placeholder="Describe your query or request here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="mb-1">Our support team is also available via email.</p>
            <a href="mailto:support@constitutiongpt.in" className="btn btn-outline-secondary btn-sm px-3 fw-bold">Contact Support Alternatively</a>
          </div>

          <div className="mt-5 pt-4 text-center border-top">
            <p className="small text-muted mb-0">ConstitutionGPT v2.0 - Empowering Citizens with Legal Clarity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
