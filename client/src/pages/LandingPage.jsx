import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PixelCard from '../components/PixelCard';

const deviceTypes = [
  { title: 'Phones', icon: 'phone', accent: '#2588ce', summary: 'Keep screen, battery, and repair history together.', details: 'Track purchase date, warranty, battery replacements, screen repairs, and what each fix cost.' },
  { title: 'Laptops', icon: 'laptop', accent: '#4774d1', summary: 'Know what has changed inside your computer.', details: 'Save model and serial details, upgrades, service visits, parts, and invoices in one timeline.' },
  { title: 'Tablets & e-readers', icon: 'tablet', accent: '#775cc8', summary: 'Keep portable screens and reading devices covered.', details: 'Store purchase proof, case or accessory details, warranty dates, and repair notes.' },
  { title: 'Watches & wearables', icon: 'watch', accent: '#179c9a', summary: 'Follow the life of the tech you wear every day.', details: 'Record battery service, strap replacements, water damage checks, and coverage.' },
  { title: 'Cameras', icon: 'camera', accent: '#d78336', summary: 'Keep gear details ready before your next shoot.', details: 'Track camera bodies, lenses, sensors, shutter service, accessories, and repair costs.' },
  { title: 'Gaming & audio', icon: 'headphones', accent: '#cf5c76', summary: 'Log consoles, controllers, speakers, and headphones.', details: 'Remember repairs, drift fixes, battery swaps, warranties, and the accessories that belong together.' },
  { title: 'Home electronics', icon: 'home', accent: '#598d54', summary: 'Bring TVs, monitors, and smart-home gear into the same record.', details: 'Add model numbers, setup dates, service calls, warranty coverage, and household ownership notes.' }
];

const benefits = [
  { title: 'A passport for every item', icon: 'passport', accent: '#2588ce', summary: 'One timeline from purchase to repair.', details: 'Keep the serial number, purchase proof, warranty, and service history attached to the device.' },
  { title: 'Understand repair spend', icon: 'chart', accent: '#4774d1', summary: 'See what each repair really adds up to.', details: 'Review repair costs over time and compare them with the original purchase price.' },
  { title: 'Catch the dates that matter', icon: 'calendar', accent: '#179c9a', summary: 'Keep warranty dates in view.', details: 'Save expiry dates beside each item so you can check coverage before paying for a repair.' }
];

function CategoryIcon({ name }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const drawings = {
    phone: <><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4M11 18.5h2"/></>,
    laptop: <><rect x="5" y="3.5" width="14" height="12" rx="1.5"/><path d="M2.5 19h19l-2-3H4.5l-2 3Z"/></>,
    tablet: <><rect x="4.5" y="2.5" width="15" height="19" rx="2"/><path d="M10.5 18.5h3"/></>,
    watch: <><rect x="7" y="6" width="10" height="12" rx="3"/><path d="m9 2 1 4m5-4-1 4m-5 12-1 4m5-4 1 4M10 10h4v4h-4z"/></>,
    camera: <><path d="M3 8h4l1.5-2h7L17 8h4v11H3z"/><circle cx="12" cy="13.5" r="3.5"/></>,
    headphones: <><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="7" rx="2"/><rect x="17" y="12" width="4" height="7" rx="2"/><path d="M17 19a4 4 0 0 1-4 3h-1"/></>,
    home: <><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/></>,
    passport: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/></>,
    chart: <><path d="M4 20V4m0 16h17"/><path d="m7 15 4-4 3 2 5-7"/><path d="M16 6h3v3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h2m4 0h2m-8 3h2"/></>
  };
  return <svg className="landing-card-icon" viewBox="0 0 24 24" aria-hidden="true" {...common}>{drawings[name]}</svg>;
}

function InteractiveCard({ item, index, expanded, onToggle, kind }) {
  return (
    <PixelCard
      className={`landing-pixel-card${expanded ? ' is-expanded' : ''}`}
      theme="light"
      colors={['#eaf6ff', '#9bd6ff', item.accent]}
      glowColor={item.accent}
      pixelSize={2}
      gap={5}
      speed={34}
      revealDuration={650}
      spotlight={0.55}
      glow={0.55}
      opacity={0.45}
      fade={0.72}
      trigger="hover"
      clickPulse
      intro
      radius={22}
    >
      <article className="landing-interactive-card" style={{ '--landing-accent': item.accent }}>
        <div className="landing-card-topline"><span>{kind === 'device' ? `DEVICE ${String(index + 1).padStart(2, '0')}` : 'FIXLEDGER'}</span><span className="landing-card-arrow" aria-hidden="true">↗</span></div>
        <div className="landing-card-icon-wrap"><CategoryIcon name={item.icon} /></div>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <button className="landing-card-toggle" type="button" aria-expanded={expanded} onClick={onToggle}>
          {expanded ? 'Show less' : 'Explore details'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
        {expanded && <div className="landing-card-detail"><span>WHAT YOU CAN SAVE</span><p>{item.details}</p></div>}
      </article>
    </PixelCard>
  );
}

export default function LandingPage() {
  const [expandedCard, setExpandedCard] = useState('');
  const toggleCard = key => setExpandedCard(current => current === key ? '' : key);
  return (
    <>
      <section className="landing-video" aria-label="FixLedger animated landing background">
        <video
          className="landing-video-media"
          src="/horizon-recording.mp4"
          poster="/horizon-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="landing-video-shade" aria-hidden="true" />
      </section>

      <section className="landing-details" aria-labelledby="landing-details-title">
        <div className="container landing-details-inner">
          <div className="landing-details-heading">
            <div>
              <span className="landing-kicker">YOUR REPAIR HISTORY, ORGANIZED</span>
              <h1 id="landing-details-title">Know the story behind every device.</h1>
              <p>Keep purchases, repairs, warranties, and costs together in one simple place.</p>
            </div>
            <Link to="/signup" className="btn btn-primary btn-lg">Create your free account <span aria-hidden="true">↗</span></Link>
          </div>

          <div className="landing-section-intro">
            <span className="landing-kicker">MORE THAN PHONES</span>
            <h2>All your electronics. One clear history.</h2>
            <p>Pick a category to see the details you can keep organized.</p>
          </div>
          <div className="landing-feature-grid landing-device-grid">
            {deviceTypes.map((item, index) => <InteractiveCard key={item.title} kind="device" item={item} index={index} expanded={expandedCard === `device-${index}`} onToggle={() => toggleCard(`device-${index}`)} />)}
          </div>
          <div className="landing-section-intro landing-benefit-intro">
            <span className="landing-kicker">A LITTLE MORE CONTROL</span>
            <h2>Useful at every step of ownership.</h2>
          </div>
          <div className="landing-feature-grid landing-benefit-grid">
            {benefits.map((item, index) => <InteractiveCard key={item.title} kind="benefit" item={item} index={index} expanded={expandedCard === `benefit-${index}`} onToggle={() => toggleCard(`benefit-${index}`)} />)}
          </div>
          <div className="landing-bottom-cta">
            <div><span className="landing-kicker">START WITH WHAT YOU OWN</span><h2>Give every device a better memory.</h2><p>Add phones, computers, cameras, and the rest of your everyday tech.</p></div>
            <Link to="/signup" className="btn btn-primary btn-lg">Build your device library <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
