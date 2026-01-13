export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold text-success" href="#">
            <i className="bi bi-cloud-sun me-2"></i>
            Demeter
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Climate Alerts</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Farm Protection</a>
              </li>
            </ul>
            <div className="d-flex">
              <a href="/login" className="btn btn-outline-success me-2">
                Sign In
              </a>
              <a href="/register" className="btn btn-success">
                Join Now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Protect Your Farm From <span className="text-success">Climate Threats</span>
              </h1>
              <p className="lead mb-4">
                Advanced flood and drought predictions to safeguard your agricultural livelihood against extreme weather events.
              </p>
              <div className="d-flex gap-3">
                <a href="/register" className="btn btn-success btn-lg px-4">
                  Get Protected <i className="bi bi-shield-check ms-2"></i>
                </a>
                <a href="#demo" className="btn btn-outline-success btn-lg px-4">
                  See How It Works
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                alt="Farmer checking weather on tablet" 
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Your Climate Defense System</h2>
            <p className="text-muted lead">Early warnings and actionable insights</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 mb-3" style={{width: '60px'}}>
                    <i className="bi bi-cloud-rain-heavy fs-4"></i>
                  </div>
                  <h5 className="fw-bold">Flood Prediction</h5>
                  <p className="text-muted">
                    Get 72-hour advanced warnings of potential flooding with 90% accuracy to protect your crops and livestock.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 mb-3" style={{width: '60px'}}>
                    <i className="bi bi-droplet fs-4"></i>
                  </div>
                  <h5 className="fw-bold">Drought Monitoring</h5>
                  <p className="text-muted">
                    Soil moisture tracking and drought risk assessments to optimize irrigation and prevent crop failure.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 mb-3" style={{width: '60px'}}>
                    <i className="bi bi-tree fs-4"></i>
                  </div>
                  <h5 className="fw-bold">Crop Protection</h5>
                  <p className="text-muted">
                    Personalized recommendations to shield your specific crops from upcoming climate threats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-5 bg-success text-white">
        <div className="container py-5 text-center">
          <h2 className="fw-bold mb-4">Don't Let Climate Surprises Ruin Your Harvest</h2>
          <p className="lead mb-4 opacity-75">
            Join 15,000+ farmers protecting their livelihoods with our early warning system.
          </p>
          <a href="/register" className="btn btn-light btn-lg px-5">
            Start Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 bg-dark text-white">
        <div className="container py-4">
          <div className="row">
            <div className="col-lg-3 mb-4">
              <h5 className="fw-bold mb-3">AgriShield</h5>
              <p className="text-muted">
                Climate resilience for the agricultural community.
              </p>
            </div>
            <div className="col-lg-3 mb-4">
              <h6 className="fw-bold mb-3">Solutions</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Flood Protection</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Drought Alerts</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Crop Planning</a></li>
              </ul>
            </div>
            <div className="col-lg-3 mb-4">
              <h6 className="fw-bold mb-3">Resources</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Farmer Stories</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Climate Research</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Mobile Alerts</a></li>
              </ul>
            </div>
            <div className="col-lg-3 mb-4">
              <h6 className="fw-bold mb-3">Company</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">About Us</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Contact</a></li>
                <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Partnerships</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-4 bg-secondary"/>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-0 text-muted">© {new Date().getFullYear()} AgriShield. Protecting farmers worldwide.</p>
            <div className="d-flex mt-3 mt-md-0">
              <a href="#" className="text-white me-3"><i className="bi bi-whatsapp"></i></a>
              <a href="#" className="text-white me-3"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white"><i className="bi bi-envelope"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}