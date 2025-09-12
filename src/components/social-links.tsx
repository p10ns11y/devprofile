import { motion } from 'motion/react';

import { Icon, type IconName  } from '@/components/icon'

import cvdata from '../data/cvdata.json';

export function SocialLinks() {
  return (
    <div className="flex items-center justify-center lg:justify-center gap-4">
      {cvdata.social_links.map((social, index) => (
        <motion.a
          key={social.label}
          href={social.href}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.9 + index * 0.1,
          }}
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full border border-border hover:bg-accent transition-colors"
          aria-label={social.label}
          target="_blank"
          rel="nofollow noreferrer noopnener"
        >
          <Icon name={social.icon as IconName} className="w-5 h-5" />
        </motion.a>
      ))}
    </div>
  )
}