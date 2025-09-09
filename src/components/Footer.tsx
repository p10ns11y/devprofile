import Link from 'next/link';
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Icons,type IconName } from "./Icons";


import cvdata from '../data/cvdata.json'

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-semibold"
          >
            Peramanathan S.
          </motion.div>

          {/* TODO: Potential Reusable Compoent (Hero, Footer) */}
          <div className="flex items-center justify-center gap-6">
            {cvdata.social_links.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full border border-border hover:bg-accent transition-colors"
                aria-label={social.label}
                target="_blank"
                rel="nofollow noreferrer noopnener"
              >
                <Icons name={social.icon as IconName} className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            <Link
              href="/cv/web-view"
              className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View CV
            </Link>
            <span className="text-muted-foreground">•</span>
            <a
              href="/cv.pdf"
              className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              target="_blank"
              rel="nofollow noreferrer noopener"
            >
              View PDF
            </a>
            <span className="text-muted-foreground">•</span>
            {/* eslint-disable-next-line */}
            <a
              href="/api/cv/generate"
              className="inline-flex items-center px-4 py-2 text-green-600 hover:text-green-700 transition-colors"
            >
              Download PDF
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <span>
              © {currentYear} Peramanathan Sathyamoorthy. Made
              with
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span>and lots of coffee</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xs text-muted-foreground"
          >
            <p>
              Built with React, TypeScript, and Tailwind CSS.
              Designed with care and attention to detail.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
