import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Fade + rise when scrolled into view. Renders static content under reduced motion.
const Reveal = ({ as = 'div', delay = 0, y = 16, className = '', children, ...rest }) => {
  const reduceMotion = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduceMotion) {
    const Tag = as
    return <Tag className={className} {...rest}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export default Reveal
