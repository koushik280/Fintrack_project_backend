const Content = require('../models/Content');

const seedContent = async () => {
  const count = await Content.countDocuments();
  if (count > 0) return;

  const features = [
    { type: 'feature', data: { icon: 'TrendingUp', title: 'Smart Analytics', description: 'Get detailed insights into your spending habits with AI-powered analytics.' }, order: 1 },
    { type: 'feature', data: { icon: 'Security', title: 'Bank-Grade Security', description: 'Your data is encrypted and protected with the latest security standards.' }, order: 2 },
    { type: 'feature', data: { icon: 'Speed', title: 'Real-Time Updates', description: 'Transactions sync instantly across all your devices.' }, order: 3 },
    { type: 'feature', data: { icon: 'Devices', title: 'Multi-Platform', description: 'Access your finances from anywhere, on any device.' }, order: 4 },
  ];
  const testimonials = [
    { type: 'testimonial', data: { name: 'Sarah Johnson', role: 'Small Business Owner', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, text: 'FinTrack has transformed how I manage my business finances. The budgeting features are a game-changer!' }, order: 1 },
    // ... other testimonials
  ];
  const faqs = [
    { type: 'faq', data: { q: 'Is FinTrack really free?', a: 'Yes! Our free plan includes up to 3 budgets, basic CSV reports, and 2 cards. Upgrade to Pro for unlimited access.' }, order: 1 },
    // ... other FAQs
  ];

  await Content.insertMany([...features, ...testimonials, ...faqs]);
  console.log('Default content seeded');
};

module.exports = seedContent;

