import { Category } from '../store/useLinkVault';

export const SEED_DATA: Category[] = [
  {
    id: 'dev-tools',
    name: 'Dev Tools',
    icon: 'terminal',
    links: [
      {
        id: 'link-1',
        title: 'GitHub',
        description: 'Code hosting & collaboration',
        url: 'https://github.com',
        color: '#2ea043',
        order: 0,
      },
      {
        id: 'link-2',
        title: 'MDN Web Docs',
        description: 'Web API documentation',
        url: 'https://developer.mozilla.org',
        color: '#83bcf3',
        order: 1,
      },
      {
        id: 'link-3',
        title: 'Can I Use',
        description: 'Browser compatibility tables',
        url: 'https://caniuse.com',
        color: '#db5600',
        order: 2,
      },
      {
        id: 'link-4',
        title: 'Vite',
        description: 'Next generation frontend tooling',
        url: 'https://vitejs.dev',
        color: '#646cff',
        order: 3,
      },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    icon: 'pen-tool',
    links: [
      {
        id: 'link-5',
        title: 'Figma',
        description: 'Collaborative design tool',
        url: 'https://figma.com',
        color: '#f24e1e',
        order: 0,
      },
      {
        id: 'link-6',
        title: 'Dribbble',
        description: 'Design inspiration',
        url: 'https://dribbble.com',
        color: '#ea4c89',
        order: 1,
      },
      {
        id: 'link-7',
        title: 'Coolors',
        description: 'Color palette generator',
        url: 'https://coolors.co',
        color: '#0066ff',
        order: 2,
      },
    ],
  },
];
