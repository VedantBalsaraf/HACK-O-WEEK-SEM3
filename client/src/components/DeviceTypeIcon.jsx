import React from 'react';

const drawings = {
  laptop: <><rect x="5" y="3.5" width="14" height="12" rx="1.5"/><path d="M2.5 19h19l-2-3H4.5l-2 3Z"/></>,
  mobile: <><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M10 5h4m-3 13.5h2"/></>,
  tablet: <><rect x="4.5" y="2.5" width="15" height="19" rx="2"/><path d="M10.5 18.5h3"/></>,
  appliance: <><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M5 10h14M8 6v1m0 6v3"/></>,
  wearable: <><rect x="7" y="6" width="10" height="12" rx="3"/><path d="m9 2 1 4m5-4-1 4m-5 12-1 4m5-4 1 4M10 10h4v4h-4z"/></>,
  audio: <><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="7" rx="2"/><rect x="17" y="12" width="4" height="7" rx="2"/></>,
  gaming: <><path d="M7 8h10a4 4 0 0 1 3.8 5l-1 3a2 2 0 0 1-3.2 1l-2-1.5h-5L7.6 17a2 2 0 0 1-3.2-1l-1-3A4 4 0 0 1 7 8Z"/><path d="M8 11v4m-2-2h4m6-.5h.01m2 2h.01"/></>,
  camera: <><path d="M3 8h4l1.5-2h7L17 8h4v11H3z"/><circle cx="12" cy="13.5" r="3.5"/></>,
  other: <><path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3.5 7.5 8.5 5 8.5-5M12 22V12.5"/></>
};

export default function DeviceTypeIcon({ category, size = 18 }) {
  const key = String(category || 'other').toLowerCase();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {drawings[key] || drawings.other}
    </svg>
  );
}
