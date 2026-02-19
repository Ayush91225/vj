import { Rocket, ChartLine, Lightning, Users, ArrowRight, CheckCircle } from 'phosphor-react';
import './VajraInfPage.css';

export const VajraInfPage = () => {
  const features = [
    {
      icon: Rocket,
      title: 'Automated Deployments',
      desc: 'Deploy with confidence using our intelligent CI/CD pipeline'
    },
    {
      icon: ChartLine,
      title: 'Real-time Monitoring',
      desc: 'Track performance metrics and system health at a glance'
    },
    {
      icon: Lightning,
      title: 'Scalable Architecture',
      desc: 'Grow from prototype to production seamlessly'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      desc: 'Built-in tools for team management and access control'
    }
  ];

  const benefits = [
    'Zero infrastructure management overhead',
    'Automatic scaling based on demand',
    'Built-in security and compliance',
    'Cost optimization with smart resource allocation'
  ];

  return (
    <div className="vajrainf-page">
      <article className="blog-content">
        <header className="blog-header">
          <div className="header-badge">Infrastructure Platform</div>
          <h1>VajraINF</h1>
          <p className="blog-subtitle">Deploy faster. Scale smarter. Build better.</p>
          <button className="cta-button">
            Get Started <ArrowRight size={18} weight="bold" />
          </button>
        </header>

        <section className="blog-section intro-section">
          <h2>What is VajraINF?</h2>
          <p className="large-text">VajraINF is a cutting-edge infrastructure management platform designed to streamline deployment, monitoring, and scaling of modern applications.</p>
          <p>Built with enterprise-grade reliability and developer-first experience in mind, we handle the complexity so you can focus on building great products.</p>
        </section>

        <section className="blog-section features-section">
          <h2>Powerful Features</h2>
          <div className="feature-list">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="feature-item">
                  <div className="feature-icon-minimal">
                    <Icon size={26} weight="regular" />
                  </div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="blog-section benefits-section">
          <h2>Why Choose VajraINF?</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, i) => (
              <div key={i} className="benefit-item">
                <CheckCircle size={22} weight="fill" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="blog-section cta-section">
          <div className="cta-box">
            <h2>Ready to Transform Your Infrastructure?</h2>
            <p>Join thousands of developers who trust VajraINF for their deployment needs.</p>
            <button className="cta-button-large">
              Use VajraINF <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </section>
      </article>
    </div>
  );
};
