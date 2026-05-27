/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from "react";
import { 
  Brain, 
  Cpu, 
  Zap, 
  Shield, 
  Coins, 
  Phone, 
  Mail, 
  User, 
  Users, 
  TrendingUp, 
  Layers, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Code, 
  AlertCircle, 
  FileText, 
  Check,
  Server,
  Network,
  Lock,
  Hourglass,
  Clock,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  Star,
  Eye,
  Settings,
  ShieldAlert,
  Plus,
  Trash2
} from "lucide-react";
import { Registration, AnalysisResult } from "./types";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, getDocs, setDoc, doc, query, orderBy } from "firebase/firestore";

// Pre-populated realistic submissions of applications built for Vietnamese businesses
const INITIAL_DEMOS: Registration[] = [
  {
    id: "demo-1",
    industry: "Thương mại điện tử",
    description: "Website bán nông sản sạch và sản phẩm OCOP miền Tây có tối ưu SEO, giỏ hàng thông minh và tích hợp thanh toán mã QR MoMo/VNPAY.",
    contactName: "Phạm Minh Trí",
    contactEmail: "minhtri.mientay@gmail.com",
    contactPhone: "0945223311",
    proposedPrice: 15000000,
    submittedAt: "2026-05-27T08:30:00Z",
    status: "analyzed",
    analysisResult: {
      projectTitle: "Mekong Organic AI-Grid",
      executiveSummary: "Nền tảng thương mại điện tử chuyên biệt nông sản OCOP, tự động tối ưu hóa trải nghiệm tìm kiếm nông sản địa phương bằng hệ thống đề xuất thông minh. Giải quyết trực tiếp bài toán đầu ra bền vững cho hợp tác xã.",
      recommendedArchitecture: "Client-Server API (Jamstack với SPA React và Express Serverless)",
      estimatedTimeline: [
        { phaseName: "Phác thảo Giao diện UX và Trải nghiệm Thanh toán QR", duration: "4 ngày", deliverables: ["Bản vẽ Prototype Figma di động", "Luồng thanh toán không chạm"] },
        { phaseName: "Thiết lập Serverless API và Tích hợp Ví Điện tử", duration: "6 ngày", deliverables: ["Cơ sở dữ liệu MongoDB", "Webhooks tích hợp thanh toán MoMo/VNPAY"] },
        { phaseName: "Tối ưu hóa SEO & Khởi chạy Bản thử nghiệm", duration: "3 ngày", deliverables: ["Hệ thống sitemap tự động", "Bản chạy thử trên Cloud"] }
      ],
      keyFeatures: [
        { name: "QR MoMo & VNPAY Đột phá", details: "Mã QR động tự tạo theo từng hóa đơn, khách hàng quét thanh toán an toàn tức thì không cần nhập số tiền.", icon: "Coins" },
        { name: "Giao vận Tự động", details: "Liên kết trực tiếp API cùng Giao Hàng Tiết Kiệm (GHTK) để cập nhật cước phí và hành trình đơn hàng theo thời gian thực.", icon: "Zap" },
        { name: "Trợ lý Chat AI Tư vấn", details: "Trợ lý hỗ trợ khách hàng tự động giải đáp nguồn gốc xuất xứ của từng loại nông sản sạch.", icon: "Brain" }
      ],
      techStack: [
        { category: "Trải nghiệm Người dùng", tech: "ReactJS + Tailwind CSS v4", reason: "Khởi tạo nhanh chóng, tối ưu hóa điểm trải nghiệm Pagespeed trên di động cực tốt." },
        { category: "Hệ Thống Máy Chủ", tech: "NodeJS & ExpressJS", reason: "Khả năng mở rộng cao, kết xuất API siêu tốc." },
        { category: "Kho Dữ Liệu", tech: "MongoDB", reason: "Lưu giữ thông tin đơn hàng dạng NoSQL linh hoạt, không lo gãy cấu trúc khi thêm phân loại hàng hóa." }
      ],
      databaseSchema: [
        { tableName: "products", description: "Lưu giữ sản phẩm sạch, hình ảnh và chứng nhận OCOP.", columns: ["id (Khóa chính)", "name (Tên OCOP)", "price (Giá tiền)", "stock (Số lượng)", "certificate_rating (Số sao)"] },
        { tableName: "orders", description: "Lưu vết đơn hàng và trạng thái xuất QR thanh toán.", columns: ["id (Khóa chính)", "customer_id", "total_price", "payment_status_code", "shipment_tracking_num"] }
      ],
      budgetAssessment: "Mức ngân sách đề xuất 15,000,000đ hoàn hảo cho một nền tảng bán hàng tinh gọn tích hợp thanh toán tự động cao cấp. Chúng tôi sẽ tối ưu nhờ sử dụng hệ thống API mở và không lạm dụng các máy chủ tốn kém."
    }
  },
  {
    id: "demo-2",
    industry: "Quản lý F&B / Cafe / Nhà hàng",
    description: "App quản lý chuỗi quán trà sữa tích hợp gọi món tại bàn qua quét mã QR, tự động phân phối đơn xuống nhà bếp di động và xuất báo cáo doanh thu cuối ngày.",
    contactName: "Nguyễn Thị Mai",
    contactEmail: "maitea.sales@gmail.com",
    contactPhone: "0912334455",
    proposedPrice: 8000000,
    submittedAt: "2026-05-27T10:15:00Z",
    status: "analyzed",
    analysisResult: {
      projectTitle: "SmartTea - Trợ lý Kiosk Thông Minh",
      executiveSummary: "Hệ sinh thái số hóa dịch vụ F&B tinh gọn, cho phép gọi món không chạm tại thực địa thông qua QR table riêng biệt. Hệ thống đồng bộ thông tin đơn ăn uống trực diện tới nhà bếp, nâng cao tốc độ phục vụ lên 40%.",
      recommendedArchitecture: "Realtime Multi-Client Architecture (Sử dụng Web Sockets đồng bộ bếp & quầy)",
      estimatedTimeline: [
        { phaseName: "Số hóa Menu & Tạo QR Code bàn tương tác", duration: "3 ngày", deliverables: ["Giao diện đặt đồ mượt mà di động", "Bộ sinh mã QR bàn"] },
        { phaseName: "Luồng hiển thị Bếp thời gian thực", duration: "5 ngày", deliverables: ["Bàn giao màn hình bếp nhận đơn tự động", "Báo động rung âm thanh"] },
        { phaseName: "Hệ quản trị & Đo lường doanh thu", duration: "2 ngày", deliverables: ["Bảng quản trị của chủ quán", "Xuất file báo cáo Excel tự động"] }
      ],
      keyFeatures: [
        { name: "Quét QR Gọi món Tại Bàn", details: "Mỗi bàn ăn tương ứng 1 mã bảo mật. Nhấn gọi món trực diện trên điện thoại không cần gọi phục vụ.", icon: "Cpu" },
        { name: "Đồng bộ Bếp Thời gian thực", details: "Món ăn ngay lập tức hiện ra ở máy tính bảng của Bếp trưởng kèm ghi chú ngọt/đá rõ ràng.", icon: "Layers" },
        { name: "Báo cáo Doanh số Cuối ngày", details: "Hệ thống tự động gói dữ liệu gửi báo cáo về Zalo của chủ tiệm vào đúng 23h00 hàng ngày.", icon: "Briefcase" }
      ],
      techStack: [
        { category: "Web Khách hàng", tech: "Vite + React Lite", reason: "Tải trang siêu cấp dưới 0.8s, phù hợp cho khách hàng bật mạng 3G/4G chập chờn." },
        { category: "Máy chủ Kết nối", tech: "Express + Socket.io", reason: "Truyền nhận thông tin giữa Khách - Quầy - Bếp tức thời không có độ trễ." },
        { category: "Lưu Trữ Cơ Bản", tech: "PostgreSQL", reason: "Khóa ngoại chặt chẽ tránh thất thoát tiền bạc hoặc lệch số liệu đơn món." }
      ],
      databaseSchema: [
        { tableName: "tables", description: "Quản lý trạng thái và mã bàn của quán.", columns: ["id (Khóa chính)", "table_number (Số bàn)", "is_active (Trạng thái)"] },
        { tableName: "menu_items", description: "Danh sách đồ uống trà sữa và toppings.", columns: ["id", "item_name", "price_base", "is_available"] },
        { tableName: "order_items", description: "Chi tiết các món được chọn trong lượt gọi.", columns: ["id", "order_id", "item_name", "quantity", "notes_sugar_ice"] }
      ],
      budgetAssessment: "Với ngân sách 8,000,000đ, đây là mức giá tối ưu cho một giải pháp vận hành nội bộ. Hệ thống sẽ bỏ qua phần thanh toán ngân hàng quốc tế phức tạp để tập trung làm thật mượt khâu nhận món tại bàn và báo cáo doanh thu nội bộ."
    }
  },
  {
    id: "demo-3",
    industry: "Quản lý CLB - Đội - Nhóm",
    description: "Giao diện web tinh gọn quản lý danh sách thành viên Câu lạc bộ, theo dõi chuyên cần (điểm danh sinh hoạt), quản lý quỹ thu chi nội bộ nhóm và lịch sinh hoạt.",
    contactName: "Trần Tuấn Kiệt",
    contactEmail: "kietclb.it@gmail.com",
    contactPhone: "0356112233",
    proposedPrice: 750000,
    submittedAt: "2026-05-27T12:00:00Z",
    status: "analyzed",
    analysisResult: {
      projectTitle: "ClubZone Lite - Quản Lý Thành Viên & Sổ Quỹ",
      executiveSummary: "Giải pháp phần mềm chạy trực tiếp trên trình duyệt di động giúp Ban điều hành CLB, Đội, Nhóm quy mô vừa và nhỏ quản trị thông suốt về nhân sự, lịch sinh hoạt và minh bạch hóa quỹ tài chính nhóm.",
      recommendedArchitecture: "Single Page Application (SPA React) lưu trữ tại thiết bị di động (Local Storage) hoặc Firebase Firestore gói miễn phí Spark.",
      estimatedTimeline: [
        { phaseName: "Thiết kế Giao diện Danh sách & Bộ lọc Thành viên", duration: "1 ngày", deliverables: ["Màn hình phân loại ban/chức vụ chuyên biệt", "Bộ đếm sỹ số tự động"] },
        { phaseName: "Xây dựng Mô-đun Điểm danh & Sổ quỹ Thu chi", duration: "1 ngày", deliverables: ["Tính năng tích điểm danh nhanh", "Lịch sử biến động quỹ trực quan"] }
      ],
      keyFeatures: [
        { name: "Điểm danh Nhanh", details: "Hỗ trợ chấm điểm danh thành viên tham gia sinh hoạt nhanh chóng, tự động thống kê tỷ lệ chuyên cần.", icon: "User" },
        { name: "Minh bạch Sổ Quỹ", details: "Ghi nhận nguồn thu (quỹ tháng, tài trợ) và khoản chi (nước uống, in ấn) công khai minh bạch đối chiếu tức thời.", icon: "Coins" },
        { name: "Lịch Hoạt động Nhóm", details: "Bảng lịch trình hoạt động sắp tới giúp các thành viên cập nhật địa điểm và thời gian dễ dàng.", icon: "Clock" }
      ],
      techStack: [
        { category: "Giao diện chính", tech: "ReactJS + Tailwind CSS v4", reason: "Xây dựng siêu tốc, tối ưu hiển thị mượt mà trên tất cả thiết bị di động của học viên." },
        { category: "Lưu dữ liệu", tech: "Firebase Firestore / Local Storage Backup", reason: "Tuyệt đối không phát sinh chi phí duy trì máy chủ hàng tháng." }
      ],
      databaseSchema: [
        { tableName: "members", description: "Lưu trữ thông tin thành viên CLB.", columns: ["id (Mã định danh)", "full_name (Họ tên)", "role (Chức vụ/Ban)", "status (Đang hoạt động/Dự bị)"] },
        { tableName: "transactions", description: "Nhật ký thu chi quỹ câu lạc bộ.", columns: ["id", "amount (Số tiền)", "type (Thu/Chi)", "reason (Lý do)", "created_by"] }
      ],
      budgetAssessment: "Mức ngân sách 750.000đ cực kỳ thiết thực cho các câu lạc bộ, đội nhóm học sinh/sinh viên. Bằng việc tận dụng dịch vụ lưu trữ miễn phí của Firebase kết hợp mã nguồn tĩnh chạy trên trình duyệt, hệ thống hoạt động ổn định trọn vẹn mà phí duy trì hàng kỳ bằng 0!"
    }
  },
  {
    id: "demo-4",
    industry: "Quản lý Chi tiêu Cá nhân",
    description: "Web app mini quản lý chi tiêu hàng ngày cho sinh viên Việt Nam, tự động phân bổ thu nhập vào các lọ tài chính tinh giản và đưa ra cảnh báo khi vượt hạn mức.",
    contactName: "Lê Thùy Linh",
    contactEmail: "thuylinh.student@gmail.com",
    contactPhone: "0865556677",
    proposedPrice: 450000,
    submittedAt: "2026-05-27T14:45:00Z",
    status: "analyzed",
    analysisResult: {
      projectTitle: "GenzSpend - Số Tay Tài Chính Học Đường",
      executiveSummary: "Ứng dụng tài chính cá nhân siêu nhẹ cho học sinh, sinh viên giúp kiểm soát chi phí sinh hoạt hàng ngày, ghi chép nhanh các khoản ăn uống, nhà trọ, học phí và nhắc nhở chi tiêu quá đà.",
      recommendedArchitecture: "Progressive Web App (PWA) thiết lập trực diện offline-first.",
      estimatedTimeline: [
        { phaseName: "Thiết kế Luồng nhập nhanh & Phân loại ví", duration: "1 ngày", deliverables: ["Form tạo giao dịch trong 3 giây", "Đồ thị biểu diễn cơ cấu chi tiêu"] }
      ],
      keyFeatures: [
        { name: "Ghi chép Siêu tốc", details: "Giao diện gọn gàng tối đa giúp nhập nhanh khoản chi tiêu kèm ghi chú mượt mà.", icon: "Zap" },
        { name: "Thống kê Cơ cấu Lọ", details: "Trực quan hóa chi tiêu theo tỷ lệ phần trăm phân bổ tài chính giúp học sinh nắm vững quỹ tiền mặt.", icon: "TrendingUp" }
      ],
      techStack: [
        { category: "Ứng dụng", tech: "React SPA + Tailwind CSS v4", reason: "Gói ứng dụng siêu nhẹ, mở trang nhanh chóng và lưu trữ tức thì không phụ thuộc mạng." }
      ],
      databaseSchema: [
        { tableName: "expenses", description: "Lưu trữ nhật ký chi tiêu cá nhân.", columns: ["id", "amount (Số tiền)", "category (Thể loại)", "note (Ghi chú)", "date (Ngày tháng)"] }
      ],
      budgetAssessment: "Chỉ với 450.000đ, ứng dụng được xây dựng theo kiến trúc Progressive Web App tinh gọn. Dữ liệu lưu an toàn trên trình duyệt của người dùng cấu hình bằng LocalStorage hoặc IndexedDB, bảo mật dữ liệu tuyệt đối và hoạt động trơn tru không chi phí vận hành."
    }
  },
  {
    id: "demo-5",
    industry: "Dự án Thư viện Mini Cá nhân",
    description: "Hệ thống quản lý kệ sách, theo dõi lịch mượn trả và gửi cảnh báo quá hạn mượn thông qua giao diện web di động mượt mà cho thư viện lớp học hoặc tủ sách gia đình.",
    contactName: "Vương Quốc Hoài",
    contactEmail: "hoaibookworm@gmail.com",
    contactPhone: "0987654321",
    proposedPrice: 600000,
    submittedAt: "2026-05-27T16:10:00Z",
    status: "analyzed",
    analysisResult: {
      projectTitle: "LibShare - Thư Viện Sách Miền Yêu Thương",
      executiveSummary: "Ứng dụng giúp số hóa danh mục đầu sách trong các nhóm đọc sách, tủ sách cộng đồng hoặc thư viện lớp, hỗ trợ tích cực cho thủ thư trong khâu mượn trả và đôn đốc hạn hoàn trả.",
      recommendedArchitecture: "Client-side SPA kết hợp Google Sheets API hoặc dữ liệu Local Storage backup.",
      estimatedTimeline: [
        { phaseName: "Số hóa kệ sách số & Thiết lập Form mượn sách", duration: "1.5 ngày", deliverables: ["Danh mục đầu sách phân loại thông minh", "Trình đăng ký mượn đơn giản"] }
      ],
      keyFeatures: [
        { name: "Mượn & Trả Tinh Gọn", details: "Tìm kiếm sách và điền thông tin người mượn cực nhanh, lưu trữ vết thông tin trực diện.", icon: "Layers" },
        { name: "Nhắc nhở Hạn Trả", details: "Tự động đánh dấu đỏ các đầu sách cho mượn quá hạn giúp thủ thư kịp thời liên lạc nhắc mượn.", icon: "AlertCircle" }
      ],
      techStack: [
        { category: "Web Client", tech: "Vite + React Lite", reason: "Đảm bảo hiển thị hoàn hảo trên các dòng điện thoại thông minh giá rẻ của học sinh." }
      ],
      databaseSchema: [
        { tableName: "books", description: "Danh mục các cuốn sách hiện có.", columns: ["id", "title (Tên sách)", "author (Tác giả)", "status (Sẵn sàng/Đang cho mượn)"] },
        { tableName: "borrow_logs", description: "Lưu thông tin mượn và hẹn trả.", columns: ["id", "book_id", "borrower_name", "phone", "borrowed_at", "due_date"] }
      ],
      budgetAssessment: "Với ngân sách 600.000đ, việc ứng dụng React kết hợp Google Sheets làm cơ sở dữ liệu nền là phương pháp tối ưu, cho phép chủ thư viện tự chỉnh sửa dữ liệu gốc trên Excel online mà không cần chi tiền nâng cấp database đắt đỏ."
    }
  }
];

