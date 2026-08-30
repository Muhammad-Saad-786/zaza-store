// src/config/seo.js
export const seoConfig = {
  siteName: "ZAZA Store",
  siteUrl: "https://zazastore.games",
  defaultImage: "/og-image.jpg",
  social: {
    twitter: "@zazastore",
    facebook: "zazastore",
  },
};

export const pageSEO = {
  home: {
    title: "ZAZA Store - MLBB Accounts Marketplace",
    description:
      "Buy and sell Mobile Legends accounts securely. Check player stats, explore heroes, and verify MLBB accounts.",
    keywords: [
      "MLBB accounts",
      "buy MLBB account",
      "sell MLBB account",
      "Mobile Legends marketplace",
    ],
  },
  marketplace: {
    title: "Marketplace",
    description:
      "Browse verified MLBB accounts for sale. Filter by rank, skins, heroes, and price.",
    keywords: ["MLBB marketplace", "buy accounts", "MLBB accounts for sale"],
  },
  playerChecker: {
    title: "Player Checker",
    description:
      "Check MLBB player information using Player ID and Server ID. Verify account details instantly.",
    keywords: ["MLBB player checker", "check player", "verify MLBB account"],
  },
  heroes: {
    title: "MLBB Heroes",
    description:
      "Browse all Mobile Legends heroes with stats, skills, counters, and compatibility.",
    keywords: ["MLBB heroes", "hero list", "Mobile Legends heroes"],
  },
  heroDetail: (heroName) => ({
    title: `${heroName} - MLBB Hero Details`,
    description: `View ${heroName} stats, skills, counters, and compatibility in Mobile Legends.`,
    keywords: [heroName, "MLBB hero", "hero stats", "hero counters"],
  }),
  rankings: {
    title: "Hero Rankings",
    description:
      "View MLBB hero rankings with win rates, ban rates, and pick rates.",
    keywords: ["MLBB rankings", "hero win rates", "best heroes"],
  },
  positions: {
    title: "Hero Positions",
    description:
      "Filter MLBB heroes by role and lane. Find the best heroes for each position.",
    keywords: ["MLBB positions", "hero roles", "lane filters"],
  },
  mlbbLogin: {
    title: "MLBB Login",
    description:
      "Login with your Mobile Legends account to access exclusive features.",
    keywords: ["MLBB login", "Mobile Legends login"],
  },
  mlbbProfile: {
    title: "MLBB Profile",
    description:
      "View your Mobile Legends account profile, stats, and information.",
    keywords: ["MLBB profile", "player stats", "account info"],
  },
  login: {
    title: "Sign In",
    description: "Sign in to your ZAZA Store account.",
    keywords: ["login", "sign in"],
  },
  register: {
    title: "Create Account",
    description: "Create a ZAZA Store account to buy and sell MLBB accounts.",
    keywords: ["register", "sign up", "create account"],
  },
};
