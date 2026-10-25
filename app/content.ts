export const storyCopy = {
  annotation: "Một câu chuyện, vẫn đang viết.",
  pairs: [
    ["Tôi vẫn thường bước đi", "một mình như thế."],
    ["Không phải vì tôi chưa từng", "muốn có ai ở bên."],
    ["Tôi chỉ vẫn tìm kiếm", "một bàn tay để tin tưởng."],
  ],
  trust: [
    "Vậy nên, tôi đã đưa tay ra.",
    "Tôi đã nghĩ niềm tin sẽ được đáp lại.",
    "Có những bàn tay đã dạy tôi điều khác.",
  ],
  bloom: [
    "Đã có lúc, tôi nghĩ mình không thể lớn thêm nữa.",
    "Có những đổi thay diễn ra ở nơi chẳng ai nhìn thấy.",
    "Rồi từng chút một, tôi tìm về phía ánh sáng.",
  ],
  noise: {
    annotation: "Yên lặng không phải lúc nào cũng bình yên.",
    heading: "Rồi những ồn ào\nchuyển vào bên trong.",
    body: "Tôi nghĩ lại từng khoảnh khắc.\nTừng lời nói.\nNhững điều đáng lẽ mình nên nói.\n\nĐến khi cả yên lặng cũng trở nên chật chội.",
  },
  love: [
    "For a while, alone became together.",
    "I thought we had more time.",
    "Some futures only happen in our heads.",
  ],
  closing: ["What comes next", "is unwritten."],
};
export const chapters = [
  ["beginning", "Chương 1"],
  ["trust", "Chương 2"],
  ["noise", "Chương 3"],
  ["almost-us", "Chương 4"],
  ["family", "Chương 5"],
  ["becoming", "Chương 6"],
  ["stories", "Góc đọc"],
] as const;
export type SceneName = "walk" | "trust" | "love" | "bloom";
export const motion = {
  fade: 0.045,
  flowerHoldStart: 0.84,
  love: { holdStart: 0.88, fadeStart: 0.94 },
  cloud: { heroStart: 0.82, trustEnd: 0.18, texture: "/media/cloud-bank.webp" },
  beats: {
    walk: [
      [0, 0.27],
      [0.35, 0.6],
      [0.68, 0.86],
    ],
    trust: [
      [0, 0.22],
      [0.25, 0.43],
      [0.47, 1],
    ],
    bloom: [
      [0, 0.23],
      [0.28, 0.61],
      [0.66, 1],
    ],
    // Source inspected at 0–9s: fade begins ~3.5s, the seat is empty by ~5.2s.
    love: [
      [0, 0.29],
      [0.32, 0.49],
      [0.54, 1],
    ],
  } as Record<SceneName, number[][]>,
};
export const media = {
  love: {
    src: "/media/love.mp4",
    mobileSrc: "/media/love-mobile.mp4",
    mobilePoster: "/media/love-mobile.webp",
    poster: "/media/love.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description: "Hai người ngồi cạnh nhau trên mây. Người bên cạnh dần nhạt đi, để lại nhân vật nam và một chỗ ngồi trống.",
  },
  walk: {
    src: "/media/walk.mp4",
    poster: "/media/walk.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description: "Một người bước đi trên những đám mây, được vẽ bằng nét chì.",
  },
  trust: {
    src: "/media/trust.mp4",
    poster: "/media/trust.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description:
      "Hai bàn tay tiến lại gần nhau; lời mời kết nối trở thành một cử chỉ gây tổn thương.",
  },
  noise: {
    src: "/media/noise.mp4",
    poster: "/media/noise.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description:
      "Một người nằm cuộn mình giữa những nét chì rối và biểu tượng suy tư.",
  },
  bloom: {
    src: "/media/bloom.mp4",
    poster: "/media/bloom.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description:
      "Bông hướng dương khô héo, đen trắng dần nở vàng với những chiếc lá xanh.",
  },
};