export const MENU_SECTIONS = [
  { id: "design-form-section", label: "📝 Đăng Ký Bản Vẽ", description: "Yêu cầu phát triển Web/App" },
  { id: "recent-projects-section", label: "📁 Dự Án Đang Chạy", description: "Theo dõi hồ sơ thiết kế" },
  { id: "ai-blueprint-viewer", label: "💡 Bản Vẽ Chi Tiết AI", description: "Sơ đồ kiến trúc phát sinh" },
];

export interface IndustryPreset {
  name: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  defaultPrice: number;
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    name: "Quản lý CLB - Đội - Nhóm",
    icon: "Users",
    shortDesc: "Điểm danh & Sổ quỹ nội bộ",
    fullDesc: "Giao diện web tinh gọn quản lý danh sách thành viên Câu lạc bộ, theo dõi chuyên cần (điểm danh sinh hoạt), quản lý quỹ thu chi nội bộ nhóm và lịch sinh hoạt dã ngoại.",
    defaultPrice: 750000
  },
  {
    name: "Quản lý Chi tiêu Cá nhân",
    icon: "TrendingUp",
    shortDesc: "Hạn mức lọ & Ghi chép nhanh",
    fullDesc: "Web app mini quản lý chi tiêu hàng ngày cho sinh viên Việt Nam, tự động phân bổ thu nhập vào các lọ tài chính tinh giản và đưa ra cảnh báo khi vượt hạn mức.",
    defaultPrice: 450000
  },
  {
    name: "Dự án Thư viện Mini Cá nhân",
    icon: "Layers",
    shortDesc: "Danh mục & Tìm mượn sách",
    fullDesc: "Hệ thống quản lý kệ sách, theo dõi lịch mượn trả và gửi cảnh báo quá hạn mượn thông qua giao diện web di động mượt mà cho thư viện lớp học hoặc tủ sách gia đình.",
    defaultPrice: 600000
  },
  {
    name: "Thương mại điện tử",
    icon: "Coins",
    shortDesc: "Nông sản OCOP & Bán hàng",
    fullDesc: "Website bán nông sản sạch và sản phẩm OCOP miền Tây có tối ưu SEO, giỏ hàng thông minh và tích hợp thanh toán mã QR MoMo/VNPAY bảo mật.",
    defaultPrice: 15000000
  },
  {
    name: "Quản lý F&B / Cafe / Nhà hàng",
    icon: "Layers",
    shortDesc: "Gọi món QR & Đồng bộ bếp",
    fullDesc: "App quản lý chuỗi quán trà sữa tích hợp gọi món tại bàn qua quét mã QR, tự động phân phối đơn xuống nhà bếp di động và xuất báo cáo doanh thu cuối ngày.",
    defaultPrice: 8000000
  },
  {
    name: "Giáo dục số / EdTech",
    icon: "Brain",
    shortDesc: "E-learning thế hệ mới LMS",
    fullDesc: "Hệ thống quản lý học trực tuyến (LMS) cho trung tâm Tiếng Anh trẻ em, giao bài tập về nhà tương tác, bảng xếp hạng thi đua tích điểm đổi quà, phòng học live-stream tự động.",
    defaultPrice: 20000000
  },
  {
    name: "Tài chính - Fintech",
    icon: "TrendingUp",
    shortDesc: "Sổ thu chi & Web Bank API",
    fullDesc: "Ứng dụng sổ thu chi gia đình thông minh kết nối API nhận thông báo biến động số dư ngân hàng Việt Nam, biểu đồ trực quan hóa chi tiêu theo tháng và AI gợi ý kế hoạch chiết giảm.",
    defaultPrice: 12000000
  },
  {
    name: "Y tế thông minh / Đặt lịch",
    icon: "Shield",
    shortDesc: "Nha khoa & Sổ y bạ bảo mật",
    fullDesc: "App đặt lịch khám bệnh trực tuyến cho phòng mạch nha khoa tổng hợp uy tín, tự động nhắc lịch hẹn qua tin nhắn Zalo ZNS API, bảo vệ dữ liệu hồ sơ bệnh án số hóa.",
    defaultPrice: 18000000
  },
  {
    name: "Sản xuất thông minh / Logistic",
    icon: "Network",
    shortDesc: "Truy xuất VietGAP & Vận tải",
    fullDesc: "Nền tảng chuỗi logistics thông minh tích hợp quét mã QR truy xuất nguồn gốc nông sản VietGAP, định vị bản đồ xe chở hàng và thông báo trạng thái giao hàng thời gian thực.",
    defaultPrice: 25000000
  },
  {
    name: "Ý tưởng khởi nghiệp sáng tạo khác",
    icon: "Sparkles",
    shortDesc: "Mô hình Smart IoT & Khác",
    fullDesc: "Hệ thống quản lý đặt tủ đồ thông minh tự động (Smart Locker) qua mã vạch định danh di động, cổng thanh toán ngân hàng điện tử, tích hợp vi điều khiển nhúng thời gian thực.",
    defaultPrice: 30000000
  }
];

