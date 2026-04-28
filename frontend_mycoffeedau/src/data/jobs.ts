import type { Job } from "../models/job";

export const jobs: Job[] = [
  {
    id: "JOB-01",
    position: "NHÂN VIÊN PHA CHẾ (BARISTA)",
    location: "Chi nhánh Quận 1, TP.HCM",
    salary: "7.000.000 - 9.000.000 VNĐ",
    type: "Full-time",
    deadline: "30/05/2026",
    description: "Chịu trách nhiệm pha chế các dòng cà phê máy, cà phê truyền thống và các loại trà theo đúng công thức.",
    requirements: [
      "Có ít nhất 6 tháng kinh nghiệm Barista.",
      "Trung thực, trách nhiệm.",
      "Sẵn sàng làm việc theo ca."
    ]
  },
  {
    id: "JOB-02",
    position: "NHÂN VIÊN PHỤC VỤ (WAITER/WAITRESS)",
    location: "Chi nhánh Quận 3, TP.HCM",
    salary: "22.000 - 25.000 VNĐ/Giờ",
    type: "Part-time",
    deadline: "15/05/2026",
    description: "Chào đón khách, giới thiệu menu và phục vụ đồ uống. Đảm bảo vệ sinh khu vực khách ngồi.",
    requirements: [
      "Nhanh nhẹn, niềm nở.",
      "Ưu tiên sinh viên làm thêm.",
      "Giao tiếp tiếng Anh cơ bản."
    ]
  },
  {
    id: "JOB-03",
    position: "QUẢN LÝ CỬA HÀNG (STORE MANAGER)",
    location: "Khu vực Thủ Đức, TP.HCM",
    salary: "15.000.000 - 20.000.000 VNĐ",
    type: "Full-time",
    deadline: "20/05/2026",
    description: "Quản lý nhân sự, kiểm soát kho vận và đảm bảo doanh số tại cửa hàng.",
    requirements: [
      "2 năm kinh nghiệm quản lý F&B.",
      "Kỹ năng lãnh đạo tốt.",
      "Sử dụng thành thạo phần mềm POS."
    ]
  },
  {
    id: "JOB-04",
    position: "NHÂN VIÊN BẢO VỆ",
    location: "Chi nhánh Quận 1, TP.HCM",
    salary: "6.000.000 - 7.000.000 VNĐ",
    type: "Full-time",
    deadline: "10/06/2026",
    description: "Sắp xếp xe cho khách, đảm bảo an ninh trật tự khu vực phía trước cửa hàng.",
    requirements: [
      "Sức khỏe tốt, nhiệt tình.",
      "Ưu tiên người có kinh nghiệm bảo vệ.",
      "Thái độ lịch sự với khách hàng."
    ]
  },
  {
    id: "JOB-05",
    position: "NHÂN VIÊN KẾ TOÁN NỘI BỘ",
    location: "Văn phòng Tổng, TP.HCM",
    salary: "9.000.000 - 12.000.000 VNĐ",
    type: "Full-time",
    deadline: "25/05/2026",
    description: "Kiểm soát hóa đơn, chứng từ và theo dõi công nợ nhà cung cấp nguyên liệu.",
    requirements: [
      "Tốt nghiệp chuyên ngành Kế toán.",
      "Cẩn thận, tỉ mỉ với con số.",
      "Thành thạo Excel."
    ]
  },
  {
    id: "JOB-06",
    position: "THỰC TẬP SINH MARKETING",
    location: "Làm việc từ xa / Quận 1",
    salary: "3.000.000 - 4.000.000 VNĐ",
    type: "Part-time",
    deadline: "05/06/2026",
    description: "Hỗ trợ quản lý Fanpage, sáng tạo nội dung hình ảnh/video cho các chiến dịch mới.",
    requirements: [
      "Yêu thích ngành cà phê và sáng tạo nội dung.",
      "Biết sử dụng cơ bản Canva/Capcut.",
      "Có laptop cá nhân."
    ]
  },
  {
    id: "JOB-07",
    position: "THỢ LÀM BÁNH (PASTRY CHEF)",
    location: "Xưởng bánh Trung tâm",
    salary: "10.000.000 - 14.000.000 VNĐ",
    type: "Full-time",
    deadline: "12/06/2026",
    description: "Sản xuất các loại bánh ngọt, bánh lạnh dùng kèm cà phê hàng ngày.",
    requirements: [
      "Am hiểu về các loại bột và kỹ thuật nướng bánh.",
      "Có chứng chỉ nghề bếp/bánh.",
      "Đảm bảo vệ sinh an toàn thực phẩm."
    ]
  },
  {
    id: "JOB-08",
    position: "NHÂN VIÊN GIAO HÀNG (SHIPPER NỘI BỘ)",
    location: "Chi nhánh Quận Bình Thạnh",
    salary: "7.000.000 VNĐ + Thưởng đơn",
    type: "Full-time",
    deadline: "18/05/2026",
    description: "Giao đồ uống đến tận tay khách hàng trong khu vực lân cận.",
    requirements: [
      "Có xe máy riêng và bằng lái A1.",
      "Thông thạo đường phố khu vực.",
      "Sử dụng smartphone tốt."
    ]
  },
  {
    id: "JOB-09",
    position: "NHÂN VIÊN TẠP VỤ",
    location: "Chi nhánh Quận 1, TP.HCM",
    salary: "5.000.000 - 6.000.000 VNĐ",
    type: "Full-time",
    deadline: "20/06/2026",
    description: "Giữ gìn vệ sinh chung, rửa ly tách và hỗ trợ dọn dẹp khu vực quầy bar.",
    requirements: [
      "Chăm chỉ, thật thà.",
      "Sức khỏe tốt.",
      "Có thể làm ca sáng hoặc ca tối."
    ]
  },
  {
    id: "JOB-10",
    position: "NHÂN VIÊN CSKH (TELESALE)",
    location: "Văn phòng Quận 1",
    salary: "20.000 VNĐ/Giờ + Hoa hồng",
    type: "Part-time",
    deadline: "30/06/2026",
    description: "Gọi điện khảo sát sự hài lòng của khách hàng sau khi sử dụng dịch vụ.",
    requirements: [
      "Giọng nói truyền cảm, không ngọng.",
      "Kỹ năng xử lý tình huống qua điện thoại.",
      "Kiên nhẫn và chịu khó."
    ]
  }
];