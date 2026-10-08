import { mediaInDir } from "@/lib/media";

export const albums = [
  { id: "8th-oct", label: "8 Oct" },
  { id: "day1", label: "Day 1" },
  { id: "day2", label: "Day 2" },
  { id: "9th-august", label: "9 Aug" },
  { id: "10th-august", label: "10 Aug" },
  { id: "11th-august", label: "11 Aug" },
] as const;

export const gallery = albums.map((a) => ({
  ...a,
  images: mediaInDir(`gallery/${a.id}`),
}));

// Self-hosted, compressed MP4s (H.264, 720p) with a WebP poster each.
export const videos = [
  { id: "video0", title: "President Address - SmartIDEAthon 2022" },
  { id: "video1", title: "Vice Chancellor Address - SmartIDEAthon 2022" },
  { id: "video2", title: "Hygienity Solutions Pvt Ltd Testimonial" },
  { id: "video3", title: "Fleetwings Testimonial" },
  { id: "video4", title: "Fleetwings Testimonial II" },
  { id: "video5", title: "Band Ranga performance at SmartIDEAthon 2022 Concert Night" },
].map((v) => ({ ...v, src: `/videos/${v.id}.mp4`, poster: `/videos/${v.id}.webp` }));

export const editionVideos = [
  { title: "GIC 2023 video", href: "https://www.youtube.com/watch?v=j8kJyPZkeFo&t=7s", thumb: "/media/brand/2023video.webp" },
  { title: "GIC 2024 video", href: "https://www.youtube.com/live/u8Nlsx_jOp0", thumb: "/media/brand/2024video.webp" },
] as const;
