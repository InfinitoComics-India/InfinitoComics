// frontend/src/pages/InfinitoAds/data/adsData.js
import fashionImg from "../../../../assets/Images/Ads/possibility/fashion.jpeg";
import techImg from "../../../../assets/Images/Ads/possibility/tech.jpeg";
import locationImg from "../../../../assets/Images/Ads/possibility/location.jpeg";

// 1. Stats Banner Data
export const statsData = [
  {
    title: "ORIGINAL CHARACTERS",
    value: "2500+",
  },
  {
    title: "A UNIVERSE OF PRIORITIES",
    value: "YOURS TOO",
  },
  {
    title: "MULTI-PLATFORM REACH",
    value: "EVERYWHERE",
  },
  {
    title: "STORY UNIVERSE EXPANDING",
    value: "ALWAYS",
  },
  {
    title: "RESEARCH BACKED",
    value: "OUTCOME",
  },
];

// 2. What Can We Do For Your Brand (Services)
export const servicesData = [
  {
    id: 1,
    title: "Product Integration",
    description: "Put your brand naturally into the hands of our characters.",
    icon: "box", 
  },
  {
    id: 2,
    title: "Character Collaboration",
    description: "Feature an Infinito character as your brand ambassador.",
    icon: "users",
  },
  {
    id: 3,
    title: "Story Integration",
    description: "Make your product part of the narrative and dialogues.",
    icon: "book-open",
  },
  {
    id: 4,
    title: "Location Integration",
    description: "Turn your space into part of the Infinito universe.",
    icon: "map-pin",
  },
  {
    id: 5,
    title: "Multi-platform Presence",
    description: "Comics, animation, games, artwork and across social media.",
    icon: "layers",
  },
  {
    id: 6,
    title: "Character Licensing",
    description: "Use Infinito characters in your own marketing campaigns.",
    icon: "award",
  },
];

// 3. How It Works (6 Steps)
export const stepsData = [
  {
    step: "01",
    title: "Book a free Call!",
    description: "Talk to our expert and discuss the possibilities of advertisement and brand integration.",
  },
  {
    step: "02",
    title: "Tell Your Goal",
    description: "Share your brand vision, product details, campaign objectives and expected outcomes.",
  },
  {
    step: "03",
    title: "Choose the fit",
    description: "Select characters, format and type of integration and development - across media formats.",
  },
  {
    step: "04",
    title: "Sign the MOU",
    description: "Finalize the terms, deliverables and responsibilities and officially move forward.",
  },
  {
    step: "05",
    title: "We Create",
    description: "Our team develops the custom concepts, stories and creatives to create real world impact.",
  },
  {
    step: "06",
    title: "Go Live!",
    description: "Your brand will become the integral part of Infinito Universe - across the platform and stories.",
  },
];

// 4. See The Possibilities
export const possibilitiesData = [
  {
    id: "fashion",
    category: "FASHION",
    description: "Your brand can involve in the costume, clothing, footwear, accessories design of our flagship characters.",
    image: fashionImg,
  },
  {
    id: "tech",
    category: "TECHNOLOGY",
    description: "Our character will use the Laptop, smartphone, gadgets and Bike, Cars and other technology of your brand.",
    image: techImg,
  },
  {
    id: "location",
    category: "LOCATION",
    description: "Our character will work at your location or visit regularly - Offices, Store, Cafes, restaurants sports arena etc.",
    image: locationImg,
  },
];

// 5. Industries (Who Can Partner With Us)
export const industriesData = [
  { name: "Fashion", icon: "shirt" },
  { name: "Technology", icon: "cpu" },
  { name: "Consumer Goods", icon: "shopping-bag" },
  { name: "Automotive", icon: "car" },
  { name: "Travel & Hospitality", icon: "plane" },
  { name: "Corporates", icon: "briefcase" },
  { name: "Sports & Fitness", icon: "activity" },
];

// 6. Pricing Packages
export const pricingData = [
  {
    name: "Starter",
    tagline: "Great for small campaigns",
    price: "INR 1,99,999/-",
    isPopular: false,
    features: [
      "Product placement",
      "Artwork Integration",
      "Comic appearance",
      "Social media feature",
      "ABM focused marketing",
    ],
  },
  {
    name: "Growth",
    tagline: "Expand your brand presence",
    price: "INR 4,99,999/-",
    isPopular: false,
    features: [
      "Character integration",
      "Comics + artwork",
      "Animation appearance",
      "Social media campaign",
      "ABM focused marketing",
    ],
  },
  {
    name: "Campaign",
    tagline: "A dedicated collaboration",
    price: "INR 9,99,999/-",
    isPopular: true, // Marked "Most Popular"
    features: [
      "Character + Brand design",
      "Comics + animation",
      "Social media + posters",
      "Custom creative assets",
      "Custom brand story",
      "LLM Based Marketing",
    ],
  },
  {
    name: "Universe",
    tagline: "For large-scale partnerships",
    price: "Contact Team",
    isPopular: false,
    features: [
      "Branded story/episode",
      "Multi-platform",
      "Character licensing",
      "Exclusivity options",
      "Fully custom campaign",
    ],
  },
];

// 7. Frequently Asked Questions
export const faqData = [
  {
    id: 1,
    question: "Where do Infinito Ads show up?",
    answer: "Infinito Ads appear organically across Infinito Comics storylines, digital issues, social media character accounts, animated shorts, and official merchandise.",
  },
  {
    id: 2,
    question: "How do Infinito Ads help to reach potential customers?",
    answer: "By placing your product directly into the hands of beloved characters and engaging story arcs, fans connect with your brand emotionally rather than skipping it like conventional ads.",
  },
  {
    id: 3,
    question: "Which type of Infinito Ads campaign is right for my business?",
    answer: "Startups and small businesses often begin with our Starter or SME packages. Growing brands and enterprises usually choose the Campaign or Universe tier for comprehensive character ambassadorship and custom story arcs.",
  },
  {
    id: 4,
    question: "How does Infinito Ads help find high-value and loyal customers for my business?",
    answer: "Comic, anime, and pop-culture fandoms have some of the highest brand loyalty and retention rates globally. Infinito leverages this deep community affinity for authentic brand adoption.",
  },
  {
    id: 5,
    question: "How Infinito Ads can help to build the brand value and social impact?",
    answer: "Through purposeful story themes, collaborative hero arcs, and cause-based storytelling, your brand is established as a cultural visionary.",
  },
];