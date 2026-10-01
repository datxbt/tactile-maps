// Text for the informational pages (landing, about, guides, gallery).
// Adapted from bumps-main and translated; kept true to what this app does.

export const navigationContent = {
  label: "Điều hướng chính",
  brand: "Bản đồ xúc giác",
  links: [
    { href: "/the-need-for-this", label: "Nhu cầu" },
    { href: "/what-it-does", label: "Chức năng" },
    { href: "/how-it-works", label: "Cách hoạt động" },
    { href: "/gallery", label: "Thư viện mẫu" },
    { href: "/input-guide", label: "Chọn ảnh đầu vào" },
  ],
  cta: { href: "/maps", label: "Tạo bản đồ" },
} as const;

export const landingContent = {
  heading: "Bản đồ xúc giác",
  subheading: "Tạo bản đồ xúc giác cho người khiếm thị trong vài phút, thay vì vài tuần.",
  tagline:
    "Không cần đặt làm thủ công. Tải lên sơ đồ mặt bằng, kiểm tra lại, rồi in bằng máy in 3D phổ thông.",
  cta: "Bắt đầu tạo bản đồ",
  ctaHref: "/maps",
  guideLabel: "Ví dụ ảnh sơ đồ tốt và chưa tốt",
  guideHref: "/input-guide",
  compliance: {
    lead: "Kích thước chữ nổi, ký hiệu và khoảng cách tuân theo",
    standards: [
      {
        name: "BANA 2022",
        fullName:
          "Guidelines and Standards for Tactile Graphics (2022), Braille Authority of North America",
        href: "https://www.brailleauthority.org/tg/",
      },
      {
        name: "ADA §703",
        fullName: "ADA Standards for Accessible Design §703: chữ nổi và biển báo xúc giác",
        href: "https://www.access-board.gov/ada/guides/chapter-7-signs/",
      },
    ],
    joiner: " và ",
    tail: ". Mọi vi phạm đều được cảnh báo trước khi xuất tệp.",
  },
} as const;

export const footerContent = {
  text: "Dự án capstone · Phiên bản đơn giản hóa của bumps",
} as const;

export const infoPages = {
  theNeed: {
    title: "Nhu cầu",
    paragraphs: [
      "Bước vào một tòa nhà lạ khi không nhìn thấy nghĩa là thiếu đi thứ mà mọi khách khác đều có sẵn: hình dung về bố cục. Người sáng mắt chỉ cần liếc bảng sơ đồ ở sảnh. Người khiếm thị phải hỏi đường, ghi nhớ lời chỉ dẫn, hoặc tự dò đường.",
      "Bản đồ xúc giác lấp khoảng trống đó. Đọc một lần bằng đầu ngón tay ở lối vào, bạn mang theo cả bố cục: hành lang dẫn đi đâu, cầu thang và thang máy ở đâu, cửa nào là cửa cần tìm.",
      "Thế nhưng gần như không tòa nhà nào có bản đồ như vậy, vì mỗi bản đồ xúc giác đều phải đặt làm riêng: chuyên gia nghiên cứu sơ đồ, thiết kế theo tiêu chuẩn xúc giác, sản xuất rồi giao hàng. Quá chậm và tốn kém nên rất ít nơi đặt làm.",
      "Máy in 3D thì đã có ở khắp nơi: trường học, thư viện, xưởng chế tạo. Thứ còn thiếu là bước thiết kế, và đó chính là phần dự án này tự động hóa.",
    ],
  },
  whatItDoes: {
    title: "Chức năng",
    paragraphs: [
      "Ứng dụng biến sơ đồ mặt bằng thành bản đồ xúc giác: mô hình nổi của tòa nhà mà người mù và người thị lực kém đọc bằng đầu ngón tay.",
      "Hiện nay những bản đồ này được làm thủ công: chuyên gia khảo sát tòa nhà, thiết kế bố cục, sản xuất và giao hàng. Quá chậm và tốn kém nên phần lớn các tòa nhà không bao giờ có.",
      "Ứng dụng tự động hóa quy trình: tải lên sơ đồ, kiểm tra những gì AI hiểu được, rồi tải về tệp in 3D có chữ nổi, ký hiệu xúc giác chuẩn và khoảng cách đủ để đầu ngón tay phân biệt.",
    ],
  },
  howItWorks: {
    title: "Cách hoạt động",
    steps: [
      {
        title: "Tải lên sơ đồ mặt bằng",
        description: "Ảnh PNG, JPG hoặc WebP của một tầng, tối đa 10 MB.",
      },
      {
        title: "AI đọc sơ đồ",
        description:
          "Tác tử AI nhận diện tường, cửa, phòng, cầu thang, thang máy, lối vào và nhà vệ sinh, kèm độ tin cậy cho từng phần tử.",
      },
      {
        title: "Bạn xác nhận",
        description:
          "Xem lại kết quả trên khung chỉnh sửa. Phần tử AI chưa chắc chắn được đánh dấu. Sửa bằng tay, hoặc mô tả thay đổi bằng lời.",
      },
      {
        title: "Chuyển thành bản đồ xúc giác",
        description:
          "Phòng trở thành hình nổi, tên phòng trở thành mã chữ nổi, và mọi thứ được giãn cách để đầu ngón tay phân biệt được, theo tiêu chuẩn đồ họa xúc giác.",
      },
      {
        title: "In ra",
        description:
          "Tải tệp STL 200 × 200 mm cùng tấm chú giải, in nằm phẳng trên máy in 3D phổ thông, không cần giá đỡ.",
      },
    ],
  },
} as const;

