export interface CreatorVideo {
  id: string;
  creator: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  category: string;
  duration: string;
  views: string;
}

export const creatorVideos: CreatorVideo[] = [
  {
    id: "v1",
    creator: "@ArjunMehta",
    title: "How I built my first AI startup",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    aspectRatio: "16:9",
    category: "tech",
    duration: "03:42",
    views: "120K"
  },
  {
    id: "v2",
    creator: "@SarahChen",
    title: "The AI agent that changed my workflow",
    thumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    aspectRatio: "9:16",
    category: "productivity",
    duration: "00:59",
    views: "45K"
  },
  {
    id: "v3",
    creator: "@TechBuilds",
    title: "48 hours building an AI product",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    aspectRatio: "16:9",
    category: "vlog",
    duration: "12:30",
    views: "89K"
  },
  {
    id: "v4",
    creator: "@CreatorLife",
    title: "Why most creators burn out",
    thumbnail: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    aspectRatio: "4:5",
    category: "advice",
    duration: "08:15",
    views: "210K"
  },
  {
    id: "v5",
    creator: "@EditorPro",
    title: "How I edit 100 videos a month",
    thumbnail: "https://images.unsplash.com/photo-1574717024453-354056afd38b?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    aspectRatio: "16:9",
    category: "tutorial",
    duration: "15:20",
    views: "340K"
  },
  {
    id: "v6",
    creator: "@PublicBuilder",
    title: "Building in public",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    aspectRatio: "1:1",
    category: "business",
    duration: "01:00",
    views: "56K"
  },
  {
    id: "v7",
    creator: "@GearHead",
    title: "My camera setup",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    aspectRatio: "16:9",
    category: "gear",
    duration: "10:05",
    views: "430K"
  },
  {
    id: "v8",
    creator: "@GrowthHacker",
    title: "How I grew to 100K followers",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    aspectRatio: "9:16",
    category: "marketing",
    duration: "00:45",
    views: "980K"
  },
  {
    id: "v9",
    creator: "@FutureTech",
    title: "AI will change content creation",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    aspectRatio: "16:9",
    category: "tech",
    duration: "05:30",
    views: "25K"
  },
  {
    id: "v10",
    creator: "@DesignMind",
    title: "Designing beautiful UIs",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    aspectRatio: "4:5",
    category: "design",
    duration: "04:15",
    views: "115K"
  },
  {
    id: "v11",
    creator: "@CodeDaily",
    title: "My coding routine",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAgrand.mp4",
    aspectRatio: "9:16",
    category: "vlog",
    duration: "00:55",
    views: "300K"
  },
  {
    id: "v12",
    creator: "@StartupLife",
    title: "Seed funding tips",
    thumbnail: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    aspectRatio: "1:1",
    category: "business",
    duration: "02:10",
    views: "78K"
  }
];