export const renderPresetIcon = (iconName: string, className = "w-4 h-4") => {
  switch (iconName) {
    case "Coins": return <Coins className={className} />;
    case "Layers": return <Layers className={className} />;
    case "Brain": return <Brain className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Network": return <Network className={className} />;
    case "Users": return <Users className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export default function App() {
  const [submissions, setSubmissions] = useState<Registration[]>(INITIAL_DEMOS);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(INITIAL_DEMOS[0]);
  
  // High-tech active session emails with local persistence & Admin role enforcement
  const [sessionEmail, setSessionEmail] = useState<string>(() => {
    return localStorage.getItem("genz_session_email") || "anhhao08916@gmail.com";
  });
  
  const [userPermissions, setUserPermissions] = useState<{ email: string; role: "admin" | "engineer" | "client"; canViewAll: boolean; canViewBlueprint: boolean }[]>(() => {
    const saved = localStorage.getItem("genz_user_permissions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      { email: "anhhao08916@gmail.com", role: "admin", canViewAll: true, canViewBlueprint: true },
      { email: "giamdoc@genz.vn", role: "engineer", canViewAll: true, canViewBlueprint: true },
      { email: "khachhang@genz.vn", role: "client", canViewAll: false, canViewBlueprint: true }
    ];
  });

  // Save permissions upon update
  useEffect(() => {
    localStorage.setItem("genz_user_permissions", JSON.stringify(userPermissions));
  }, [userPermissions]);

  // Synchronize sessionEmail persistence
  useEffect(() => {
    localStorage.setItem("genz_session_email", sessionEmail);
  }, [sessionEmail]);

  // Resolve current active permission schema
  const activeUserPermission = userPermissions.find(p => p.email.trim().toLowerCase() === sessionEmail.trim().toLowerCase()) || {
    email: sessionEmail,
    role: (sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com") ? "admin" as const : "client" as const,
    canViewAll: sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com",
    canViewBlueprint: true
  };

  const isAdmin = activeUserPermission.role === "admin" || activeUserPermission.role === "engineer" || sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com";

  // Form States
  const [industry, setIndustry] = useState("Thương mại điện tử");
  const [proposedPrice, setProposedPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  
  // Prefill contactEmail with sessionEmail to make user flow seamless
  useEffect(() => {
    setContactEmail(sessionEmail);
  }, [sessionEmail]);

  // Sync Form elements based on presets
  useEffect(() => {
    const defaultPreset = INDUSTRY_PRESETS.find(p => p.name === industry);
    if (defaultPreset && !proposedPrice) {
      setProposedPrice(defaultPreset.defaultPrice.toString());
    }
  }, [industry]);

  // Follower tracking with persistent state
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    return localStorage.getItem("genz_is_following") === "true";
  });
  const [followerBase, setFollowerBase] = useState<number>(() => {
    const saved = localStorage.getItem("genz_follower_base");
    return saved ? parseInt(saved, 10) : 8192;
  });

  const handleFollowToggle = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    localStorage.setItem("genz_is_following", nextState ? "true" : "false");
    const nextCount = nextState ? followerBase + 1 : followerBase - 1;
    setFollowerBase(nextCount);
    localStorage.setItem("genz_follower_base", nextCount.toString());
  };

  // Like & Dislike interactive state
  const [userLiked, setUserLiked] = useState<boolean>(() => localStorage.getItem("genz_liked") === "true");
  const [userDisliked, setUserDisliked] = useState<boolean>(() => localStorage.getItem("genz_disliked") === "true");
  const [likesCount, setLikesCount] = useState<number>((() => {
    const saved = localStorage.getItem("genz_likes_count");
    return saved ? parseInt(saved, 10) : 1520;
  }));
  const [dislikesCount, setDislikesCount] = useState<number>((() => {
    const saved = localStorage.getItem("genz_dislikes_count");
    return saved ? parseInt(saved, 10) : 12;
  }));

  const handleLike = () => {
    if (userLiked) {
      setUserLiked(false);
      localStorage.setItem("genz_liked", "false");
      setLikesCount(prev => prev - 1);
      localStorage.setItem("genz_likes_count", (likesCount - 1).toString());
    } else {
      setUserLiked(true);
      localStorage.setItem("genz_liked", "true");
      setLikesCount(prev => prev + 1);
      localStorage.setItem("genz_likes_count", (likesCount + 1).toString());
      if (userDisliked) {
        setUserDisliked(false);
        localStorage.setItem("genz_disliked", "false");
        setDislikesCount(prev => prev - 1);
        localStorage.setItem("genz_dislikes_count", (dislikesCount - 1).toString());
      }
    }
  };

  const handleDislike = () => {
    if (userDisliked) {
      setUserDisliked(false);
      localStorage.setItem("genz_disliked", "false");
      setDislikesCount(prev => prev - 1);
      localStorage.setItem("genz_dislikes_count", (dislikesCount - 1).toString());
    } else {
      setUserDisliked(true);
      localStorage.setItem("genz_disliked", "true");
      setDislikesCount(prev => prev + 1);
      localStorage.setItem("genz_dislikes_count", (dislikesCount + 1).toString());
      if (userLiked) {
        setUserLiked(false);
        localStorage.setItem("genz_liked", "false");
        setLikesCount(prev => prev - 1);
        localStorage.setItem("genz_likes_count", (likesCount - 1).toString());
      }
    }
  };

  // Interactive Product Rating module states
  const [ratingValue, setRatingValue] = useState<number>(() => {
    const saved = localStorage.getItem("genz_user_rating_val");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [averageRating, setAverageRating] = useState<number>(4.9);
  const [ratingsCountTotal, setRatingsCountTotal] = useState<number>(724);
  const [ratingSubmittedFeedback, setRatingSubmittedFeedback] = useState<string | null>(null);

  const handleRatingSubmit = (stars: number) => {
    setRatingValue(stars);
    localStorage.setItem("genz_user_rating_val", stars.toString());
    
    // Recalculate average beautifully
    const totalWeight = (averageRating * ratingsCountTotal) + stars;
    const newTotalCount = ratingsCountTotal + 1;
    setRatingsCountTotal(newTotalCount);
    setAverageRating(parseFloat((totalWeight / newTotalCount).toFixed(2)));
    setRatingSubmittedFeedback(`Cảm ơn bạn đã đánh giá ${stars} sao cho sản phẩm của GENZ TECH AI!`);
    setTimeout(() => setRatingSubmittedFeedback(null), 4000);
  };

  // Custom added user accounts creator state for Admin
  const [newPermissionEmail, setNewPermissionEmail] = useState("");
  const [newPermissionRole, setNewPermissionRole] = useState<"admin" | "engineer" | "client">("client");

  const handleAddPermissionRule = (e: FormEvent) => {
    e.preventDefault();
    if (!newPermissionEmail.trim()) return;
    const emailLower = newPermissionEmail.trim().toLowerCase();
    
    if (userPermissions.some(p => p.email.toLowerCase() === emailLower)) {
      alert("Email này đã được cấu hình từ trước!");
      return;
    }

    const rule = {
      email: emailLower,
      role: newPermissionRole,
      canViewAll: newPermissionRole === "admin" || newPermissionRole === "engineer",
      canViewBlueprint: true
    };

    setUserPermissions(prev => [...prev, rule]);
    setNewPermissionEmail("");
    alert(`Đã gán đặc quyền thành công cho ${emailLower} với chức vụ: ${newPermissionRole === "admin" ? "Quản trị viên" : newPermissionRole === "engineer" ? "Kỹ sư" : "Khách hàng"}`);
  };

  const handleDeletePermissionRule = (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === "anhhao08916@gmail.com") {
      alert("Không thể xóa tài quản trị viên tối cao của anhhao08916@gmail.com!");
      return;
    }
    setUserPermissions(prev => prev.filter(p => p.email.toLowerCase() !== emailToDelete.toLowerCase()));
  };

  // UI Loading & Success States
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);
  
  const [myCreatedIds, setMyCreatedIds] = useState<string[]>([]);

  // If in client view, only show INITIAL_DEMOS (templates) + creations from current session
  const visibleSubmissions = submissions.filter((reg) => {
    // Admin & system accounts with correct privileges can see all submissions
    if (activeUserPermission.canViewAll || isAdmin) return true;
    
    // Normal clients see system patterns + their own registrations in the session
    return reg.id.startsWith("demo-") || myCreatedIds.includes(reg.id) || reg.contactEmail.trim().toLowerCase() === sessionEmail.trim().toLowerCase();
  });

  const filteredSubmissions = filterIndustry 
    ? visibleSubmissions.filter((reg) => reg.industry === filterIndustry)
    : visibleSubmissions;

  // Sync with Firestore on startup
  useEffect(() => {
    async function fetchSubmissions() {
      setDbLoading(true);
      try {
        const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedList: Registration[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as Registration;
          fetchedList.push(data);
        });

        if (fetchedList.length > 0) {
          setSubmissions(prev => {
            const combined = [...fetchedList];
            INITIAL_DEMOS.forEach(demo => {
              if (!combined.some(item => item.id === demo.id)) {
                combined.push(demo);
              }
            });
            return combined;
          });
          setSelectedReg(fetchedList[0]);
        }
      } catch (error) {
        console.warn("Chưa thể kéo danh sách Firestore (Có thể do thiết lập ban đầu):", error);
      } finally {
        setDbLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  // Quick preset price option
  const handleSetPricePreset = (val: number) => {
    setProposedPrice(val.toString());
  };

  // Human-friendly price formatter
  const formatVnd = (priceStr: string) => {
    if (!priceStr) return "0đ";
    const num = parseInt(priceStr.replace(/[^0-9]/g, ""));
    if (isNaN(num)) return "0đ";
    return num.toLocaleString("vi-VN") + " VNĐ";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !contactName.trim() || !contactPhone.trim() || !proposedPrice.trim()) {
      alert("Vui lòng nhập đầy đủ các trường thông tin liên hệ và yêu cầu tính năng!");
      return;
    }

    setIsLoading(true);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/analyze-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          description,
          proposedPrice: parseInt(proposedPrice.replace(/[^0-9]/g, "")) || 5000000,
          contactName,
          contactEmail: contactEmail || "không cung cấp",
          contactPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi máy chủ kết nối.");
      }

      const parsed: AnalysisResult = await response.json();

      const newReg: Registration = {
        id: `reg-${Date.now()}`,
        industry,
        description,
        contactName,
        contactEmail: contactEmail || "trống",
        contactPhone,
        proposedPrice: parseInt(proposedPrice.replace(/[^0-9]/g, "")) || 5000000,
        submittedAt: new Date().toISOString(),
        status: "analyzed",
        analysisResult: parsed,
      };

      // Real-time Persistent writing to user's Firebase Project 'genz-tech-ai'
      const pathForWrite = `submissions/${newReg.id}`;
      try {
        await setDoc(doc(db, "submissions", newReg.id), newReg);
        console.log("Đã lưu yêu cầu của bạn vào hệ thống cơ sở dữ liệu Firebase!");
      } catch (fbErr) {
        // Fallback gracefully but log detailed JSON context to facilitate system observability
        console.warn("Ghi đè lỗi Firebase an toàn:", fbErr);
        try {
          handleFirestoreError(fbErr, OperationType.WRITE, pathForWrite);
        } catch (wrappedErr) {
          // Continue execution so user still sees the AI results dynamically
        }
      }

      setSubmissions(prev => [newReg, ...prev]);
      setMyCreatedIds(prev => [newReg.id, ...prev]);
      setSelectedReg(newReg);
      setSuccessMessage("Khởi tạo phân tích AI chuyên sâu thành công! Bản đồ công nghệ đã được tải phía dưới.");
      
      // Clear form inputs
      setDescription("");
      setProposedPrice("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      
      // Smoothly scroll to diagnostic results
      setTimeout(() => {
        const viewer = document.getElementById("ai-blueprint-viewer");
        if (viewer) {
          viewer.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);

    } catch (err) {
      console.error(err);
      alert("Hệ thống phân tích gặp sự cố nhỏ. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0a0f1d] via-[#141c30] to-[#0d1424] text-slate-100 font-sans relative overflow-x-hidden flex flex-col selection:bg-rose-500/30 selection:text-white">
      
      {/* Decorative High-Tech Dual Grid & Dot Matrix Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-35 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:80px_80px] opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1d]/60 to-transparent pointer-events-none" />

      {/* Futuristic corner crosshairs to emphasize the engineering blueprint theme */}
      <div className="absolute top-24 left-12 text-slate-600/30 font-mono text-[10px] select-none pointer-events-none font-semibold">[ + ] SYS_GRID</div>
      <div className="absolute top-24 right-12 text-slate-600/30 font-mono text-[10px] select-none pointer-events-none font-semibold">LOC_EST_OK [ + ]</div>
      <div className="absolute bottom-24 left-12 text-slate-600/30 font-mono text-[10px] select-none pointer-events-none font-semibold">[ + ] ENG_BOARD</div>
      <div className="absolute bottom-24 right-12 text-slate-600/30 font-mono text-[10px] select-none pointer-events-none font-semibold">GENZ_AI_V4 [ + ]</div>
      
      {/* Heavy radial glow mimicking Vietnam flag spirit */}
      <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-rose-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />

      {/* Floating Sovereignty Banner on top of screen */}
      <div className="bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950 border-b border-rose-950/80 py-1.5 text-center text-[11px] font-mono tracking-wider text-rose-300 font-medium z-40 relative flex items-center justify-center gap-2">
        <span className="inline-flex w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span>CHÀO MỪNG BẠN ĐẾN VỚI KỶ NGUYÊN SỐ HOÁ VIỆT NAM • KHẲNG ĐỊNH CHỦ QUYỀN SỐ HOÀNG SA & TRƯỜNG SA</span>
      </div>

      {/* Header Container */}
      <header className="relative z-30 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-5 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.45)] border border-red-500/30 shrink-0 transition-transform duration-300 transform hover:scale-105">
            <span className="text-yellow-400 font-extrabold text-3xl animate-pulse">★</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-amber-400 to-rose-400">
                GENZ TECH AI
              </h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                KỸ THUẬT SỐ QUỐC GIA
              </span>
            </div>
            <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mt-1">
              Phát Triển Khoa Học Công Nghệ Cao Tự Động Hóa AI
            </p>
          </div>
        </div>

        {/* Dynamic Telemetry Display & Safety Access Segment */}
        <div className="flex flex-col xl:flex-row items-center gap-4">
          
          {/* Active Identity Authentication Gate */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-indigo-500" />
            
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 ${sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com" ? "text-yellow-400 animate-pulse" : "text-slate-500"}`} />
              <div className="text-left">
                <div className="text-[8px] uppercase tracking-widest font-mono text-slate-500">DANH TÍNH TRUY CẬP</div>
                <div className="text-[10px] font-bold font-mono text-slate-300 flex items-center gap-1">
                  {sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com" ? (
                    <span className="text-yellow-400 font-extrabold flex items-center gap-0.5">
                      ⭐ QUẢN TRỊ VIÊN
                    </span>
                  ) : activeUserPermission.role === "engineer" ? (
                    <span className="text-blue-400 font-bold">🛠️ KỸ SƯ HỆ THỐNG</span>
                  ) : (
                    <span className="text-rose-400 font-bold">👤 KHÁCH HÀNG</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Email:</span>
              <input
                type="email"
                value={sessionEmail}
                onChange={(e) => setSessionEmail(e.target.value)}
                placeholder="Nhập email trải nghiệm..."
                className="bg-transparent border-none text-slate-100 font-mono text-xs focus:outline-none w-44 pl-1"
                title="Thay đổi email này để chuyển đổi vai trò người chơi (Dùng anhhao08916@gmail.com để lấy quyền admin)"
              />
            </div>
            
            {/* Quick Demo Helper tooltips to help the user test permissions easily */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSessionEmail("anhhao08916@gmail.com")}
                className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 text-[9px] font-bold px-2 py-1 rounded"
                title="Đăng nhập làm admin chính của anhhao08916@gmail.com"
              >
                Root
              </button>
              <button
                type="button"
                onClick={() => setSessionEmail("giamdoc@genz.vn")}
                className="bg-blue-400/10 hover:bg-blue-400/20 text-blue-400 border border-blue-400/30 text-[9px] font-bold px-2 py-1 rounded"
                title="Vào vai một kỹ sư được cấp quyền từ trước"
              >
                Kỹ Sư
              </button>
              <button
                type="button"
                onClick={() => setSessionEmail("khachhang@genz.vn")}
                className="bg-rose-400/10 hover:bg-rose-400/20 text-rose-400 border border-rose-400/20 text-[9px] font-bold px-2 py-1 rounded"
                title="Trình diễn từ giao diện một khách hàng thông thường"
              >
                Khách
              </button>
            </div>
          </div>

          <div className="hidden xl:flex flex-col text-right font-mono text-[9px] text-slate-400 opacity-80 leading-normal">
            <div>NODE LOCATION: <span className="text-rose-400 font-semibold">+21.0285° N / +105.8542° E</span></div>
            <div>COMPILING STATUS: <span className="text-emerald-400 font-bold">READY</span></div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-md">
            <Server className="w-4 h-4 text-rose-500 animate-pulse" />
            <div className="text-left font-mono text-[10px] leading-tight">
              <div className="text-slate-500">MÁY CHỦ CHỦ QUYỀN AI</div>
              <div className="text-slate-200">22.25.105.* <span className="text-emerald-400">ONLINE</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* Elegant Sticky Anchor Section Menu (Menu cho từng mục tương ứng) */}
      <div className="sticky top-0 z-40 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-rose-500/10 py-3.5 shadow-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
              Hệ Thống Phân Cấp GENZ TECH AI:
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
            {[
              { id: "hero-intro-section", label: "🏠 Trang Chủ" },
              { id: "design-form-section", label: "📝 Đăng Ký Dự Án" },
              { id: "recent-projects-section", label: "📁 Mẫu Dự Án" },
              ...(isAdmin || selectedReg ? [{ id: "ai-blueprint-viewer", label: "💡 Bản Vẽ Chi Tiết AI" }] : []),
              ...(sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com" ? [{ id: "admin-permissions-dashboard", label: "🛡️ Quản Trị Phân Quyền" }] : [])
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  const el = document.getElementById(sec.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-all text-center flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {sec.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Intro section with values */}
      <section id="hero-intro-section" className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-xs font-bold text-rose-400 uppercase tracking-widest">
            <Brain className="w-3.5 h-3.5 animate-spin" /> Trí Tuệ Nhân Tạo Tự Động Hoá Việt Nam
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Tạo App, Website Phục Vụ Kinh Doanh <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-orange-400">
              Chỉ Nhờ Ý Tưởng Bằng Tiếng Việt
            </span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-3xl mx-auto text-center">
            Chào mừng bạn đến với nền tảng thiết kế ứng dụng tự động bằng AI thế hệ mới được tối ưu hóa cho ngôn ngữ, nghiệp vụ và thói quen tiêu dùng của thị trường Việt Nam. Chỉ cần để lại mong muốn, AI sẽ dựng phác thảo cấu trúc, tư vấn công nghệ và tính toán lộ trình ngân sách thông minh tức thì.
          </p>

          {/* Premium bento metrics panel in Frosted Glass style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 w-full max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:border-rose-500/30 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 group-hover:scale-105 transition-transform">500+</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wide mt-1">Dự án Việt khởi lập</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:border-red-500/30 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl font-extrabold text-red-500 group-hover:scale-105 transition-transform">&lt; 3 giây</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wide mt-1">AI phân tích kiến trúc</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:border-yellow-500/30 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400 group-hover:scale-105 transition-transform">100%</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wide mt-1">Tối ưu chi phí thực tế</div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Tech Social Feedback Board */}
      <section className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        
        {/* Follow & Tracking Box (Genz Tech tracking widget) */}
        <div className="md:col-span-5 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                📡 THEO DÕI HẠ TẦNG SỐ
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Live Tracker
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-200 mt-4">
              Đăng Ký Theo Dõi GENZ TECH AI
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Đồng hành cùng hạ tầng phát triển mã ảo tự động Việt Nam, nhận thông báo nâng cấp động cơ tối ưu hóa Gemini chi phí thấp.
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 gap-3 pt-4 border-t border-white/5">
            <div className="font-mono">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">LƯỢT THEO DÕI THỰC TẾ</div>
              <div className="text-xl font-black text-slate-100 flex items-baseline gap-1 mt-0.5">
                {followerBase.toLocaleString("vi-VN")}
                <span className="text-[10px] text-rose-400 font-normal">thành viên</span>
              </div>
            </div>

            <button
              onClick={handleFollowToggle}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isFollowing
                  ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 shadow-inner"
                  : "bg-rose-600 hover:bg-rose-500 border border-rose-500 text-white shadow-lg shadow-rose-600/10"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isFollowing ? "✓ Đã Theo Dõi" : "+ Theo Dõi Web"}</span>
            </button>
          </div>
        </div>

        {/* Like/Dislike/Rating Box */}
        <div className="md:col-span-7 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                ⭐ BAN ĐÁNH GIÁ TRỰC TUYẾN
              </span>
              <h3 className="text-base font-bold text-slate-200 mt-2.5">
                Độ Hài Lòng Về Bản Vẽ & Kiến Trúc AI
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
              <span className="text-yellow-400 text-xs font-black">★ {averageRating}</span>
              <span className="text-[9.5px] text-slate-500 font-mono">({ratingsCountTotal} bình chọn)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Chúng tôi đánh giá cao ý kiến phản hồi từ anh/chị để liên tục hoàn thiện cấu trúc phân tích nghiệp vụ bán hàng Việt Nam kỹ lưỡng hơn.
          </p>

          {/* Star controls & Likes/Dislikes wrapper row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center mt-4 pt-4 border-t border-white/5">
            
            {/* 5 Star Interactive Indicator */}
            <div className="sm:col-span-7">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">NHẤP CHỌN SỐ SAO SỰ KIỆN:</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingSubmit(star)}
                    className="p-1 hover:scale-125 transition-transform duration-200 cursor-pointer"
                    title={`${star} Sao`}
                  >
                    <Star 
                      className={`w-6.5 h-6.5 transition-colors ${
                        star <= ratingValue 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-slate-600 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {ratingSubmittedFeedback && (
                <div className="text-[10px] font-medium text-emerald-400 animate-pulse mt-1.5">
                  {ratingSubmittedFeedback}
                </div>
              )}
            </div>

            {/* Like / Dislike Counter elements */}
            <div className="sm:col-span-5 flex justify-end gap-3">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleLike}
                  className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    userLiked
                      ? "bg-rose-500/10 border-rose-500 text-rose-300 shadow-md"
                      : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                  title="Thích dịch vụ"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">{likesCount}</span>
                </button>
                <span className="text-[9px] text-slate-500 mt-1 uppercase font-mono font-bold">Thích</span>
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={handleDislike}
                  className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    userDisliked
                      ? "bg-blue-500/15 border-blue-500 text-blue-300 shadow-md"
                      : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                  title="Không thích dịch vụ"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold">{dislikesCount}</span>
                </button>
                <span className="text-[9px] text-slate-500 mt-1 uppercase font-mono font-bold">Không thích</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* Main Core Form Section & Analysis Platform */}
      <main className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Dynamic Grid holding Form on Left/Right and Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTAINER: The Requirement Form */}
          <div id="design-form-section" className="lg:col-span-7 scroll-mt-24 bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            
            {/* Glowing flag color decoration */}
            <div className="absolute top-0 right-0 w-40 h-2 bg-gradient-to-l from-yellow-400 via-red-500 to-transparent" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-red-600 rounded-full animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Đăng Ký Tư Vấn & Nhận Bản Phác Thảo AI
                </h3>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 bg-yellow-400/10 rounded-lg text-[10px] font-mono text-yellow-500 font-semibold border border-yellow-400/20">
                MIỄN PHÍ TRẢI NGHIỆM
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-5 -mt-3 leading-relaxed">
              Điền các thông tin của ban dưới đây. Trí tuệ nhân đạo (AI) sẽ tự động sinh mã nguồn ảo, thiết kế chi tiết các bảng cơ sở dữ liệu và khuyến nghị công nghệ đáp ứng ngân sách bạn đang dự định đầu tư.
            </p>

            {/* Quick Domain Presets Interactive Menu */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-2.5">
                ⚡ Chọn nhanh mẫu nghiệp vụ tương thích theo ngành (Có sẵn Prompt):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INDUSTRY_PRESETS.map((preset) => {
                  const isCurrent = industry === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setIndustry(preset.name);
                        setDescription(preset.fullDesc);
                        setProposedPrice(preset.defaultPrice.toString());
                        setFilterIndustry(preset.name); // Filter the projects automatically
                        document.getElementById("design-form-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 text-xs cursor-pointer ${
                        isCurrent
                          ? "bg-rose-500/10 border-rose-500 text-rose-300 shadow-lg"
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-slate-200">
                        <span className={isCurrent ? "text-rose-400" : "text-slate-500"}>
                          {renderPresetIcon(preset.icon, "w-3.5 h-3.5")}
                        </span>
                        <span className="font-bold text-[10.5px] truncate">
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium line-clamp-1 block">
                        {preset.shortDesc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Industry selector input */}
                <div className="space-y-1.5" id="form-industry-container">
                  <label className="text-[11px] font-mono text-slate-300 font-bold ml-1 uppercase tracking-wider block">
                    1. Chọn Lĩnh vực Web / App
                  </label>
                  <div className="relative">
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Thương mại điện tử">Thương mại điện tử / Bán hàng</option>
                      <option value="Giáo dục số / EdTech">Giáo dục trực tuyến / EdTech</option>
                      <option value="Tài chính - Fintech">Tài chính - FinTech</option>
                      <option value="Y tế thông minh / Đặt lịch">Y tế thông minh / Đặt lịch khám</option>
                      <option value="Quản lý F&B / Cafe / Nhà hàng">Quản lý Bán hàng / Cafe / Bia / Nhà hàng</option>
                      <option value="Kết nối Bán hàng / CRM / ERP">Quản lý nội bộ doanh nghiệp / CRM / ERP</option>
                      <option value="Sản xuất thông minh / Logistic">Lĩnh vực sản xuất & Vận tải nông lâm thủy sản</option>
                      <option value="Ý tưởng khởi nghiệp sáng tạo khác">Ý tưởng khởi nghiệp / Startup khác...</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Proposed budget with format info */}
                <div className="space-y-1.5" id="form-budget-container">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-mono text-slate-300 font-bold ml-1 uppercase tracking-wider">
                      2. Sổ Ngân Sách Đề Nghị (VNĐ)
                    </label>
                    <span className="text-[9px] font-semibold text-rose-400 font-mono">
                      {formatVnd(proposedPrice)}
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Ví dụ: 15000000" 
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all font-mono"
                    required
                  />
                  {/* Preset helpers */}
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <button 
                      type="button"
                      onClick={() => handleSetPricePreset(5000000)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-500 text-[10px] font-mono hover:text-white transition-all text-slate-400"
                    >
                      5M (Khởi đầu MVP)
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSetPricePreset(15000000)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-500 text-[10px] font-mono hover:text-white transition-all text-slate-400"
                    >
                      15M (Tiêu Chuẩn)
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSetPricePreset(30000000)}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:border-slate-500 text-[10px] font-mono hover:text-white transition-all text-slate-400"
                    >
                      30M (Thương Mại Lớn)
                    </button>
                  </div>
                </div>
              </div>

              {/* Requirement Memo Area */}
              <div className="space-y-1.5" id="form-description-container">
                <label className="text-[11px] font-mono text-slate-300 font-bold ml-1 uppercase tracking-wider block">
                  3. Ý Tưởng Ứng Dụng & Các Chức Năng Yêu Cầu Củ Thể
                </label>
                <textarea 
                  rows={4} 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn làm một website cho tiệm giặt là tại Quận 10. Có tính năng khách tự chọn cân nặng quần áo, đặt dịch vụ giao nhận tận nơi, chọn khung giờ rảnh và tích lũy điểm khi hoàn thành. Muốn thanh toán quét QR momo..." 
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all resize-none leading-relaxed placeholder:text-slate-600"
                  required
                ></textarea>
              </div>

              {/* Contact Info Multi-Input Grid */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <label className="text-[11px] font-mono text-slate-300 font-bold ml-1 uppercase tracking-wider block">
                  4. Thông Tin Người Kinh Doanh (Để Liên Hệ Cung Cấp Bản Code)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Họ và tên quý khách"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
                      required
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input 
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Số điện thoại di động"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-all font-mono"
                      required
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Địa chỉ Email (Nếu có)"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic submit or loading */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-55"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>MÁY CHỦ SỐ VIỆT ĐANG BIÊN SOẠN BẢN VẼ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-400 group-hover:scale-125 transition-transform" />
                    <span>Gửi Yêu Cầu & Khởi Tạo Phân Tích Kỹ Thuật Bằng AI</span>
                  </>
                )}
              </button>
            </form>

            {successMessage && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <p className="mt-5 text-[10px] text-center text-slate-500 uppercase tracking-tight">
              An toàn bảo mật thông tin • AI Phản hồi tức thì 100% tiếng Việt
            </p>
          </div>

          {/* RIGHT CONTAINER: Demo History & Selection */}
          <div id="recent-projects-section" className="lg:col-span-5 space-y-6 scroll-mt-24">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                KIỂM ĐỊNH NĂNG LỰC SỐ
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1 mb-4">
                <h3 className="text-lg font-bold text-slate-100">
                  {filterIndustry ? `Ngành: ${filterIndustry}` : "Dự Án Đăng Ký"}
                </h3>
                {filterIndustry && (
                  <button 
                    onClick={() => setFilterIndustry(null)}
                    className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono px-2 py-1 rounded-lg border border-rose-500/20 cursor-pointer transition-colors"
                  >
                    Xóa bộ lọc (Xem tất cả)
                  </button>
                )}
              </div>

              {/* Access Role Indicator Badge with clear information */}
              <div className="mb-4 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-[11px] leading-relaxed flex items-start gap-2.5">
                <span className={`inline-flex w-2 h-2 rounded-full shrink-0 mt-1 ${isAdmin ? 'bg-amber-400 animate-ping' : 'bg-rose-400 animate-pulse'}`} />
                <div className="text-slate-300">
                  {isAdmin ? (
                    <p>
                      🛠️ <strong>Chế độ: Kỹ sư trưởng</strong>. Bạn đang xem toàn bộ <span className="text-amber-400 font-bold">{filteredSubmissions.length}</span> dự án/yêu cầu mua hàng lưu tại Firebase.
                    </p>
                  ) : (
                    <p>
                      👤 <strong>Chế độ: Khách hàng</strong>. Bảo mật quyền lợi tối đa — bạn chỉ xem được danh mục dự án mẫu hệ thống & dự án do chính bạn vừa điền ở form bên trái.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                    <p className="text-xs text-slate-500">Chưa có hồ sơ thiết kế nào thuộc nhóm ngành này.</p>
                    <button 
                      onClick={() => setFilterIndustry(null)}
                      className="mt-3 text-[10px] font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Nhấp vào đây để xem toàn bộ danh sách
                    </button>
                  </div>
                ) : (
                  filteredSubmissions.map((reg) => {
                    const isActive = selectedReg?.id === reg.id;
                    return (
                      <div 
                        key={reg.id}
                        onClick={() => setSelectedReg(reg)}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2 text-left relative overflow-hidden group ${
                          isActive 
                            ? "bg-slate-800/80 border-rose-500/40 shadow-inner" 
                            : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/30 hover:border-slate-700"
                        }`}
                      >
                        {/* Active tag ribbon */}
                        {isActive && (
                          <div className="absolute top-0 right-0 w-3 h-full bg-rose-500 shadow-xl" />
                        )}

                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-100 uppercase truncate">
                              {reg.industry}
                            </span>
                            <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded-full shrink-0">
                              {formatVnd(reg.proposedPrice.toString())}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                            {reg.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-1 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {reg.contactName}
                          </span>
                          <span>
                            {new Date(reg.submittedAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})} • 2026
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                Nhấn chọn một dự án để xem ngay bản vẽ kiến trúc phân tích kỹ thuật AI tương ứng.
              </div>
            </div>

            {/* Vietnam Sovereignty affirmation card */}
            <div className="bg-gradient-to-br from-slate-950 via-rose-950/20 to-slate-950 border border-rose-500/10 p-5 rounded-2xl text-center flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute transform rotate-45 -right-6 -bottom-6 w-16 h-16 bg-yellow-400/5 rounded-full blur-xl" />
              <div className="text-3xl font-bold text-yellow-400 animate-pulse">★</div>
              <h4 className="text-xs font-bold font-mono uppercase text-slate-200 mt-2">KHẲNG ĐỊNH CHỦ QUYỀN HOÀNG SA & TRƯỜNG SA</h4>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Toàn bộ dữ liệu của khách hàng Việt Nam được mã hóa bảo vệ chặt chẽ trên máy chủ pháp lý do người Việt làm chủ, đáp ứng chủ trương tự lực tự cường và an ninh quốc gia.
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Interactive AI Blueprint Board Viewer based on selected project */}
        <section className="relative z-20 mt-12 scroll-mt-24" id="ai-blueprint-viewer">
          {selectedReg?.analysisResult ? (
            <div className="backdrop-blur-xl bg-slate-900/40 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
              
              {/* Decorative Header elements */}
              <div className="absolute top-0 left-10 transform -translate-y-1/2 flex gap-4">
                <span className="bg-rose-500/90 text-white font-mono text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-rose-400/20 block uppercase tracking-wider">
                  Bản Vẽ Số Hóa Hoàn Thiện
                </span>
                <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px] px-3 py-1.5 rounded-full shadow-md hidden sm:block">
                  AI ENGINE: GEMINI-3.5-FLASH
                </span>
              </div>

              {/* Title Section */}
              <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-rose-400 font-mono font-bold">
                    [TÊN DỰ ÁN] KHUYẾN NGHỊ BỞI GENZ TECH AI
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2.5 mt-1">
                    <Sparkles className="w-7 h-7 text-yellow-400 animate-spin" />
                    {selectedReg.analysisResult.projectTitle}
                  </h2>
                </div>
                
                <div className="flex gap-2.5 shrink-0">
                  <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800/80 text-left font-mono">
                    <div className="text-[9px] text-slate-500 uppercase">NGÂN SÁCH ĐỀ XUẤT</div>
                    <div className="text-xs font-bold text-amber-400">
                      {formatVnd(selectedReg.proposedPrice.toString())}
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800/80 text-left font-mono">
                    <div className="text-[9px] text-slate-500 uppercase">QUYẾT ĐỊNH</div>
                    <div className="text-xs font-bold text-emerald-400">KHUYẾN NGHỊ CAO</div>
                  </div>
                </div>
              </div>

              {/* Grid content inside blueprint */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                
                {/* Column 1: Executive Summary & Budget Advice Advice (Lg: 7) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Executive Summary */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-blue-400" />
                      Tóm Tắt Giải Pháp Quốc Gia
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selectedReg.analysisResult.executiveSummary}
                    </p>
                  </div>

                  {/* Recommended Architecture Row */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl mt-0.5">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
                        Kiến Trúc Mô Hình Khuyến Nghị
                      </h3>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">
                        {selectedReg.analysisResult.recommendedArchitecture}
                      </h4>
                    </div>
                  </div>

                  {/* Core Features */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Code className="w-4.5 h-4.5 text-rose-500" />
                      3 Tính Năng Cốt Lõi AI Đã Khởi Tạo Thiết Kế
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedReg.analysisResult.keyFeatures?.map((feature, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/50 hover:border-slate-600 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-xs text-slate-100">{feature.name}</h4>
                          <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">
                            {feature.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Budget assessment advisory */}
                  <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500" />
                    <h3 className="text-xs font-mono text-yellow-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Đánh Giá & Lời Khuyên Ngân Sách Đầu Tư
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {selectedReg.analysisResult.budgetAssessment}
                    </p>
                  </div>

                </div>

                {/* Column 2: Tech Stack & Relational DB Schema & Timeline (Lg: 5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Timeline */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <h3 className="text-sm font-bold text-slate-200 mb-3.5 flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-yellow-500" />
                      Lộ Trình Phát Triển Chiến Lược (Ước Tính)
                    </h3>
                    
                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {selectedReg.analysisResult.estimatedTimeline?.map((item, idx) => (
                        <div key={idx} className="relative pl-7 text-left">
                          <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center" />
                          
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-200">{item.phaseName}</h4>
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                              {item.duration}
                            </span>
                          </div>
                          
                          <ul className="mt-1 space-y-0.5">
                            {item.deliverables?.map((del, dIdx) => (
                              <li key={dIdx} className="text-[10.5px] text-slate-400 list-disc list-inside">
                                {del}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refined Database Schema design representation */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Database className="w-4.5 h-4.5 text-emerald-400" />
                      Phác Thảo Lược Đồ Cơ Sở Dữ Liệu
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedReg.analysisResult.databaseSchema?.map((table, idx) => (
                        <div key={idx} className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className="font-mono text-rose-400 font-bold">
                              📄 TABLE: {table.tableName}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {table.description}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {table.columns?.map((col, colIdx) => (
                              <span key={colIdx} className="px-1.5 py-0.5 bg-slate-900 text-slate-300 font-mono text-[9px] rounded border border-slate-800">
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech stack items list */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
                    <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Code className="w-4.5 h-4.5 text-purple-400" />
                      Bộ Sưu Tập Công Nghệ Đơn Cử
                    </h3>
                    <div className="space-y-2.5">
                      {selectedReg.analysisResult.techStack?.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/40 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase block font-mono">
                              {t.category}
                            </span>
                            <span className="font-bold text-slate-200 font-mono mt-0.5 block">
                              {t.tech}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 text-right max-w-[200px]">
                            {t.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Confirm Action Button */}
              <div className="border-t border-white/5 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span>Phác thảo bởi GENZ TECH AI. Đã gửi thông tin đến hệ thống quản trị.</span>
                </div>
                
                <button 
                  onClick={() => alert(`Kính gửi anh/chị ${selectedReg.contactName}, yêu cầu tạo ứng dụng "${selectedReg.analysisResult?.projectTitle}" đã được hệ thống ghi nhận. Kỹ sư trưởng của GENZ TECH AI sẽ trực tiếp liên lạc với anh/chị qua số điện thoại ${selectedReg.contactPhone} hoặc email ${selectedReg.contactEmail} trong vòng tối đa 24 giờ. Trân trọng cảm ơn!`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg text-xs mt-2 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Hợp Tác & Gọi Tư Vấn Chuyên Sâu</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="backdrop-blur-xl bg-slate-900/40 rounded-3xl border border-white/10 p-12 text-center text-slate-400">
              Vui lòng điền thông tin đăng ký để AI khởi tạo bản phác thảo chi tiết.
            </div>
          )}
        </section>

        {/* ADMIN EXCLUSIVE SECTION: Dynamic user permissions dashboard */}
        {sessionEmail.trim().toLowerCase() === "anhhao08916@gmail.com" && (
          <section id="admin-permissions-dashboard" className="relative z-20 mt-12 scroll-mt-24">
            <div className="backdrop-blur-xl bg-slate-950/80 rounded-3xl border border-yellow-500/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-transparent" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center border border-yellow-500/20">
                    <Settings className="w-5.5 h-5.5 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-yellow-400 font-bold uppercase bg-yellow-400/10 px-2 py-0.5 rounded">
                        QUẢN TRỊ TỐI CAO
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
                      Trung Tâm Phân Quyền Vai Trò Người Dùng
                    </h2>
                  </div>
                </div>
                
                <div className="text-left sm:text-right font-mono">
                  <span className="text-xs text-slate-400 block">Đang vận hành dưới danh nghĩa:</span>
                  <span className="text-sm font-bold text-yellow-400">{sessionEmail}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-4xl">
                ⚠️ <strong>Quyền hạn tối thượng</strong>: Là chủ sở hữu tài khoản quản trị viên tối cao, anh/chị có đặc quyền sửa đổi phân loại đặc quyền (Admin, Kỹ sư hệ thống, Khách hàng) cho bất kỳ tài khoản nào. Những cập nhật này sẽ định hình tức thì những gì họ được xem (VD: các hồ sơ mật lưu trữ ở Firebase, mẫu bản vẽ AI...).
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
                
                {/* Add Rule Form */}
                <div className="lg:col-span-5 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                  <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    Cấp đặc quyền tài khoản mới
                  </h3>
                  
                  <form onSubmit={handleAddPermissionRule} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block font-bold">EMAIL THÀNH VIÊN:</label>
                      <input
                        type="email"
                        value={newPermissionEmail}
                        onChange={(e) => setNewPermissionEmail(e.target.value)}
                        placeholder="VD: kisu.tung@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-yellow-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block font-bold">VAI TRÒ / ĐẶC QUYỀN:</label>
                      <select
                        value={newPermissionRole}
                        onChange={(e) => setNewPermissionRole(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-yellow-500 transition-all cursor-pointer"
                      >
                        <option value="client">👤 Khách hàng (Chỉ xem mẫu & dự án của mình làm)</option>
                        <option value="engineer">🛠️ Kỹ sư hệ thống (Xem toàn bộ thiết kế, bản vẽ)</option>
                        <option value="admin">⭐ Quản trị viên (Xem toàn quyền, quản trị tài khoản)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all uppercase tracking-wider shadow-lg shadow-yellow-500/10 cursor-pointer"
                    >
                      Xác Nhận Thiết Lập Đặc Quyền
                    </button>
                  </form>
                </div>

                {/* Configuration List tables */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 mb-2 pl-1 text-slate-400">
                    <Users className="w-4 h-4 text-slate-500" />
                    Danh sách tài khoản được kiểm soát ({userPermissions.length})
                  </h3>

                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {userPermissions.map((rule) => {
                      const isRoot = rule.email.toLowerCase() === "anhhao08916@gmail.com";
                      return (
                        <div 
                          key={rule.email} 
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                            isRoot 
                              ? "bg-yellow-500/5 border-yellow-500/30" 
                              : "bg-slate-900/60 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              rule.role === "admin" 
                                ? "bg-yellow-400 animate-pulse" 
                                : rule.role === "engineer" 
                                  ? "bg-blue-400" 
                                  : "bg-rose-400"
                            }`} />
                            <div className="min-w-0">
                              <span className="font-mono text-xs text-slate-200 block truncate font-bold">
                                {rule.email}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                                  rule.role === "admin" 
                                    ? "bg-yellow-400/10 text-yellow-400" 
                                    : rule.role === "engineer" 
                                      ? "bg-blue-400/10 text-blue-300" 
                                      : "bg-rose-400/10 text-rose-300"
                                }`}>
                                  {rule.role === "admin" ? "Admin" : rule.role === "engineer" ? "Kỹ sư" : "Khách hàng"}
                                </span>
                                {isRoot && (
                                  <span className="text-[9px] font-bold text-yellow-500 uppercase font-mono bg-yellow-400/5 px-1 rounded">
                                    ★ Root Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-flex text-[10px] text-slate-500 font-mono">
                              {rule.canViewAll ? "Quyền xem: Toàn bộ" : "Quyền xem: Riêng tư"}
                            </span>
                            {!isRoot ? (
                              <button
                                onClick={() => handleDeletePermissionRule(rule.email)}
                                className="p-1.5 bg-red-650/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg cursor-pointer transition-colors"
                                title="Xóa phân quyền thành viên"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono italic pr-2">Khóa</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

      </main>

      {/* Aesthetic Footer Area */}
      <footer className="relative z-30 border-t border-slate-900 bg-slate-950/80 py-10 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="font-bold text-slate-200 text-sm tracking-wider font-mono">
                  GENZ TECH AI LAB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 max-w-xs leading-relaxed mx-auto sm:mx-0">
                Lớp hạ tầng phát triển phần mềm tự động hóa hàng đầu khu vực, đem trí lực số phục vụ cộng đồng kinh doanh toàn quốc.
              </p>
            </div>

            <div className="text-center">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest block mb-1">
                KHU VỰC VẬN HÀNH
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hà Nội • Hải Phòng • Đà Nẵng <br />
                Đồng hành cùng chủ quyền số Hoàng Sa & Trường Sa <br />
                TP. Hồ Chí Minh • Cần Thơ • Phú Quốc
              </p>
            </div>

            <div className="text-center sm:text-right font-mono text-[11px] text-slate-500">
              <p>Hệ thống tự động hóa lập trình Việt Nam</p>
              <p className="mt-1">Thời gian hệ thống: 2026-05-27</p>
              <p className="mt-1 text-slate-400">Hotline hỗ trợ: 1900.GENZ.AI01</p>
            </div>
          </div>

          <div className="border-t border-slate-900/80 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-4">
            <p>© 2026 GENZ TECH AI. Tất cả quyền sở hữu an ninh được bảo lưu.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-rose-400 transition-colors">Điều khoản dịch vụ</a>
              <span>•</span>
              <a href="#" className="hover:text-rose-400 transition-colors">Bảo mật thông tin khách hàng</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
