'use client';

import { useEffect } from 'react';

export default function LaunchPage() {
  useEffect(() => {
    document.body.style.cssText = 'margin:0;padding:0;background:#000;color:#fff;overflow-x:hidden;font-family:-apple-system,SF Pro Display,Helvetica Neue,Arial,sans-serif;';
    document.documentElement.style.cssText = 'scroll-behavior:smooth;';

    // Particles
    const canvas = document.getElementById('bgCanvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      if (ctx) {
        function rsz() { canvas.width = innerWidth; canvas.height = innerHeight; }
        rsz(); addEventListener('resize', rsz);
        const ps: any[] = [];
        for (let i = 0; i < 50; i++) ps.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15, r: Math.random()*1.2+0.3, o: Math.random()*0.15+0.02 });
        function lp() {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ps.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255,255,255,' + p.o + ')'; ctx.fill();
          });
          requestAnimationFrame(lp);
        }
        lp();
      }
    }

    // Dashboard bars
    const ch = document.getElementById('s7-c');
    if (ch) {
      for (let i = 0; i < 28; i++) {
        const b = document.createElement('div');
        b.className = 'dash-bar';
        b.style.background = i < 18 ? '#4A7B5F' : '#8B9DAF';
        b.style.opacity = '0.5';
        b.style.height = '0px';
        ch.appendChild(b);
      }
    }

    // IntersectionObserver — add 'visible' class to sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Animate dashboard bars
          if (entry.target.id === 's7') {
            const bars = entry.target.querySelectorAll('.dash-bar');
            bars.forEach((bar: Element, i: number) => {
              setTimeout(() => {
                (bar as HTMLElement).style.height = (15 + Math.random() * 110) + 'px';
                (bar as HTMLElement).style.transition = 'height 0.6s ease';
              }, 200 + i * 20);
            });
          }
          // Animate map dots
          if (entry.target.id === 's8') {
            const dots = entry.target.querySelectorAll('.map-dot');
            dots.forEach((dot: Element, i: number) => {
              setTimeout(() => {
                (dot as HTMLElement).style.transform = 'scale(1)';
                (dot as HTMLElement).style.opacity = '1';
                (dot as HTMLElement).style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
              }, 200 + i * 120);
            });
            const labels = entry.target.querySelectorAll('.map-label');
            labels.forEach((label: Element, i: number) => {
              setTimeout(() => {
                (label as HTMLElement).style.opacity = '1';
                (label as HTMLElement).style.transition = 'opacity 0.3s';
              }, 400 + i * 120);
            });
          }
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.lc-section').forEach(s => observer.observe(s));

    // Progress dots
    const secs = document.querySelectorAll('.lc-section');
    const dc = document.getElementById('progressDots');
    if (dc) {
      secs.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'pdot';
        dc.appendChild(d);
        d.addEventListener('click', () => secs[i].scrollIntoView({ behavior: 'smooth' }));
      });
    }

    // Scroll listener
    addEventListener('scroll', () => {
      const h = document.getElementById('scrollHint');
      if (h) { if (scrollY > 100) h.classList.add('hidden'); else h.classList.remove('hidden'); }
      const ds = document.querySelectorAll('.pdot');
      const sp = scrollY + innerHeight / 2;
      secs.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const c = r.top + scrollY + r.height / 2;
        if (Math.abs(sp - c) < innerHeight / 2) {
          ds.forEach(d => d.classList.remove('active'));
          if (ds[i]) ds[i].classList.add('active');
        }
      });
    });

    // Auto-reveal first section
    const s1 = document.getElementById('s1');
    if (s1) s1.classList.add('visible');
  }, []);

  return (
    <>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#000!important;color:#fff!important;overflow-x:hidden;font-family:-apple-system,SF Pro Display,Helvetica Neue,Arial,sans-serif!important}
        #bgCanvas{position:fixed;inset:0;z-index:0;opacity:0.5;pointer-events:none}
        .grid-bg{position:fixed;inset:0;z-index:1;background-image:linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px);background-size:60px 60px;pointer-events:none}
        .glow{position:fixed;border-radius:50%;filter:blur(120px);z-index:1;pointer-events:none;transition:all 1.5s ease}
        .lc-section{position:relative;z-index:10;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:0 40px}
        
        /* Animation system — content visible by default, enhanced when .visible */
        .lc-section .anim-item{opacity:0;transform:translateY(30px);transition:opacity 0.8s ease,transform 0.8s ease}
        .lc-section.visible .anim-item{opacity:1;transform:translateY(0)}
        .lc-section.visible .anim-item:nth-child(1){transition-delay:0.1s}
        .lc-section.visible .anim-item:nth-child(2){transition-delay:0.2s}
        .lc-section.visible .anim-item:nth-child(3){transition-delay:0.3s}
        .lc-section.visible .anim-item:nth-child(4){transition-delay:0.4s}
        .lc-section.visible .anim-item:nth-child(5){transition-delay:0.5s}
        .lc-section.visible .anim-item:nth-child(6){transition-delay:0.6s}
        .lc-section.visible .anim-item:nth-child(7){transition-delay:0.7s}
        .lc-section.visible .anim-item:nth-child(8){transition-delay:0.8s}
        .lc-section.visible .anim-item:nth-child(9){transition-delay:0.9s}
        
        /* Fallback: show everything after 3s even if JS fails */
        @keyframes forceShow{to{opacity:1;transform:translateY(0)}}
        .anim-item{animation:forceShow 0.5s ease 3s forwards}
        
        .label{font-size:14px;font-weight:600;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.3)}
        .headline{font-size:clamp(40px,7vw,120px);font-weight:700;letter-spacing:-0.04em;line-height:1.05;text-align:center}
        .subhead{font-size:clamp(22px,3vw,44px);font-weight:300;color:rgba(255,255,255,0.4);letter-spacing:-0.02em;text-align:center;max-width:900px}
        .body-text{font-size:clamp(16px,1.5vw,26px);font-weight:300;color:rgba(255,255,255,0.5);line-height:1.7;text-align:center;max-width:800px}
        .stat-big{font-size:clamp(70px,14vw,220px);font-weight:800;letter-spacing:-0.06em;line-height:1}
        .stat-lbl{font-size:clamp(16px,2vw,32px);font-weight:400;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase}
        .scroll-hint{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:50;display:flex;flex-direction:column;align-items:center;gap:8px;transition:opacity 0.5s}
        .scroll-hint.hidden{opacity:0}
        .scroll-hint .text{font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.2)}
        .scroll-hint .line{width:1px;height:40px;background:linear-gradient(to bottom,rgba(255,255,255,0.3),transparent)}
        .cards-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1300px;width:100%}
        .vcard{background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:28px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;transition:all 0.4s}
        .vcard:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.12);transform:translateY(-4px)}
        .vcard .vicon{font-size:32px}.vcard .vname{font-size:16px;font-weight:600;color:#fff}.vcard .vstat{font-size:13px;color:rgba(255,255,255,0.3)}.vcard .vbar{width:28px;height:2px}
        .dash{width:min(1100px,92vw);background:rgba(15,15,15,0.9);border:0.5px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px;backdrop-filter:blur(10px);margin:0 auto}
        .dash-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .dash-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .dash-metric{background:rgba(255,255,255,0.02);border-radius:8px;padding:18px}
        .dash-metric .val{font-size:28px;font-weight:700;color:#fff}
        .dash-metric .lbl{font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.1em;margin-top:4px}
        .dash-chart{height:160px;background:rgba(255,255,255,0.02);border-radius:8px;padding:16px;display:flex;align-items:flex-end;gap:3px}
        .dash-bar{flex:1;border-radius:3px 3px 0 0;min-height:4px}
        .map-container{position:relative;width:500px;height:350px;margin:0 auto}
        .map-dot{position:absolute;width:12px;height:12px;border-radius:50%;transform:scale(0);opacity:0}
        .map-dot::after{content:'';position:absolute;inset:-8px;border-radius:50%;border:1px solid currentColor;opacity:0.3}
        .map-label{position:absolute;font-size:11px;color:rgba(255,255,255,0.4);white-space:nowrap;transform:translateX(-50%);opacity:0}
        .progress-dots{position:fixed;right:24px;top:50%;transform:translateY(-50%);z-index:50;display:flex;flex-direction:column;gap:10px}
        .pdot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.15);transition:all 0.3s;cursor:pointer}
        .pdot.active{background:#8B9DAF;transform:scale(1.5)}
        .research-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1100px;width:100%}
        .rcard{background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:14px;transition:all 0.4s}
        .rcard:hover{border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.04)}
        .rcard .rtag{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.25)}
        .rcard .rtitle{font-size:18px;font-weight:700;color:#fff}
        .rcard .rstats{display:flex;gap:20px}.rcard .rstat{text-align:center}
        .rcard .rstat .rv{font-size:16px;font-weight:700;color:#fff}
        .rcard .rstat .rl{font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase}
        .cta-btn{display:inline-flex;align-items:center;gap:10px;padding:14px 36px;background:#8B9DAF;color:#000;font-size:15px;font-weight:700;border-radius:8px;text-decoration:none;transition:all 0.3s}
        .cta-btn:hover{background:#fff;transform:scale(1.05)}
        .lc-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;background:rgba(0,0,0,0.6);backdrop-filter:blur(20px);border-bottom:0.5px solid rgba(255,255,255,0.05)}
        .lc-nav .logo{font-size:16px;font-weight:700;letter-spacing:-0.02em;color:#fff;text-decoration:none}
        .lc-nav .logo span{color:#8B9DAF}
        .lc-nav .back{font-size:12px;color:rgba(255,255,255,0.4);text-decoration:none;transition:color 0.3s}
        .lc-nav .back:hover{color:#fff}
        @media(max-width:768px){.cards-grid{grid-template-columns:repeat(2,1fr)}.research-grid{grid-template-columns:1fr}.progress-dots{display:none}.dash-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <canvas id="bgCanvas"></canvas>
      <div className="grid-bg"></div>
      <div className="glow" id="glow1" style={{width:'700px',height:'700px',background:'#4A7B5F',top:'20%',left:'15%',opacity:0.06}}></div>
      <div className="glow" id="glow2" style={{width:'500px',height:'500px',background:'#8B9DAF',top:'50%',right:'10%',opacity:0.04}}></div>

      <nav className="lc-nav"><a href="/" className="logo">HARCH<span> CORP</span></a><a href="/" className="back">← Back</a></nav>
      <div className="scroll-hint" id="scrollHint"><span className="text">Scroll</span><div className="line"></div></div>
      <div className="progress-dots" id="progressDots"></div>

      {/* S1 */}
      <div className="lc-section" id="s1"><div style={{textAlign:'center'}}>
        <div className="label anim-item" style={{marginBottom:'28px'}}>Royaume du Maroc</div>
        <div className="headline anim-item">Africa holds<br/><span style={{color:'rgba(255,255,255,0.12)'}}>30% of the world's</span><br/><span style={{color:'rgba(255,255,255,0.12)'}}>mineral reserves.</span></div>
        <div className="subhead anim-item" style={{marginTop:'36px'}}>Yet captures less than 5% of the value chain.</div>
      </div></div>

      {/* S2 */}
      <div className="lc-section" id="s2"><div style={{textAlign:'center'}}>
        <div className="headline anim-item" style={{fontSize:'clamp(36px,5vw,84px)',color:'rgba(255,255,255,0.1)'}}>1.4 billion people.</div>
        <div className="subhead anim-item" style={{marginTop:'28px'}}>The youngest continent on Earth.</div>
        <div className="body-text anim-item" style={{marginTop:'16px'}}><span style={{color:'#4A7B5F'}}>Waiting.</span></div>
      </div></div>

      {/* S3 */}
      <div className="lc-section" id="s3"><div style={{textAlign:'center'}}>
        <div className="label anim-item" style={{marginBottom:'28px'}}>Introducing</div>
        <div className="headline anim-item" style={{fontSize:'clamp(56px,9vw,160px)'}}>HARCH<span style={{color:'#8B9DAF'}}> CORP</span></div>
        <div className="subhead anim-item" style={{marginTop:'20px'}}>Africa's sovereign infrastructure.</div>
      </div></div>

      {/* S4 */}
      <div className="lc-section" id="s4"><div style={{textAlign:'center'}}>
        <div className="label anim-item" style={{marginBottom:'20px'}}>Investment Pipeline</div>
        <div className="stat-big anim-item" style={{color:'#8B9DAF'}}>$2.37B</div>
        <div className="stat-lbl anim-item" style={{marginTop:'14px'}}>Across 7 verticals · 5 countries</div>
        <div className="body-text anim-item" style={{marginTop:'28px'}}>One operating system.</div>
      </div></div>

      {/* S5 */}
      <div className="lc-section" id="s5" style={{flexDirection:'column',gap:'36px'}}>
        <div style={{textAlign:'center'}} className="anim-item">
          <div className="label" style={{marginBottom:'12px'}}>8 Verticals</div>
          <div className="headline" style={{fontSize:'clamp(32px,4vw,56px)'}}>One ecosystem.</div>
        </div>
        <div className="cards-grid">
          {[['Intelligence','1,798 GPUs','#8B9DAF','◈'],['Cement','500kT/yr','#A08878','⬢'],['Energy','2.37 GW','#6B9F6B','⚡'],['Technology','Sovereign','#7888A8','⬡'],['Mining','3 minerals','#A87878','◆'],['Agriculture','25K hectares','#6BAF6B','❋'],['Water','200M m³/yr','#6888A8','◊'],['Finance','Green bonds','#8B9DAF','⬟']].map((v,i) => (
            <div key={i} className="vcard anim-item">
              <div className="vicon" style={{color:v[2]}}>{v[3]}</div>
              <div className="vname">{v[0]}</div>
              <div className="vstat">{v[1]}</div>
              <div className="vbar" style={{background:v[2]}}></div>
            </div>
          ))}
        </div>
      </div>

      {/* S6 */}
      <div className="lc-section" id="s6"><div style={{textAlign:'center'}}>
        <div className="label anim-item" style={{marginBottom:'28px'}}>Carbon Intensity</div>
        <div className="stat-big anim-item" style={{color:'#4A7B5F'}}>48.2</div>
        <div className="stat-lbl anim-item" style={{marginTop:'14px'}}>gCO₂/kWh</div>
        <div className="body-text anim-item" style={{marginTop:'36px'}}>89% below the industry average.</div>
      </div></div>

      {/* S7 */}
      <div className="lc-section" id="s7"><div style={{textAlign:'center',width:'100%'}}>
        <div className="label anim-item" style={{marginBottom:'28px'}}>HarchOS Platform</div>
        <div className="dash anim-item">
          <div className="dash-header"><div style={{fontSize:'18px',fontWeight:600,color:'rgba(255,255,255,0.8)'}}>HarchOS</div><div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#4A7B5F'}}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4A7B5F'}}></span>SIMULATION</div></div>
          <div className="dash-grid">
            <div className="dash-metric"><div className="val">1,798</div><div className="lbl">GPUs</div></div>
            <div className="dash-metric"><div className="val">48.2</div><div className="lbl">gCO₂/kWh</div></div>
            <div className="dash-metric"><div className="val">82.3%</div><div className="lbl">Renewable</div></div>
            <div className="dash-metric"><div className="val">5</div><div className="lbl">Hubs</div></div>
          </div>
          <div className="dash-chart" id="s7-c"></div>
        </div>
      </div></div>

      {/* S8 */}
      <div className="lc-section" id="s8"><div style={{textAlign:'center'}}>
        <div className="label anim-item" style={{marginBottom:'36px'}}>5 Countries</div>
        <div className="map-container">
          <div className="map-dot" id="md1" style={{top:'30%',left:'35%',background:'#4A7B5F',color:'#4A7B5F'}}></div>
          <div className="map-label" style={{top:'24%',left:'35%'}} id="ml1">Morocco</div>
          <div className="map-dot" id="md2" style={{top:'55%',left:'22%',background:'#8B9DAF',color:'#8B9DAF'}}></div>
          <div className="map-label" style={{top:'62%',left:'22%'}} id="ml2">Gambia</div>
          <div className="map-dot" id="md3" style={{top:'65%',left:'42%',background:'#C4964A',color:'#C4964A'}}></div>
          <div className="map-label" style={{top:'73%',left:'42%'}} id="ml3">Senegal</div>
          <div className="map-dot" id="md4" style={{top:'48%',left:'12%',background:'#A87878',color:'#A87878'}}></div>
          <div className="map-label" style={{top:'42%',left:'12%'}} id="ml4">Mauritania</div>
          <div className="map-dot" id="md5" style={{top:'75%',left:'28%',background:'#6888A8',color:'#6888A8'}}></div>
          <div className="map-label" style={{top:'82%',left:'28%'}} id="ml5">Mali</div>
        </div>
      </div></div>

      {/* S9 */}
      <div className="lc-section" id="s9"><div style={{textAlign:'center'}}>
        <div className="stat-big anim-item" style={{color:'#4A7B5F'}}>24,700+</div>
        <div className="stat-lbl anim-item" style={{marginTop:'18px'}}>Jobs by 2030</div>
        <div className="body-text anim-item" style={{marginTop:'28px'}}>Direct employment. Local hiring.</div>
      </div></div>

      {/* S10 */}
      <div className="lc-section" id="s10" style={{flexDirection:'column',gap:'36px'}}>
        <div style={{textAlign:'center'}} className="anim-item">
          <div style={{display:'inline-block',padding:'4px 14px',border:'1px solid #4A7B5F',borderRadius:'4px',fontSize:'11px',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'#4A7B5F',marginBottom:'18px'}}>Phase 1 — Active</div>
          <div className="headline" style={{fontSize:'clamp(36px,5vw,80px)'}}>Harch Research</div>
          <div className="subhead" style={{marginTop:'14px'}}>7 dossiers published. 15+ in production.</div>
        </div>
        <div className="research-grid">
          {[['Energy','Solaire EPC B2B','24%','3.2y','8.5'],['Digital','MRE Services','31%','2.4y','8.1'],['Tourism','Retreat Yoga','19%','4y','7.0']].map((r,i) => (
            <div key={i} className="rcard anim-item">
              <div className="rtag">{r[0]}</div>
              <div className="rtitle">{r[1]}</div>
              <div className="rstats">
                <div className="rstat"><div className="rv">{r[2]}</div><div className="rl">TRI</div></div>
                <div className="rstat"><div className="rv">{r[3]}</div><div className="rl">Payback</div></div>
                <div className="rstat"><div className="rv">{r[4]}</div><div className="rl">Score</div></div>
              </div>
            </div>
          ))}
        </div>
        <a href="/research" className="cta-btn anim-item">Browse all dossiers →</a>
      </div>

      {/* S11 */}
      <div className="lc-section" id="s11"><div style={{textAlign:'center'}}>
        <div className="headline anim-item" style={{fontSize:'clamp(36px,6vw,96px)'}}>Africa doesn't need aid.<br/><span style={{color:'#8B9DAF'}}>It needs infrastructure.</span></div>
        <div className="subhead anim-item" style={{marginTop:'48px',fontSize:'32px',color:'rgba(255,255,255,0.2)'}}>harchcorp.com</div>
        <div className="anim-item" style={{marginTop:'36px'}}><a href="/" className="cta-btn">Explore Harch Corp →</a></div>
      </div></div>
    </>
  );
}
