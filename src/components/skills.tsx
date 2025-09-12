import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import cvdata from '../data/cvdata.json'

export function Skills() {
  // const skillCategories = [
  //   {
  //     title: 'Frontend & Core',
  //     skills: ['JavaScript', 'TypeScript', 'ReactJS', 'Next.js', 'Remix', 'Astro', 'Jest', 'Playwright']
  //   },
  //   {
  //     title: 'Backend & Data',
  //     skills: ['Python', 'Node.js', 'Express', 'Flask', 'Django', 'MySQL', 'PostgreSQL', 'MongoDB']
  //   },
  //   {
  //     title: 'DevOps & AI',
  //     skills: ['AWS', 'Terraform', 'Docker', 'Git', 'LangChain', 'LLMs', 'Webpack', 'Vite']
  //   }
  // ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl mb-6">Skills & Technologies</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit of technologies I use to bring ideas to life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cvdata.skills.categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              className="space-y-6"
            >
              <motion.h3
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-semibold text-center"
              >
                {category.title}
              </motion.h3>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.4, 
                      delay: categoryIndex * 0.2 + skillIndex * 0.1 
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: Math.random() * 10 - 5 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated skill bars */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 space-y-6"
        >
          <h3 className="text-2xl font-semibold text-center mb-8">Proficiency</h3>
          
          {[
            { name: 'TypeScript/JavaScript', level: 95 },
            { name: 'React/Frontend', level: 95 },
            { name: 'Python/Backend', level: 90 },
            { name: 'Team Leadership', level: 85 }
          ].map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{skill.name}</span>
                <span className="text-sm text-muted-foreground">{skill.level}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}