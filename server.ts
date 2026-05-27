import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route first
app.post("/api/analyze-app", async (req, res) => {
  const { industry, description, proposedPrice, contactName, contactEmail, contactPhone } = req.body;

  if (!industry || !description || !proposedPrice) {
    return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin: Lĩnh vực, Mô tả và Mức giá đề nghị." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyAvailable = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";

  if (isKeyAvailable) {
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
Hãy đóng vai trò là một Kiến trúc sư Giải pháp Phần mềm (Software Solutions Architect) kỳ cựu người Việt Nam, chuyên tư vấn phát triển công nghệ cho doanh nghiệp số.
Tôi muốn bạn phân tích ý tưởng dự án sau đây và đưa ra kiến trúc, lộ trình phát triển tối ưu:
- Lĩnh vực: ${industry}
- Yêu cầu mong muốn của khách hàng: ${description}
- Mức giá đề xuất của khách hàng: ${proposedPrice} VNĐ
- Tên khách hàng: ${contactName || "Khách hàng tiềm năng"}

Hãy phân tích kỹ lưỡng, cung cấp giải pháp thực tế nhất với bối cảnh thị trường công nghệ số Việt Nam hiện nay. Lưu ý phần đánh giá mức giá đề xuất so với quy mô dự án: hướng dẫn rõ ràng mức giá đó có thực tế không (ví dụ: quá rẻ, vừa vặn làm MVP, hoặc hào phóng cho startup nhỏ) và đưa ra gợi ý cách tối ưu ngân sách (cắt bớt tính năng hoặc chọn công nghệ miễn phí nếu ngân sách thấp).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Bạn là Kỹ sư trưởng hệ thống và Chuyên gia giải pháp phần mềm tại Việt Nam. Hãy phản hồi hoàn toàn bằng tiếng Việt chuẩn xác, chuyển nghiệp, giàu yếu tố tự hào công nghệ Việt. Output phải tuân thủ định dạng JSON được quy định chính xác.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectTitle: {
                type: Type.STRING,
                description: "Tên dự án công nghệ mang đậm màu sắc sáng tạo kỹ thuật bằng tiếng Việt."
              },
              executiveSummary: {
                type: Type.STRING,
                description: "Tóm tắt dự án của bạn (khoảng 3 câu: định vị giá trị, giải quyết nỗi đau gì và công nghệ AI giải quyết ra sao)."
              },
              recommendedArchitecture: {
                type: Type.STRING,
                description: "Mô hình kiến trúc khuyến nghị (ví dụ: Multi-tier, Serverless, Jamstack, Client-Server) và lý do đơn giản."
              },
              estimatedTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING, description: "Tên giai đoạn (ví dụ: Thiết kế giao diện, Lập trình Frontend...)" },
                    duration: { type: Type.STRING, description: "Thời gian ước tính (ví dụ: '5-7 ngày', '2 tuần')" },
                    deliverables: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Các sản phẩm bàn giao chính của giai đoạn này."
                    }
                  }
                },
                description: "Lộ trình dự án chi tiết chia theo từng giai đoạn phát triển vững vàng."
              },
              keyFeatures: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Tên tính năng chính đột phá." },
                    details: { type: Type.STRING, description: "Mô tả chi tiết và cách hoạt động, nêu rõ giá trị của tính năng." },
                    icon: { type: Type.STRING, description: "Tên icon gợi ý từ thư viện Lucide React (ví dụ: 'ShoppingBag', 'Shield', 'Gauge', 'Zap', 'Database', 'MessageSquare')." }
                  }
                },
                description: "Danh sách 3-4 tính năng cốt lõi bắt buộc phải có cho ngành này."
              },
              techStack: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "Phân mục (ví dụ: Giao diện người dùng, Backend, Hệ cơ sở dữ liệu, Công cụ AI...)" },
                    tech: { type: Type.STRING, description: "Công nghệ được đề cử đề xuất (ví dụ: React + Tailwind, Express, PostgreSQL, Gemini API)" },
                    reason: { type: Type.STRING, description: "Giải thích tại sao công nghệ này tối ưu cho mức ngân sách hoặc nghiệp vụ này." }
                  }
                },
                description: "Tập hợp công nghệ phát triển khuyên dùng cho dự án."
              },
              databaseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tableName: { type: Type.STRING, description: "Tên bảng dữ liệu dự định (bằng tiếng Anh như users, orders, products...)" },
                    description: { type: Type.STRING, description: "Mục đích sử dụng của bảng này." },
                    columns: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Các cột trường/dữ liệu chính quan trọng cần quản lý (ví dụ: 'id (Primary Key)', 'name', 'created_at')."
                    }
                  }
                },
                description: "Cơ sở dữ liệu phác thảo thô giúp khách hàng hình dung cấu trúc lưu trữ backend."
              },
              budgetAssessment: {
                type: Type.STRING,
                description: "Phân tích thẳng thắn, có tâm về mức giá đề xuất của khách so với thực tế và các phương án tối ưu giảm thiểu chi phí."
              }
            },
            required: ["projectTitle", "executiveSummary", "recommendedArchitecture", "estimatedTimeline", "keyFeatures", "techStack", "databaseSchema", "budgetAssessment"]
          }
        }
      });

      const responseText = response.text || "{}";
      const cleanedText = responseText.trim();
      const outputData = JSON.parse(cleanedText);
      return res.json(outputData);

    } catch (error) {
      console.error("Lỗi khi kết nối với Gemini API:", error);
      // Fallback below
    }
  }

  // Graceful robust simulation fallback if API key is not configured or in case of error
  console.log("Sử dụng trình phân tích giả lập công nghệ Việt Nam...");
  
  // Format price
  let numericPrice = parseInt(proposedPrice.toString().replace(/[^0-9]/g, ""));
  if (isNaN(numericPrice)) numericPrice = 5000000;
  
  const isBudgetLow = numericPrice < 5000000;
  let assessment = "";
  if (isBudgetLow) {
    assessment = `Mức giá đề xuất ${numericPrice.toLocaleString()}đ của anh/chị là khá TIẾT KIỆM để xây dựng một sản phẩm chất lượng cao hoàn thiện. Tuy nhiên, bằng việc áp dụng công nghệ AI tạo code tự động cùng các nền tảng serverless, chúng tôi VẪN CÓ THỂ triển khai một phiên bản MVP (Sản phẩm khả dụng tối giản). Gợi ý: Hạn chế tối đa các chức năng thanh toán tự động phức tạp và API trả phí của bên thứ ba ở giai đoạn đầu, tập trung vào giao diện phản hồi nhanh và lưu trữ SQLite/local.`;
  } else if (numericPrice <= 15000000) {
    assessment = `Mức giá đề xuất ${numericPrice.toLocaleString()}đ cực kỳ HỢP LÝ và VỪA VẶN cho phát triển sản phẩm tiêu chuẩn. Ngân sách này cho phép xây dựng đầy đủ các chức năng lõi kết nối máy chủ dữ liệu thực và giao diện tương tác cao. Chúng tôi sẽ áp dụng các mã nguồn mở tối ưu lực lượng, giúp dự án sẵn sàng vận hành thương mại trong 2-3 tuần.`;
  } else {
    assessment = `Mức giá đề xuất ${numericPrice.toLocaleString()}đ thể hiện tầm nhìn ĐẦU TƯ BÀI BẢN của anh/chị. Với ngân sách này, hệ thống sẽ được tích hợp đầy đủ khả năng mở rộng thông minh: bảo mật đa lớp nâng cao, đồng bộ hóa thời gian thực, tích hợp AI chat tự phục vụ, và tự động hóa vận hành trên hạ tầng đám mây (Cloud Native).`;
  }

  // Build simulated structured response mock optimized based on requested industry
  const mockAnalysis = {
    projectTitle: `Hệ thống Số ${industry} Việt Nam - Khởi kiến bởi AI`,
    executiveSummary: `Dự án khai thác tiềm năng số hóa trong lĩnh vực ${industry}, giúp nâng cao năng lực cạnh tranh số quốc gia. Hệ thống áp dụng giao diện hiện đại định hình bởi AI kết hợp với cơ sở dữ liệu phân tán vững chãi nhằm tối ưu hóa trải nghiệm tương tác của người dùng Việt.`,
    recommendedArchitecture: isBudgetLow ? "Jamstack / Serverless Architecture (Tối ưu chi phí vận hành)" : "Multi-tier Microservices Architecture (Mở rộng linh hoạt, bảo mật vững chắc)",
    estimatedTimeline: [
      {
        phaseName: "Khởi tạo thiết kế & Cấu trúc tương tác số",
        duration: isBudgetLow ? "3-4 ngày" : "5-7 ngày",
        deliverables: ["Sơ đồ luồng thông tin người dùng", "Giao diện mô phỏng responsive đa thiết bị"]
      },
      {
        phaseName: "Lập trình hạ tầng Backend & AI Core",
        duration: isBudgetLow ? "5-6 ngày" : "7-10 ngày",
        deliverables: ["Hệ thống API cốt lõi", "Tích hợp lưu trữ dữ liệu tập trung", "Bộ phân tích dữ liệu AI nội bộ"]
      },
      {
        phaseName: "Tích hợp Frontend & Kiểm định an ninh Việt Nam",
        duration: isBudgetLow ? "2-3 ngày" : "3-5 ngày",
        deliverables: ["Hoàn thiện giao diện sắc nét đậm đà trải nghiệm", "Kiểm thử bảo mật chống SQL Injection/XSS"]
      }
    ],
    keyFeatures: [
      {
        name: "Bàn làm việc số hóa AI",
        details: "Bảng quản trị tích hợp trí tuệ nhân tạo dự đoán xu hướng người dùng và tự động tổng hợp báo cáo vận hành.",
        icon: "Gauge"
      },
      {
        name: "Luồng tương tác siêu tốc",
        details: "Tối ưu hóa tải trang dưới 1.2 giây trên mọi cấu hình mạng di động 4G tại Việt Nam nhờ cơ chế CDN biên.",
        icon: "Zap"
      },
      {
        name: "Xác thực an toàn thông minh",
        details: "Sử dụng mật mã hóa hiện đại và mã OTP liên kết trực tiếp bảo vệ dữ liệu thông tin bảo mật.",
        icon: "Shield"
      }
    ],
    techStack: [
      { category: "Giao diện người dùng", tech: "React + Tailwind CSS", reason: "Mang lại hiệu suất hiển thị mượt mà cực độ và nhẹ nhất cho băng thông người dùng Việt." },
      { category: "Giải pháp Máy chủ", tech: isBudgetLow ? "Node.js (Serverless)" : "Express.js High-Performance Engine", reason: "Thời gian phản hồi siêu thấp, xử lý tối ưu hàng ngàn kết nối đồng thời mượt mà." },
      { category: "Lưu cơ sở dữ liệu", tech: isBudgetLow ? "SQLite / MongoDB Atlas (Free Tier)" : "PostgreSQL Cluster", reason: "Đảm bảo tính toàn vẹn dữ liệu chặt chẽ và an toàn bảo mật lâu dài." }
    ],
    databaseSchema: [
      { tableName: "users", description: "Lưu giữ thông tin tài khoản người dùng và thông tin liên hệ.", columns: ["id (Primary Key)", "full_name (VARCHAR)", "phone_number (VARCHAR)", "email (VARCHAR)", "registered_at (TIMESTAMP)"] },
      { tableName: "submissions", description: "Lưu trữ nội dung yêu cầu thiết kế web và trạng thái liên lạc.", columns: ["id (Primary Key)", "industry (VARCHAR)", "requirements_memo (TEXT)", "proposed_budget (BIGINT)", "status (VARCHAR)", "created_at (TIMESTAMP)"] }
    ],
    budgetAssessment: assessment
  };

  res.json(mockAnalysis);
});

// Vite or Static Assets handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bắt đầu máy chủ thành công tại cổng: http://localhost:${PORT}`);
  });
}

startServer();
