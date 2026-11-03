import React from 'react';
import TechText from './TechText';

export default function TechPageTitle({ text }) {
  return (
    <h1 className="tech-page-heading">
      <span className="sr-only">{text}</span>
      <TechText
        text={text}
        fontWeight={700}
        fontSize={150}
        reveal="letter"
        dashLength={4}
        dashGap={2}
        specks={15}
        intro="none"
        introDuration={2}
        clickKick
        guides={false}
        letterSpacing={-0.05}
        accentColor="#2588ce"
        reach={200}
        softness={0.7}
        lineStyle="dashed"
        strokeWidth={1.5}
        speed={1}
        bounce={0.4}
        selection
        labels={false}
        color="#153b5b"
        align="center"
        draggable
        sweep
        ariaHidden
      />
    </h1>
  );
}
