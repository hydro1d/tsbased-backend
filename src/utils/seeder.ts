import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Item } from '../models/Item';

const mockItems = [
  {
    title: 'Hyperion Cloud Core',
    shortDesc: 'Production-ready serverless backend template with automated multi-cloud scaling.',
    fullDesc: 'Hyperion Cloud Core is the ultimate foundation for modern SaaS platforms. Built on Express, TypeScript, and Docker, it offers pre-configured GitHub Actions pipelines, automated health checks, database connection pooling, and multi-tenant billing integrations out of the box. Deploy to AWS, GCP, or Azure in under 5 minutes with our clean infrastructure-as-code scripts.',
    price: 89,
    date: new Date('2026-07-15'),
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'Templates',
    location: 'San Francisco, CA',
    rating: 4.8,
    specifications: {
      'Framework': 'Express, TypeScript',
      'Database': 'PostgreSQL, MongoDB',
      'Deployment': 'Docker, Terraform',
      'License': 'Commercial'
    },
    reviews: [
      { userName: 'Sarah Jenkins', rating: 5, comment: 'Saved me at least 40 hours of setup time. Highly recommended!', createdAt: new Date('2026-07-20') },
      { userName: 'Marcus Vance', rating: 4, comment: 'Very clean codebase, though Docker setup took a bit of reading.', createdAt: new Date('2026-07-22') }
    ]
  },
  {
    title: 'Aura UI Kit',
    shortDesc: 'Premium accessible Tailwind CSS component library with built-in dark mode and fluid animations.',
    fullDesc: 'Aura UI Kit delivers over 120 hand-crafted React components engineered for visual excellence and screen-reader accessibility. Built strictly on top of Tailwind CSS and Framer Motion, it features dynamic charts, interactive modals, drag-and-drop file uploaders, and complex calendar grids. Aura integrates cleanly into any React project using plain Tailwind configurations without locking you into proprietary frameworks.',
    price: 49,
    date: new Date('2026-07-18'),
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    category: 'UI Kits',
    location: 'London, UK',
    rating: 4.9,
    specifications: {
      'CSS Framework': 'Tailwind CSS v3',
      'Animation': 'Framer Motion',
      'Accessibility': 'WCAG 2.1 AA Compliant',
      'React Version': 'v18 & v19 compatible'
    },
    reviews: [
      { userName: 'Elena Rostova', rating: 5, comment: 'Stunning aesthetics. The micro-interactions feel extremely premium.', createdAt: new Date('2026-07-25') }
    ]
  },
  {
    title: 'Chronos Telemetry Engine',
    shortDesc: 'Interactive dashboard widget package for real-time PostgreSQL database performance monitoring.',
    fullDesc: 'Chronos is a lightweight telemetry engine that plugs directly into your Node.js application server. It hooks into your database connections to track query execution times, slow queries, active connection pools, and memory footprint in real-time. The visual package features clean, high-performance Recharts components that load and render millions of data points smoothly.',
    price: 129,
    date: new Date('2026-07-10'),
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    category: 'Analytics',
    location: 'Berlin, DE',
    rating: 4.7,
    specifications: {
      'Database Support': 'PostgreSQL 12+',
      'Visualization': 'Recharts / SVG',
      'Performance': 'Sub-millisecond query overhead',
      'License': 'Single Project'
    },
    reviews: [
      { userName: 'David Kim', rating: 4, comment: 'Excellent metrics. Helped us track down a severe N+1 query issue.', createdAt: new Date('2026-07-12') },
      { userName: 'Sophia Lopez', rating: 5, comment: 'Installing was straightforward. The charts look beautiful in dark mode.', createdAt: new Date('2026-07-15') }
    ]
  },
  {
    title: 'Nebula API Gateway',
    shortDesc: 'Lightweight high-performance OAuth2 authentication gateway with automatic rate-limiting.',
    fullDesc: 'Nebula is an API proxy server designed to handle secure authentications, API key management, and security headers before traffic reaches your internal services. Written in strict TypeScript, it handles token encryption, blacklisting, IP geolocation rate limiting, and request sanitization. It has a tiny footprint and runs seamlessly on resource-constrained Edge containers.',
    price: 79,
    date: new Date('2026-07-20'),
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    category: 'Security',
    location: 'Austin, TX',
    rating: 4.6,
    specifications: {
      'Protocol': 'OAuth2 / OpenID Connect',
      'Proxy Engine': 'Node HTTP-Proxy',
      'Caches': 'Redis / In-Memory support',
      'Version': 'v2.1.0 LTS'
    },
    reviews: [
      { userName: 'Alex Mercer', rating: 4, comment: 'Solid and performant gateway. We migrated from Kong and saved on memory.', createdAt: new Date('2026-07-24') }
    ]
  },
  {
    title: 'Vortex WebGL Physics',
    shortDesc: 'Rigid body 3D physics solver library optimized for web-based games and interactive UIs.',
    fullDesc: 'Vortex brings advanced rigid-body physics simulation straight to the web browser. Written in TypeScript and compiled with heavy optimizations, it runs frictionless friction, elastic collisions, soft-body constraints, and cloth simulations. Vortex integrates cleanly with Three.js or standard WebGL contexts, allowing developers to create highly interactive canvas-based landing pages and games.',
    price: 159,
    date: new Date('2026-07-25'),
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    category: 'Libraries',
    location: 'Tokyo, JP',
    rating: 4.9,
    specifications: {
      'Engine': 'Custom WebGL / WASM solver',
      'Integrations': 'Three.js, PixiJS, React Three Fiber',
      'File Size': '42KB gzipped',
      'Documentation': 'Full API spec & 15 sandboxes'
    },
    reviews: [
      { userName: 'Yuki Sato', rating: 5, comment: 'Phenomenal library. Collision detection is extremely accurate.', createdAt: new Date('2026-07-28') }
    ]
  },
  {
    title: 'Spectra Mail Designer',
    shortDesc: 'Visual drag-and-drop HTML email builder with MJML outputs and pre-designed responsive cards.',
    fullDesc: 'Spectra Mail Designer takes the headache out of styling HTML emails. It provides a visual template editor component you can embed in your SaaS applications, enabling users to compose pixel-perfect emails that render consistently across Gmail, Outlook, Apple Mail, and mobile browsers. Outputs cleanly generated MJML code or fully-compiled inlined HTML files.',
    price: 39,
    date: new Date('2026-07-05'),
    imageUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80',
    category: 'Templates',
    location: 'Paris, FR',
    rating: 4.5,
    specifications: {
      'Export Format': 'MJML, Inline HTML',
      'UI Type': 'React Component / Full Page',
      'Responsive': 'Auto-fluid layouts',
      'Themes': 'Light / Dark email support'
    },
    reviews: [
      { userName: 'Claire Dubois', rating: 4, comment: 'Simplifies client onboarding dramatically. The MJML generation is perfect.', createdAt: new Date('2026-07-09') }
    ]
  },
  {
    title: 'Quantum Key Crypt',
    shortDesc: 'Zero-knowledge end-to-end client-side encryption library for secure WebSocket message exchanges.',
    fullDesc: 'Quantum Key Crypt offers simple APIs to encrypt web data before it ever hits the network. Using AES-GCM-256 and WebCrypto APIs, it establishes secure end-to-end encryption tunnels over standard WebSocket or REST connections. The server only sees ciphertext, ensuring your database and logs never contain sensitive user conversations or financial records.',
    price: 119,
    date: new Date('2026-07-22'),
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    category: 'Security',
    location: 'Zurich, CH',
    rating: 4.7,
    specifications: {
      'Algorithm': 'AES-GCM-256, ECDH Key Exchange',
      'Platform': 'Browsers, Node.js, React Native',
      'Zero-knowledge': 'Strictly client-side key generation',
      'License': 'Apache 2.0 / Extended Commercial'
    },
    reviews: [
      { userName: 'Hermann Brunner', rating: 5, comment: 'Exactly what we needed for our healthcare chat app validation compliance.', createdAt: new Date('2026-07-27') }
    ]
  },
  {
    title: 'Atlas GeoIP Engine',
    shortDesc: 'High-speed local database and resolver package for IP address geolocation analysis.',
    fullDesc: 'Atlas GeoIP packages millions of IP address ranges into a compact, highly optimized binary file that loads into your server memory. Instantly resolve any incoming HTTP request IP address to a country, city, postal code, and ISP with average lookups under 0.05 milliseconds. Avoid costly third-party API subscription fees and network roundtrips.',
    price: 99,
    date: new Date('2026-07-12'),
    imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    category: 'Libraries',
    location: 'Remote',
    rating: 4.4,
    specifications: {
      'Database Size': '28MB binary file',
      'Lookup Time': '< 0.08ms locally',
      'Updates': 'Monthly data downloads included',
      'Format': 'MMDB format compatible'
    },
    reviews: [
      { userName: 'Michael Croft', rating: 4, comment: 'Clean, offline, fast. Perfect replacement for MaxMind services.', createdAt: new Date('2026-07-16') }
    ]
  }
];

export const seedDatabase = async (): Promise<void> => {
  try {
    // Check if demo user exists
    let demoUser = await User.findOne({ email: 'demo@zenith.com' });
    
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@zenith.com',
        password: hashedPassword,
      });
      console.log('Demo user seeded successfully (demo@zenith.com / password123)');
    }

    // Check if items already exist
    const itemCount = await Item.countDocuments();
    if (itemCount === 0) {
      // Map items to include owner ID
      const itemsToSeed = mockItems.map(item => ({
        ...item,
        owner: demoUser!._id,
      }));

      await Item.insertMany(itemsToSeed);
      console.log(`${itemsToSeed.length} premium products seeded successfully.`);
    } else {
      console.log('Database already contains items. Skipping seeding.');
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};
