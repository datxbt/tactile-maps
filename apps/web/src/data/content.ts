import type { FeatureKind, ProjectStatus } from "@capstone/shared";

export const homeContent = {
  heading: "Tạo bản đồ",
  subheading:
    "Tải lên sơ đồ mặt bằng. Tác tử AI đọc sơ đồ, bạn chỉnh sửa lại, rồi tải về bản đồ xúc giác để in 3D.",
  uploadTitle: "Tải lên sơ đồ mặt bằng",
  uploadDescription: "PNG, JPG hoặc WebP, tối đa 10 MB. Sơ đồ 2D nhìn từ trên xuống, rõ ràng sẽ cho kết quả tốt nhất.",
  fileLabel: "Ảnh sơ đồ mặt bằng",
  nameLabel: "Tên (không bắt buộc)",
  modelLabel: "Mô hình AI",
  modelHint: "Chi phí ước tính cho mỗi lần chạy. Mô hình mạnh hơn thường chính xác hơn nhưng tốn hơn.",
  modelPrice: (cents: number) => (cents < 1 ? "<1¢ mỗi lần" : `~${cents}¢ mỗi lần`),
  modelDefault: "mặc định",
  namePlaceholder: "VD: Thư viện, tầng 2",
  upload: "Tải lên và đọc sơ đồ",
  uploading: "Đang tải lên…",
  sample: "Dùng thử văn phòng mẫu (không cần khóa AI)",
  projectsTitle: "Bản đồ của bạn",
  noProjects: "Chưa có bản đồ nào.",
  open: "Mở",
  delete: "Xóa",
} as const;

export const statusLabels: Record<ProjectStatus, string> = {
  uploaded: "Đã tải lên",
  parsing: "Đang đọc sơ đồ…",
  ready: "Sẵn sàng",
  failed: "Thất bại",
};

export const workspaceContent = {
  back: "← Bản đồ của bạn",
  parsingTitle: "Tác tử phân tích đang đọc sơ đồ của bạn",
  parsingDescription: "Thường mất từ 1 đến 3 phút. Trang sẽ tự cập nhật.",
  failedTitle: "Đọc sơ đồ thất bại",
  retry: "Thử lại",
  editTab: "1. Kiểm tra và chỉnh sửa",
  previewTab: "2. Xem 3D và xuất tệp",
} as const;

// Names of the symbol kinds, shown in the editor.
export const featureNames: Record<FeatureKind, string> = {
  stairs: "Cầu thang",
  elevator: "Thang máy",
  entrance: "Lối vào",
  restroom: "Nhà vệ sinh",
};

export const editorContent = {
  tools: {
    select: "Chọn / di chuyển",
    wall: "Thêm tường",
    door: "Thêm cửa",
  },
  featureTools: {
    stairs: "Thêm cầu thang",
    elevator: "Thêm thang máy",
    entrance: "Thêm lối vào",
    restroom: "Thêm nhà vệ sinh",
  } satisfies Record<FeatureKind, string>,
  // Short letters drawn inside each symbol on the canvas.
  featureLetters: {
    stairs: "CT",
    elevator: "TM",
    entrance: "LV",
    restroom: "WC",
  } satisfies Record<FeatureKind, string>,
  hints: {
    select: "Nhấp vào một phần tử để chọn. Kéo các chấm tròn để di chuyển điểm.",
    wall: "Nhấp vào điểm đầu, rồi điểm cuối của bức tường mới.",
    wallSecond: "Giờ hãy nhấp vào điểm cuối. Nhấn Esc để hủy.",
    door: "Nhấp lên bức tường tại vị trí cần đặt cửa.",
    feature: "Nhấp vào vị trí cần đặt ký hiệu.",
  },
  aiModel: "Mô hình AI",
  noAiModel: "Không có (bản mẫu, vẽ tay)",
  aiModelNotRecorded: "Không được ghi lại (đọc trước khi có tính năng này)",
  save: "Lưu thay đổi",
  saving: "Đang lưu…",
  saved: "Đã lưu mọi thay đổi",
  unsaved: "Có thay đổi chưa lưu",
  reviewCount: (count: number) =>
    count === 0 ? "Không có gì cần kiểm tra" : `${count} phần tử cần kiểm tra`,
  nextReview: "Xem tiếp",
  noSelection: "Chưa chọn gì.",
  kinds: { wall: "Tường", door: "Cửa", room: "Phòng", feature: "Ký hiệu" },
  confidence: "Độ tin cậy của AI",
  needsReview: "Cần kiểm tra: AI không chắc chắn về phần tử này.",
  label: "Tên phòng",
  doorWidth: "Độ rộng cửa (px)",
  markChecked: "Đánh dấu đã kiểm tra",
  delete: "Xóa",
  aiTitle: "Chỉnh sửa bằng tác tử AI",
  aiPlaceholder: 'VD: "Thêm một cửa giữa sảnh và hành lang"',
  aiSubmit: "Áp dụng",
  aiWorking: "Tác tử chỉnh sửa đang làm việc…",
} as const;

export const previewContent = {
  viewerLabel: "Xem 3D tấm bản đồ xúc giác",
  loading: "Đang dựng tấm bản đồ…",
  loadError: "Không tải được mô hình 3D từ API.",
  legendTitle: "Chú giải chữ nổi",
  legendDescription: "Mỗi phòng có một mã chữ nổi ngắn trên bản đồ. Tấm chú giải ghi đầy đủ tên phòng.",
  noLegend: "Không có phòng nào được đặt tên nên không có chú giải.",
  warningsTitle: "Kiểm tra",
  noWarnings: "Đạt tất cả các bước kiểm tra.",
  downloadMap: "Tải bản đồ .stl",
  downloadLegend: "Tải chú giải .stl",
  printTip: "In nằm phẳng trên bàn in, đầu phun 0,4 mm, không cần giá đỡ. Tấm có kích thước 200 × 200 mm.",
  symbolsTitle: "Ký hiệu",
  symbols: [
    "Đường nổi: tường (chỗ hở là cửa)",
    "Ba thanh ngang: cầu thang",
    "Hình vuông có chấm: thang máy",
    "Hình tam giác: lối vào",
    "Hình tròn có chấm: nhà vệ sinh",
    "Tam giác ở góc: góc trên bên trái của bản đồ",
  ],
} as const;

export const apiErrors = {
  unreachable: "Không kết nối được với API. API có đang chạy ở cổng 3003 không?",
  requestFailed: (status: number) => `Yêu cầu thất bại (${status})`,
} as const;
