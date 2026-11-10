import React, { forwardRef } from 'react'
import './MediaPlaceholder.css'

// Blank gray block that stands in for a product screenshot or demo video
// until the real asset is ready. To restore media, replace this element
// with an <img>/<video> of the same aspect ratio and keep the className.
// `ratio` is "width / height", e.g. "1640 / 920".
const MediaPlaceholder = forwardRef(({ ratio = '16 / 9', label, className = '', style, ...rest }, ref) => (
  <div
    ref={ref}
    role="img"
    aria-label={label || 'Media placeholder'}
    className={`lp-media-placeholder ${className}`.trim()}
    style={{ aspectRatio: ratio, ...style }}
    {...rest}
  />
))

MediaPlaceholder.displayName = 'MediaPlaceholder'

export default MediaPlaceholder
