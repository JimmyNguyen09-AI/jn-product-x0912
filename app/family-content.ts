export const memories = [
  {
    id: "home", label: "Home", caption: "My first home. My constant.",
    alt: "Gia đình bốn người: bố, mẹ, anh trai và tôi ngồi bên nhau trong nhà.",
    original: "/d9371ef0-545a-4181-8207-bac1175a6b12.png",
  },
  {
    id: "mums-side", label: "Mum’s side", caption: "Some love stays, even when someone is no longer here.",
    alt: "Bà ngoại cùng ba cậu và ba mợ; hình bóng ông ngoại đã mất được giữ nhẹ phía sau như một lời tưởng nhớ.",
    original: "/3bab7d7f-e10a-4b9a-80b6-8e39e60b9f86.png",
  },
  {
    id: "growing-up", label: "Growing up", caption: "Before we had plans, we had afternoons together.",
    alt: "Năm anh em chơi cùng nhau thời nhỏ: tôi, anh trai, hai em trai và em gái.",
    original: "/2ceea3e0-3e54-4bf9-9075-b64ff69ca8cc.png",
  },
  {
    id: "dads-side", label: "Dad’s side", caption: "The kind of warmth that never needed many words.",
    alt: "Ông bà nội ngồi bên nhau trước hiên nhà, cạnh bàn trà và những chậu cây.",
    original: "/1ed7e378-0f4d-47a3-890a-c504acf8b2d0.png",
  },
] as const;
export function memoryThumbnail(index: number, width = 960) {
  return `/media/family/${memories[index].id}-${width}.webp`;
}
