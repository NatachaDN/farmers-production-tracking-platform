import React from 'react';

export function AcreaLogo({ size = 34, showText = true, textColor = "#FFFFFF" }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dark Green Rounded Square Badge */}
        <rect width="100" height="100" rx="26" fill="#134731" />
        
        {/* White Stylized Letter 'A' Base */}
        <path d="M49 19L27 65H42L49 50L56 65H71L49 19Z" fill="#FFFFFF" />
        
        {/* Stylized Cow head silhouette / crop curve in the upper A counter */}
        <path d="M49 28C45 28 43 32 43 36C46 36 49 39 49 42C49 39 52 36 55 36C55 32 53 28 49 28Z" fill="#134731" />

        {/* Curved Golden Yellow / Orange Field Furrow Stripes */}
        <path d="M48 68C53 64 61 62 76 66L82 77C68 74 58 74 48 77V68Z" fill="#F4A227" />
        <path d="M47 79C56 77 66 77 82 82L81 88C64 85 53 85 45 88L47 79Z" fill="#F8B83F" />
        <path d="M44 88C53 87 63 88 80 91L78 95C60 92 50 92 41 95L44 88Z" fill="#F4A227" />

        {/* Vibrant Green Leaf Across Left & Center */}
        <path d="M12 76C12 76 15 54 36 44C57 34 52 58 38 68C26 77 12 76 12 76Z" fill="#489F4F" />
        <path d="M14 75C20 71 31 63 38 49C46 56 41 68 31 72C24 75 14 75 14 75Z" fill="#8AC956" />
        <path d="M14 75C26 67 36 58 45 46" stroke="#256B30" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <span style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: textColor,
          fontFamily: 'inherit'
        }}>
          Acrea
        </span>
      )}
    </div>
  );
}
