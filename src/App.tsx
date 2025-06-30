import './App.css'

function App() {
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="nav">
          <h2 className="brand">Azure AI Foundry</h2>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#docs">Documentation</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Strike Gold with Azure AI Foundry</h1>
          <p className="hero-subtitle">
            Transform your AI ideas into powerful solutions with Azure's comprehensive AI development platform
          </p>
          
          {/* Logo Transformation */}
          <div className="logo-container">
            <div className="logos-display">
              <div className="logo-section">
                <img 
                  src="/aifoundry.svg" 
                  alt="Azure AI Foundry" 
                  className="logo-blue"
                />
                <p className="logo-text">🔧 Forge Your AI Solutions</p>
              </div>
              <div className="transformation-arrow">
                <span className="arrow">→</span>
              </div>
              <div className="logo-section">
                <img 
                  src="/aifoundry-gold.svg" 
                  alt="Azure AI Foundry Gold" 
                  className="logo-gold"
                />
                <p className="logo-text">✨ Strike Gold with AI Innovation</p>
              </div>
            </div>
          </div>

          <div className="cta-buttons">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-secondary">View Demos</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>Why Choose Azure AI Foundry?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Rapid Development</h3>
              <p>Build and deploy AI models faster with pre-built templates and integrated tools</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Built-in security, compliance, and governance for enterprise-grade AI solutions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>High Performance</h3>
              <p>Leverage Azure's global infrastructure for scalable, high-performance AI workloads</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Model Catalog</h3>
              <p>Access cutting-edge models from OpenAI, Hugging Face, and Microsoft Research</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="demo">
        <div className="container">
          <h2>Experience AI Foundry</h2>
          <p>Try our interactive demos to see the power of Azure AI Foundry in action</p>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>AI Foundry with key-less authentication</h3>
              <p>Integrate AI Foundry with key-less authentication into a simple HTML page. Complete JavaScript-only solution.</p>
              <button className="btn btn-outline">Try Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Serge van den Oever. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Support</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