export const inputGuideContent = {
  title: "Chọn sơ đồ rõ ràng",
  intro: "AI đọc tốt nhất khi có thể lần theo tường, cửa và ranh giới phòng trực tiếp trên ảnh.",
  rule: "Quy tắc chung: nếu bạn có thể lần theo mọi bức tường và cửa khi nhìn thẳng từ trên xuống, đó thường là ảnh đầu vào tốt.",
  examples: [
    {
      label: "Ảnh tốt",
      title: "Sơ đồ mặt bằng 2D",
      image: "/gallery/test-library-floor-plan-source.png",
      alt: "Sơ đồ thư viện đen trắng nhìn từ trên xuống, thấy rõ tường, cửa, phòng và đồ nội thất",
      points: [
        "Nhìn thẳng từ trên xuống, chỉ một tầng.",
        "Tường và cửa sắc nét, tương phản cao.",
        "Bố cục phòng dễ đọc, ít chi tiết trang trí.",
      ],
    },
    {
      label: "Ảnh chưa tốt",
      title: "Phối cảnh hoặc ảnh 3D",
      image: "/gallery/study-cch-2f-plan.jpg",
      alt: "Ảnh phối cảnh 3D của một trung tâm hội nghị với tường nghiêng, bóng đổ và các không gian chồng lên nhau",
      points: [
        "Góc nhìn nghiêng làm sai lệch khoảng cách và hình dạng tường.",
        "Mái, bóng đổ và đồ vật che mất ranh giới phòng.",
        "Nhiều sảnh hoặc nhiều tầng hiển thị cùng lúc.",
      ],
    },
  ],
} as const;

export type GalleryItem = {
  slug: string;
  title: string;
  description: string;
  source: string;
  stl: string;
};

export const galleryContent = {
  title: "Thư viện mẫu",
  intro:
    "Các ví dụ dưới đây được tạo bởi bumps, dự án gốc của ứng dụng này, với quy trình AI nhiều bước. Mỗi tấm có kích thước 200 × 200 mm.",
  sourceLabel: "Sơ đồ tải lên",
  stlLabel: "Tấm in 3D",
  downloadLabel: "Tải STL",
  entries: [
    {
      slug: "burke-museum",
      title: "Bảo tàng Burke · Tầng 2",
      description: "9 phòng, 22 bức tường, 1 cửa đã kiểm chứng và 8 ký hiệu định hướng, vừa một tấm.",
      source: "/gallery/burke-museum-source.png",
      stl: "/gallery/burke-museum-map.stl",
    },
    {
      slug: "library",
      title: "Sơ đồ thư viện",
      description: "5 phòng, 13 bức tường, 4 cửa, 4 ký hiệu định hướng và 11 nhóm nội thất.",
      source: "/gallery/test-library-floor-plan-source.png",
      stl: "/gallery/test-library-floor-plan.stl",
    },
    {
      slug: "restrooms",
      title: "Khu vệ sinh công cộng",
      description: "10 phòng, 25 bức tường, 10 cửa và 3 ký hiệu định hướng.",
      source: "/gallery/test-public-restrooms-source.png",
      stl: "/gallery/test-public-restrooms.stl",
    },
    {
      slug: "office",
      title: "Sơ đồ văn phòng",
      description: "5 phòng, 14 bức tường, 5 cửa, 3 ký hiệu định hướng và 3 nhóm nội thất.",
      source: "/gallery/office-plan.png",
      stl: "/gallery/office-map.stl",
    },
  ] satisfies GalleryItem[],
} as const;
