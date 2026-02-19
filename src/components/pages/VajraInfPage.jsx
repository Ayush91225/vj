import { Rocket, ChartLine, Lightning, Users, ArrowRight, CheckCircle, Cpu, Clock, Coins, Gauge, Brain, Database, Shield } from 'phosphor-react';
import './VajraInfPage.css';

export const VajraInfPage = () => {
  return (
    <div className="vajrainf-page">
      <article className="blog-content">
        {/* Hero Section */}
        <header className="blog-header">
          <div className="header-badge">MLOps Infrastructure Platform</div>
          <h1>VajraINF</h1>
          <p className="blog-subtitle">Lambda for MLOps and Inferencing</p>
          <p className="hero-description">
            The serverless GPU orchestration system for Large Language Models and Machine Learning workloads.
            Pay only for active compute time—no idle GPUs, no wasted budget.
          </p>
          <button className="cta-button">
            Get Started <ArrowRight size={18} weight="bold" />
          </button>
        </header>

        {/* Introduction */}
        <section className="blog-section intro-section">
          <h2>What is VajraINF?</h2>
          <p className="large-text">
            VajraINF is a serverless GPU orchestration system engineered specifically for Large Language Model (LLM) workloads. 
            Inspired by the transformative, pay-per-use execution model of AWS Lambda, VajraINF tackles the biggest hurdles in modern AI infrastructure.
          </p>
          <p>
            If you're building AI applications, you likely know the pain of provisioning dedicated GPUs that sit idle 80% of the time, bleeding your runway. 
            Traditional GPU deployments suffer from catastrophic under-utilization, exorbitant operational costs, and the dreaded cold-start latency that makes real-time AI interactions nearly impossible.
          </p>
          <p>
            VajraINF democratizes access to massive models by providing enterprise-grade isolation, massive multi-tenancy, and truly economic serverless computing. 
            Think AWS Lambda, but purpose-built for ML and LLM workloads.
          </p>
        </section>

        {/* Key Metrics */}
        <section className="blog-section metrics-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon"><Clock size={32} weight="duotone" /></div>
              <div className="metric-value">650ms</div>
              <div className="metric-label">Cold start for 70B models</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><Users size={32} weight="duotone" /></div>
              <div className="metric-value">100+</div>
              <div className="metric-label">Concurrent tenants per GPU</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><Gauge size={32} weight="duotone" /></div>
              <div className="metric-value">85%</div>
              <div className="metric-label">GPU utilization rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><Coins size={32} weight="duotone" /></div>
              <div className="metric-value">100x</div>
              <div className="metric-label">Cost reduction vs dedicated GPUs</div>
            </div>
          </div>
        </section>

        {/* Cold Start Solution */}
        <section className="blog-section">
          <h2>Smashing the Cold Start: The Frozen Core Architecture</h2>
          <p>
            In traditional LLM deployments, a "cold start" means hauling multi-gigabyte model weights from host memory across the PCIe bus into the GPU's VRAM. 
            For a 70B parameter model, this PCIe bottleneck can easily take anywhere from 2 to over 60 seconds. This completely violates the real-time interaction requirements of production applications.
          </p>
          <p className="highlight-text">
            VajraINF solves this fundamentally through a Frozen Core + Hot Adapter paradigm.
          </p>
          
          <div className="architecture-cards">
            <div className="arch-card">
              <div className="arch-icon"><Database size={28} weight="duotone" /></div>
              <h3>The Frozen Core</h3>
              <p>
                The massive, immutable weights of your base model (like Llama-3) are loaded once and pinned perpetually in the VRAM. 
                This eliminates the need to repeatedly transfer gigabytes of data across the PCIe bus.
              </p>
            </div>
            <div className="arch-card">
              <div className="arch-icon"><Lightning size={28} weight="duotone" /></div>
              <h3>The Hot Adapter</h3>
              <p>
                Instead of loading full models per user, VajraINF relies on Parameter-Efficient Fine-Tuning (PEFT), specifically Low-Rank Adaptation (LoRA). 
                The platform dynamically injects tiny, tenant-specific LoRA adapters (usually just 10-200 MB) into the active computation graph.
              </p>
            </div>
          </div>

          <p>
            Because injecting a 100MB adapter takes mere milliseconds, VajraINF achieves <strong>sub-500ms cold starts</strong> for billion-parameter LLMs. 
            To be precise, cold-starting a 70B model with a bespoke adapter takes roughly 650ms, while warm starts (when the adapter is already in VRAM) take an astonishing <strong>35-42ms</strong>.
          </p>
        </section>

        {/* Multi-Tenancy */}
        <section className="blog-section">
          <h2>Managing Concurrency: 100 Tenants on a Single GPU</h2>
          <p>
            Traditional GPU virtualization like NVIDIA's Multi-Instance GPU (MIG) physically partitions the hardware, providing strong isolation but severely limiting how many users can share the resource. 
            VajraINF blows past these limits, supporting <strong>50 to 100 concurrent tenants</strong> on a single NVIDIA A100 GPU.
          </p>
          <p>How do we isolate workloads and prevent the "noisy neighbor" problem?</p>

          <div className="isolation-features">
            <div className="isolation-item">
              <Shield size={24} weight="fill" />
              <div>
                <h4>CUDA Stream Isolation</h4>
                <p>
                  Every single tenant request is assigned a dedicated CUDA stream. This means each tenant gets an isolated command queue for kernel submission, 
                  a dedicated memory pool for allocations, and independent event synchronization for progress tracking.
                </p>
              </div>
            </div>
            <div className="isolation-item">
              <Shield size={24} weight="fill" />
              <div>
                <h4>Containerization & Sandboxing</h4>
                <p>
                  On the software and OS level, the infrastructure utilizes Docker for containerization paired with gVisor for secure, strict sandboxing. 
                  This ensures complete tenant isolation at the process level.
                </p>
              </div>
            </div>
            <div className="isolation-item">
              <Shield size={24} weight="fill" />
              <div>
                <h4>Priority Schedulers</h4>
                <p>
                  To ensure inference remains blazingly fast even while training jobs run on the same node, inference requests are given 10x priority and can preempt background training tasks. 
                  Real-time workloads never wait.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Autoscaling */}
        <section className="blog-section">
          <h2>Autoscaling and Predictive Storage</h2>
          <p>
            Serverless implies that you shouldn't have to think about infrastructure. VajraINF's Control Plane, built in Rust and running on Google Cloud Run, 
            orchestrates the entire cluster flawlessly.
          </p>

          <h3>The Adaptive GPU Scheduler</h3>
          <p>
            When a request hits the API Gateway, the system's Scheduler evaluates the entire GPU node pool. It scores candidate GPUs based on whether they already have 
            the required base model loaded, their available VRAM, and tenant affinity (where the user's data naturally lives). If no nodes are suitable, 
            the system automatically provisions a new GPU on the fly.
          </p>

          <h3>Predictive Pre-fetching and the Storage Hierarchy</h3>
          <p>
            To ensure adapters are ready the moment a user asks for them, VajraINF uses workload pattern histories to predict when a tenant will make their next request. 
            Based on this prediction, adapters are moved fluidly through a highly optimized storage hierarchy:
          </p>

          <div className="storage-hierarchy">
            <div className="storage-tier">
              <div className="tier-number">1</div>
              <div className="tier-content">
                <h4>VRAM Cache</h4>
                <p>Active adapters currently in use. Instant access, zero latency.</p>
              </div>
            </div>
            <div className="storage-tier">
              <div className="tier-number">2</div>
              <div className="tier-content">
                <h4>System RAM Cache</h4>
                <p>Prefetched adapters pinned in host memory. Sub-millisecond transfer to VRAM.</p>
              </div>
            </div>
            <div className="storage-tier">
              <div className="tier-number">3</div>
              <div className="tier-content">
                <h4>Local NVMe</h4>
                <p>Fast local storage for recently used models. Millisecond-range loading.</p>
              </div>
            </div>
            <div className="storage-tier">
              <div className="tier-number">4</div>
              <div className="tier-content">
                <h4>GCS Repository</h4>
                <p>Versioned, cold storage in Google Cloud Storage. Complete model history.</p>
              </div>
            </div>
          </div>

          <p>By exploiting tiered storage, the system minimizes data movement latency entirely.</p>
        </section>

        {/* Training & Deployment */}
        <section className="blog-section">
          <h2>Zero-Downtime Deployments & Pay-Per-Gradient Training</h2>
          <p>
            The true magic of VajraINF extends beyond inference into MLOps and continuous training. This is where VajraINF truly shines as an end-to-end ML platform.
          </p>

          <h3>Hot-Swap Training</h3>
          <p>
            Training workflows usually require maintaining persistent state, which breaks standard stateless serverless rules. VajraINF introduces a novel "hot-swap" training mechanism. 
            You can fine-tune an adapter in the background. Once the updated adapter is ready, the system executes an <strong>atomic pointer swap</strong>, replacing the old adapter with the new one in memory.
          </p>
          <p>
            This allows incremental model updates without a single millisecond of service disruption. Your users never experience downtime, even as your models continuously improve.
          </p>

          <h3>Intelligent Training Automation</h3>
          <p>
            VajraINF doesn't just provide infrastructure—it automates the entire ML training and deployment pipeline with intelligent strategies tailored to your specific needs:
          </p>

          <div className="automation-features">
            <div className="auto-feature">
              <Brain size={24} weight="duotone" />
              <div>
                <h4>Model-Aware Optimization</h4>
                <p>Automatically selects the best training strategy based on your model architecture, size, and type (transformer, CNN, etc.)</p>
              </div>
            </div>
            <div className="auto-feature">
              <Brain size={24} weight="duotone" />
              <div>
                <h4>Dataset-Driven Configuration</h4>
                <p>Analyzes your dataset characteristics (size, distribution, modality) to optimize batch sizes, learning rates, and data loading strategies</p>
              </div>
            </div>
            <div className="auto-feature">
              <Brain size={24} weight="duotone" />
              <div>
                <h4>Goal-Oriented Training</h4>
                <p>Whether you're optimizing for accuracy, speed, or cost, VajraINF automatically configures hyperparameters and resource allocation to meet your objectives</p>
              </div>
            </div>
            <div className="auto-feature">
              <Brain size={24} weight="duotone" />
              <div>
                <h4>Scenario-Based Deployment</h4>
                <p>Understands your production requirements (latency, throughput, cost constraints) and deploys with the optimal serving configuration</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Model */}
        <section className="blog-section pricing-section">
          <h2>Granular Billing Economics</h2>
          <p className="large-text">
            AWS Lambda changed the game by charging per 100ms. VajraINF brings this revolutionary pricing model to GPUs.
          </p>

          <div className="pricing-cards">
            <div className="pricing-card">
              <div className="pricing-icon"><Lightning size={32} weight="duotone" /></div>
              <h3>Inference Billing</h3>
              <p>You are billed <strong>per-millisecond</strong> for your actual GPU utilization. No idle time charges, no minimum commitments.</p>
              <div className="pricing-example">Example: 100ms inference = $0.0001</div>
            </div>
            <div className="pricing-card">
              <div className="pricing-icon"><Cpu size={32} weight="duotone" /></div>
              <h3>Training Billing</h3>
              <p>Traditional fine-tuning forces you to pay for idle time between gradient steps. VajraINF introduces <strong>pay-per-gradient billing</strong>. 
              You are exclusively billed for the computational forward and backward passes.</p>
              <div className="pricing-example">Example: 1000 gradients = $0.05</div>
            </div>
          </div>

          <div className="cost-comparison">
            <h3>The Bottom Line</h3>
            <p>
              VajraINF achieves <strong>85% GPU utilization rates</strong> and can deliver up to a <strong>100x cost reduction</strong> for sporadic workloads compared to renting dedicated GPU instances. 
              For continuous workloads, you still save 60-70% while gaining infinite scalability.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="blog-section benefits-section">
          <h2>Why Choose VajraINF?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Zero infrastructure management overhead</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Automatic scaling based on demand</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Built-in security and enterprise-grade isolation</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Cost optimization with smart resource allocation</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Sub-second cold starts for billion-parameter models</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Pay only for active compute time—inference and training</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Automated ML training with intelligent optimization</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={22} weight="fill" />
              <span>Zero-downtime model updates and deployments</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="blog-section cta-section">
          <div className="cta-box">
            <h2>Ready to Transform Your ML Infrastructure?</h2>
            <p>
              Join the next generation of AI companies who are building on VajraINF. 
              Stop paying for idle GPUs. Start paying for results.
            </p>
            <button className="cta-button-large">
              Start Building on VajraINF <ArrowRight size={20} weight="bold" />
            </button>
            <p className="cta-subtext">No credit card required • Free tier available • Deploy in minutes</p>
          </div>
        </section>
      </article>
    </div>
  );
};
