// Basic seed list (replace images with your own)
const smells = [
  { id: "smell_001", name: "Play-Doh tub just opened", image: "/tools/smellable/img/1.jpg", category: "nostalgia" },
  { id: "smell_002", name: "Coffee in the morning", image: "/tools/smellable/img/2.jpg", category: "food" },
  { id: "smell_003", name: "New book pages", image: "/tools/smellable/img/3.jpg", category: "cozy" },
  { id: "smell_004", name: "Sea breeze", image: "/tools/smellable/img/4.jpg", category: "nature" },
  { id: "smell_005", name: "Rain on warm asphalt", image: "/tools/smellable/img/5.jpg", category: "nature" },

  // --- START: Smellable Batch 01 ---
  { id: "smell_006", name: "Freshly cut grass", image: "/tools/smellable/img/6.jpg", category: "nostalgia" },
  { id: "smell_007", name: "New car interior (first day)", image: "/tools/smellable/img/7.jpg", category: "nostalgia" },
  { id: "smell_008", name: "Opening a fresh bag of chips", image: "/tools/smellable/img/8.jpg", category: "food" },
  { id: "smell_009", name: "Warm cinnamon roll from the oven", image: "/tools/smellable/img/9.jpg", category: "food" },
  { id: "smell_010", name: "Toasted bread + melting butter", image: "/tools/smellable/img/10.jpg", category: "food" },

  { id: "smell_011", name: "Freshly peeled orange", image: "/tools/smellable/img/11.jpg", category: "food" },
  { id: "smell_012", name: "Popcorn at the cinema lobby", image: "/tools/smellable/img/12.jpg", category: "food" },
  { id: "smell_013", name: "Chocolate bar unwrapped", image: "/tools/smellable/img/13.jpg", category: "food" },
  { id: "smell_014", name: "Espresso shot pulling", image: "/tools/smellable/img/14.jpg", category: "food" },
  { id: "smell_015", name: "Tea steam on a rainy day", image: "/tools/smellable/img/15.jpg", category: "cozy" },

  { id: "smell_016", name: "A new candle lit for the first time", image: "/tools/smellable/img/16.jpg", category: "cozy" },
  { id: "smell_017", name: "Fresh laundry out of the dryer", image: "/tools/smellable/img/17.jpg", category: "cozy" },
  { id: "smell_018", name: "Clean hotel sheets at check-in", image: "/tools/smellable/img/18.jpg", category: "cozy" },
  { id: "smell_019", name: "Shampoo in a hot shower", image: "/tools/smellable/img/19.jpg", category: "cozy" },
  { id: "smell_020", name: "Bookstore air (paper + quiet)", image: "/tools/smellable/img/20.jpg", category: "cozy" },

  { id: "smell_021", name: "Cracking a cold soda can", image: "/tools/smellable/img/21.jpg", category: "food" },
  { id: "smell_022", name: "Mint gum first chew", image: "/tools/smellable/img/22.jpg", category: "fresh" },
  { id: "smell_023", name: "Eucalyptus in a sauna", image: "/tools/smellable/img/23.jpg", category: "fresh" },
  { id: "smell_024", name: "Aftershave splash (barber vibe)", image: "/tools/smellable/img/24.jpg", category: "fresh" },
  { id: "smell_025", name: "Sunscreen at the beach", image: "/tools/smellable/img/25.jpg", category: "summer" },

  { id: "smell_026", name: "Pool chlorine in summer heat", image: "/tools/smellable/img/26.jpg", category: "summer" },
  { id: "smell_027", name: "BBQ smoke drifting over the yard", image: "/tools/smellable/img/27.jpg", category: "summer" },
  { id: "smell_028", name: "Campfire + toasted marshmallow", image: "/tools/smellable/img/28.jpg", category: "summer" },
  { id: "smell_029", name: "Fresh basil crushed in your hands", image: "/tools/smellable/img/29.jpg", category: "nature" },
  { id: "smell_030", name: "Pine forest after sun warms it", image: "/tools/smellable/img/30.jpg", category: "nature" },

  { id: "smell_031", name: "Wet soil after the first spring rain", image: "/tools/smellable/img/31.jpg", category: "nature" },
  { id: "smell_032", name: "Cutting fresh cucumber", image: "/tools/smellable/img/32.jpg", category: "fresh" },
  { id: "smell_033", name: "Lemon zest on a cutting board", image: "/tools/smellable/img/33.jpg", category: "fresh" },
  { id: "smell_034", name: "Freshly mowed lawn at sunset", image: "/tools/smellable/img/34.jpg", category: "nature" },
  { id: "smell_035", name: "Flowers at a market stall", image: "/tools/smellable/img/35.jpg", category: "nature" },

  { id: "smell_036", name: "Gas station coffee at 6 AM", image: "/tools/smellable/img/36.jpg", category: "nostalgia" },
  { id: "smell_037", name: "Pencil shavings in a classroom", image: "/tools/smellable/img/37.jpg", category: "nostalgia" },
  { id: "smell_038", name: "Fresh marker on poster paper", image: "/tools/smellable/img/38.jpg", category: "nostalgia" },
  { id: "smell_039", name: "New sneakers out of the box", image: "/tools/smellable/img/39.jpg", category: "nostalgia" },
  { id: "smell_040", name: "Old vinyl record sleeve", image: "/tools/smellable/img/40.jpg", category: "nostalgia" },

  { id: "smell_041", name: "Fresh paint in a new room", image: "/tools/smellable/img/41.jpg", category: "nostalgia" },
  { id: "smell_042", name: "Wood workshop (sawdust)", image: "/tools/smellable/img/42.jpg", category: "nostalgia" },
  { id: "smell_043", name: "Leather jacket in a closet", image: "/tools/smellable/img/43.jpg", category: "nostalgia" },
  { id: "smell_044", name: "Christmas tree brought inside", image: "/tools/smellable/img/44.jpg", category: "seasonal" },
  { id: "smell_045", name: "Gingerbread spices in December", image: "/tools/smellable/img/45.jpg", category: "seasonal" },

  { id: "smell_046", name: "Hot chocolate + marshmallows", image: "/tools/smellable/img/46.jpg", category: "seasonal" },
  { id: "smell_047", name: "Pumpkin spice in a café", image: "/tools/smellable/img/47.jpg", category: "seasonal" },
  { id: "smell_048", name: "Fresh rain on hot pavement (city)", image: "/tools/smellable/img/48.jpg", category: "nature" },
  { id: "smell_049", name: "Sea air + sunscreen combo", image: "/tools/smellable/img/49.jpg", category: "summer" },
  { id: "smell_050", name: "A bouquet unwrapped at home", image: "/tools/smellable/img/50.jpg", category: "nature" },

  { id: "smell_051", name: "Bread from a bakery door", image: "/tools/smellable/img/51.jpg", category: "food" },
  { id: "smell_052", name: "Street waffle stand", image: "/tools/smellable/img/52.jpg", category: "food" },
  { id: "smell_053", name: "Hot fries in a paper bag", image: "/tools/smellable/img/53.jpg", category: "food" },
  { id: "smell_054", name: "Fresh pizza box opened", image: "/tools/smellable/img/54.jpg", category: "food" },
  { id: "smell_055", name: "Strawberry jam on warm toast", image: "/tools/smellable/img/55.jpg", category: "food" }
];
