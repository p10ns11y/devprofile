import { flag } from 'flags/next';
 
export const documentsFlag = flag({
  key: 'documents-flag',
  decide() {
    return true //Math.random() > 0.5;
  },
});

export const skillsSectionFlag = flag({
  key: 'skills-section',
  decide() {
    return false
  },
});
