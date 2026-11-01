import React from 'react';

const INK = '#2b2140'

const Art = ({ children }) => (
  <svg className="critter" aria-hidden="true" focusable="false" viewBox="0 0 120 130">
    {children}
  </svg>
)

const bunnyShapes = (
  <>
    <ellipse cx="42" cy="32" rx="12" ry="27" transform="rotate(-10 42 32)" />
    <ellipse cx="78" cy="32" rx="12" ry="27" transform="rotate(14 78 32)" />
    <ellipse cx="60" cy="108" rx="28" ry="18" />
    <circle cx="60" cy="74" r="30" />
  </>
)

export const Bunny = ({ happy }) => (
  <Art>
    <g fill="#fff" stroke="#fff" strokeWidth="11">{bunnyShapes}</g>
    <g fill="#f5ecdf" stroke={INK} strokeWidth="3">{bunnyShapes}</g>
    <ellipse cx="42" cy="34" rx="5" ry="17" transform="rotate(-10 42 34)" fill="#f2a6a0" />
    <ellipse cx="78" cy="34" rx="5" ry="17" transform="rotate(14 78 34)" fill="#f2a6a0" />
    {happy ? (
      <>
        <path d="M43 70q6-7 12 0M65 70q6-7 12 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M46 80q14 16 28 0z" fill="#e0726e" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <circle cx="49" cy="70" r="4.5" fill={INK} />
        <circle cx="71" cy="70" r="4.5" fill={INK} />
        <path d="M56 79h8l-4 5z" fill="#e0726e" />
        <path d="M60 84q-5 6-10 2M60 84q5 6 10 2" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </>
    )}
  </Art>
)

const TAIL = 'M34 112C14 108 14 80 34 86'

export const Gecko = () => (
  <Art>
    <g fill="none" strokeLinecap="round">
      <path d={TAIL} stroke="#fff" strokeWidth="22" />
      <path d={TAIL} stroke={INK} strokeWidth="15" />
      <path d={TAIL} stroke="#3fa86b" strokeWidth="9" />
    </g>
    <g fill="#fff" stroke="#fff" strokeWidth="11">
      <ellipse cx="66" cy="106" rx="34" ry="17" />
      <circle cx="66" cy="62" r="33" />
    </g>
    <g fill="#3fa86b" stroke={INK} strokeWidth="3">
      <ellipse cx="66" cy="106" rx="33" ry="16" />
      <circle cx="66" cy="62" r="31" />
    </g>
    <circle cx="48" cy="48" r="13" fill="#fff8d6" stroke={INK} strokeWidth="3" />
    <circle cx="84" cy="48" r="13" fill="#fff8d6" stroke={INK} strokeWidth="3" />
    <circle cx="50" cy="48" r="6" fill={INK} />
    <circle cx="82" cy="48" r="6" fill={INK} />
    <path d="M48 74q18 12 36 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <circle cx="66" cy="104" r="5" fill="#ffd84d" />
    <circle cx="50" cy="108" r="4" fill="#ffd84d" />
    <circle cx="82" cy="108" r="4" fill="#ffd84d" />
  </Art>
)

const OWL = 'M28 40L24 12L50 28Q60 24 70 28L96 12L92 40Q104 60 96 94Q88 124 60 124Q32 124 24 94Q16 60 28 40z'

export const Owl = ({ sleepy }) => (
  <Art>
    <path d={OWL} fill="#fff" stroke="#fff" strokeWidth="11" strokeLinejoin="round" />
    <path d={OWL} fill="#9a6a44" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="60" cy="98" rx="24" ry="22" fill="#e8cfa8" />
    <path d="M46 90q4 5 8 0M66 90q4 5 8 0M50 102q4 5 8 0M62 102q4 5 8 0" fill="none" stroke="#9a6a44" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="42" cy="56" r="17" fill="#fff8d6" stroke={INK} strokeWidth="3" />
    <circle cx="78" cy="56" r="17" fill="#fff8d6" stroke={INK} strokeWidth="3" />
    {sleepy ? (
      <path data-testid="sleepy-eyes" d="M32 58q10 8 20 0M68 58q10 8 20 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
    ) : (
      <>
        <circle cx="44" cy="56" r="8" fill={INK} />
        <circle cx="76" cy="56" r="8" fill={INK} />
      </>
    )}
    <path d="M54 66h12l-6 9z" fill="#f2a53a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
  </Art>
)

const FOX = 'M14 24L44 40Q60 34 76 40L106 24L100 70Q92 106 60 120Q28 106 20 70z'

export const Fox = () => (
  <Art>
    <path d={FOX} fill="#fff" stroke="#fff" strokeWidth="11" strokeLinejoin="round" />
    <path d={FOX} fill="#e8743a" />
    <path d="M20 70Q42 72 60 120Q78 72 100 70Q92 106 60 120Q28 106 20 70z" fill="#fff4e4" />
    <path d={FOX} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    <circle cx="42" cy="66" r="5" fill={INK} />
    <circle cx="78" cy="66" r="5" fill={INK} />
    <circle cx="60" cy="108" r="7" fill={INK} />
  </Art>
)

export const CREW = [Bunny, Gecko, Owl, Fox]
