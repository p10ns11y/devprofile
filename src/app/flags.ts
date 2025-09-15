import { flag } from 'flags/next';
 
export const exampleFlag = flag({
  key: 'example-flag',
  decide() {
    return true //Math.random() > 0.5;
  },
});