import { media } from "@/lib/media";

export const themes = [
  {
    id: "planet-sustainability",
    name: "Planet & Sustainability",
    subtitle: "Climate Tech, Circular Economy & Sustainable Futures",
    image: media("/media/themes/sustainability.webp"),
    description:
      "This theme invites ideas tackling environmental challenges through innovation. Focus areas include clean energy solutions, converting waste into valuable resources, circular design practices that minimize waste, technologies for monitoring pollution, green finance models, and sustainability solutions tailored specifically for the unique needs of Tier 2 and Tier 3 Indian cities.",
    partnerFit: "Energy · mobility · infrastructure",
  },
  {
    id: "bio-economy",
    name: "Bio Economy & Agriculture",
    subtitle: "Agri, Food, HealthTech & Biotech",
    image: media("/media/themes/bioeconomy.webp"),
    description:
      "This theme covers innovations at the intersection of agriculture, food, and health. Focus areas include precision farming techniques, resilient food systems, alternative protein sources, nutrition-focused solutions, preventive wellness approaches, early disease diagnostics, biotechnology breakthroughs, and improving healthcare access for rural and underserved communities across India.",
    partnerFit: "Food · pharma · agribusiness",
  },
  {
    id: "deeptech-manufacturing",
    name: "DeepTech & Manufacturing",
    subtitle: "Smart Manufacturing & Industry 4.0",
    image: media("/media/themes/deetech.webp"),
    description:
      "This theme centers on the advanced technology reshaping industry. Focus areas include robotics, Internet of Things (IoT) applications, edge computing, smart factory systems, automation solutions for MSMEs, supply chain technology innovations, and ideas addressing the evolving future of work in a tech-driven economy.",
    partnerFit: "Manufacturing · engineering · enterprise tech",
  },
  {
    id: "sports-fitness",
    name: "Sports & Fitness",
    subtitle: "Active Lifestyle",
    image: media("/media/themes/sports.webp"),
    description:
      "This theme welcomes ideas that promote sport and physical wellbeing. Focus areas include grassroots sports development, sports infrastructure improvements, athlete performance tracking, sports academy models, fan engagement platforms, sports media innovations, fitness technology platforms, wearable fitness devices, and community-driven sports participation models across India.",
    partnerFit: "Sports · healthcare · fitness platforms",
  },
  {
    id: "d2c-consumer",
    name: "D2C & Consumer Brands",
    subtitle: "Creator Economy",
    image: media("/media/themes/D2C.webp"),
    description:
      "This theme focuses on direct-to-consumer innovation and brand building. Focus areas include digital-first brand models, fashion, food and beverage products, personal care items, wellness brands, influencer-led ventures, community commerce approaches, subscription-based business models, and brands leveraging ONDC (Open Network for Digital Commerce) for wider market reach.",
    partnerFit: "FMCG · retail · e-commerce · logistics",
  },
] as const;
