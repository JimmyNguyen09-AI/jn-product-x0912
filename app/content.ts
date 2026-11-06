export const storyCopy = {
  annotation: "Một câu chuyện, vẫn đang viết.",
  pairs: [
    ["Tôi vẫn hay đi", "một mình như thế."],
    ["Không phải vì tôi chưa từng", "muốn có ai bên cạnh."],
    ["Chỉ là tôi vẫn đang tìm", "một bàn tay để tin."],
  ],
  trust: [
    "Thế nên tôi đưa tay ra.",
    "Tôi cứ tin là mình sẽ được nắm lại.",
    "Có những bàn tay dạy tôi điều ngược lại.",
  ],
  bloom: [
    "Có dạo tôi nghĩ mình chẳng lớn thêm được nữa.",
    "Hoá ra có những thứ đổi thay ở chỗ không ai nhìn.",
    "Rồi từng chút, tôi quay về phía ánh sáng.",
  ],
  noise: {
    annotation: "Yên lặng không hẳn là bình yên.",
    heading: "Rồi tiếng ồn\nchuyển hết vào trong.",
    body: "Tôi tua lại từng khoảnh khắc.\nTừng câu đã nói.\nNhững câu lẽ ra nên nói mà thôi.\n\nĐến lúc cả yên lặng cũng thấy chật.",
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
    description: "Hai người ngồi cạnh nhau trên mây. Người bên cạnh mờ dần, chỉ còn lại chàng trai và một chỗ ngồi trống.",
  },
  walk: {
    src: "/media/walk.mp4",
    poster: "/media/walk.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description: "Một người đang đi trên mây, vẽ bằng nét chì.",
  },
  trust: {
    src: "/media/trust.mp4",
    poster: "/media/trust.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description:
      "Hai bàn tay đưa về phía nhau; lời mời nắm lấy rồi trở thành một cử chỉ làm đau.",
  },
  noise: {
    src: "/media/noise.mp4",
    poster: "/media/noise.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description:
      "Một người nằm co lại giữa những nét chì rối và mấy dấu suy nghĩ lộn xộn.",
  },
  bloom: {
    src: "/media/bloom.mp4",
    poster: "/media/bloom.webp",
    position: "50% 50%",
    mobilePosition: "50% 50%",
    description:
      "Bông hướng dương héo, đen trắng, dần nở vàng và mọc ra những chiếc lá xanh.",
  },
};
