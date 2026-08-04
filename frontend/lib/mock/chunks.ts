import type { Chunk } from "@/lib/types";

/**
 * Mock chunk store — kết quả giả lập của Task 4 (chunk_size=800, overlap=100).
 * Mọi bước trong pipeline đều tham chiếu tới chunk bằng `id`.
 */
export const CHUNKS: Chunk[] = [
  // ------------------------------------------------------------------ trả hàng / hoàn tiền
  {
    id: "chunk_0042",
    docId: "legal_return_refund",
    index: 6,
    section: "Mục 2 — Thời hạn yêu cầu",
    tokens: 214,
    excerpt:
      "Người mua có thể gửi yêu cầu Trả hàng/Hoàn tiền trong vòng 15 ngày kể từ ngày đơn hàng được cập nhật trạng thái Giao hàng thành công.",
    content:
      "2.1. Thời hạn gửi yêu cầu\n\nNgười mua có thể gửi yêu cầu Trả hàng/Hoàn tiền trong vòng 15 ngày kể từ ngày đơn hàng được cập nhật trạng thái \"Giao hàng thành công\" trên hệ thống Shopee. Sau thời hạn này, nút \"Trả hàng/Hoàn tiền\" sẽ không còn khả dụng và đơn hàng được xem là đã hoàn tất.\n\n2.2. Trường hợp rút ngắn thời hạn\n\nĐối với các sản phẩm là thực phẩm tươi sống, thực phẩm đông lạnh hoặc hàng hoá có hạn sử dụng ngắn, thời hạn gửi yêu cầu được rút xuống còn 24 giờ kể từ thời điểm giao hàng thành công, do đặc thù bảo quản của nhóm hàng này.\n\n2.3. Trường hợp kéo dài thời hạn\n\nVới sản phẩm thuộc chương trình bảo hành chính hãng, người mua vẫn có thể liên hệ Bộ phận Chăm sóc Khách hàng sau 15 ngày, tuy nhiên yêu cầu sẽ được xử lý theo điều khoản bảo hành của nhà sản xuất thay vì quy trình Trả hàng/Hoàn tiền tiêu chuẩn.",
  },
  {
    id: "chunk_0043",
    docId: "legal_return_refund",
    index: 7,
    section: "Mục 3 — Điều kiện được chấp nhận",
    tokens: 231,
    excerpt:
      "Yêu cầu được chấp nhận khi sản phẩm không đúng mô tả, bị hư hỏng, thiếu phụ kiện, giao sai hàng hoặc không nhận được hàng.",
    content:
      "3.1. Các lý do hợp lệ\n\nYêu cầu Trả hàng/Hoàn tiền được chấp nhận khi thuộc một trong các trường hợp: (a) người mua không nhận được hàng; (b) sản phẩm bị hư hỏng, vỡ, móp trong quá trình vận chuyển; (c) sản phẩm giao sai mẫu mã, sai kích cỡ, sai màu so với đơn đặt; (d) sản phẩm không đúng mô tả của Người bán; (e) thiếu phụ kiện hoặc thiếu số lượng; (f) sản phẩm giả, nhái, vi phạm quyền sở hữu trí tuệ.\n\n3.2. Sản phẩm phải giữ nguyên trạng\n\nTrừ trường hợp hàng lỗi do Người bán, sản phẩm hoàn trả phải còn nguyên tem, nhãn, hộp và phụ kiện đi kèm. Sản phẩm đã qua sử dụng, đã kích hoạt bảo hành điện tử hoặc bị hư hỏng do lỗi của người mua sẽ không đủ điều kiện hoàn tiền.",
  },
  {
    id: "chunk_0051",
    docId: "legal_return_refund",
    index: 12,
    section: "Mục 5 — Thời gian xử lý và hoàn tiền",
    tokens: 198,
    excerpt:
      "Shopee xử lý yêu cầu trong 2–3 ngày làm việc; tiền hoàn về Ví ShopeePay trong 24 giờ, về thẻ ngân hàng mất 7–14 ngày làm việc.",
    content:
      "5.1. Thời gian xét duyệt\n\nSau khi người mua gửi đầy đủ bằng chứng, Shopee sẽ xem xét yêu cầu trong vòng 2–3 ngày làm việc. Nếu Người bán không phản hồi trong 2 ngày, yêu cầu được tự động xử lý theo hướng có lợi cho người mua.\n\n5.2. Thời gian hoàn tiền\n\nKhoản hoàn được chuyển về phương thức thanh toán ban đầu: Ví ShopeePay nhận tiền trong vòng 24 giờ; thẻ tín dụng/ghi nợ và tài khoản ngân hàng mất từ 7 đến 14 ngày làm việc tuỳ ngân hàng phát hành. Với đơn COD, tiền được hoàn về Ví ShopeePay hoặc tài khoản ngân hàng người mua đăng ký.",
  },
  {
    id: "chunk_0118",
    docId: "news_refund_request",
    index: 2,
    section: "Bước 1–3: Tạo yêu cầu",
    tokens: 176,
    excerpt:
      "Vào Đơn Mua → chọn đơn hàng → nhấn Trả hàng/Hoàn tiền → chọn lý do → tải lên hình ảnh và video minh chứng.",
    content:
      "Để gửi yêu cầu, người mua thực hiện: (1) mở ứng dụng Shopee, vào mục \"Tôi\" → \"Đơn Mua\"; (2) chọn đơn hàng cần xử lý và nhấn nút \"Trả hàng/Hoàn tiền\"; (3) chọn lý do phù hợp trong danh sách gợi ý, tải lên hình ảnh và video minh chứng, mô tả ngắn gọn tình trạng sản phẩm; (4) chọn phương án mong muốn: chỉ hoàn tiền hoặc trả hàng và hoàn tiền; (5) nhấn \"Hoàn tất\". Yêu cầu sẽ chuyển sang trạng thái \"Đang chờ Người bán phản hồi\".",
  },
  {
    id: "chunk_0126",
    docId: "news_refund_restrictions",
    index: 1,
    section: "Nhóm sản phẩm hạn chế",
    tokens: 164,
    excerpt:
      "Voucher, thẻ nạp, vé sự kiện, dịch vụ số và hàng đặt riêng theo yêu cầu thuộc nhóm không áp dụng trả hàng thông thường.",
    content:
      "Một số nhóm sản phẩm không áp dụng quy trình Trả hàng/Hoàn tiền tiêu chuẩn, bao gồm: voucher điện tử, thẻ cào và thẻ nạp game, vé sự kiện và vé dịch vụ đã kích hoạt, các dịch vụ số đã sử dụng, sản phẩm đặt riêng theo yêu cầu (in tên, khắc chữ), đồ lót và mỹ phẩm đã bóc niêm phong. Với các sản phẩm này, người mua cần liên hệ Bộ phận Chăm sóc Khách hàng trong vòng 24 giờ nếu mã không sử dụng được hoặc dịch vụ không được cung cấp đúng cam kết.",
  },

  // ------------------------------------------------------------------ bằng chứng hoàn tiền
  {
    id: "chunk_0131",
    docId: "news_refund_evidence",
    index: 1,
    section: "Bằng chứng bắt buộc",
    tokens: 208,
    excerpt:
      "Cần ảnh chụp sản phẩm, ảnh kiện hàng còn nguyên tem và video mở hộp liền mạch, quay từ lúc kiện hàng chưa bóc.",
    content:
      "Bằng chứng bắt buộc gồm ba nhóm: (1) hình ảnh sản phẩm thực nhận, chụp rõ phần lỗi hoặc phần không đúng mô tả, tối thiểu 1 ảnh và tối đa 5 ảnh; (2) hình ảnh kiện hàng bên ngoài còn nguyên tem niêm phong và nhãn vận chuyển để đối chiếu mã đơn; (3) video mở hộp (unboxing) quay liền mạch, không cắt ghép, bắt đầu từ khi kiện hàng còn nguyên vẹn cho đến khi lấy sản phẩm ra. Video là bắt buộc với các trường hợp thiếu hàng, vỡ hỏng hoặc giao sai sản phẩm.",
  },
  {
    id: "chunk_0132",
    docId: "news_refund_evidence",
    index: 2,
    section: "Định dạng và giới hạn",
    tokens: 158,
    excerpt:
      "Ảnh tối đa 5 tệp (JPG/PNG, mỗi tệp ≤ 5MB); video tối đa 1 tệp, dài không quá 30 giây và dung lượng dưới 30MB.",
    content:
      "Về định dạng: hình ảnh chấp nhận JPG hoặc PNG, tối đa 5 tệp, mỗi tệp không quá 5MB. Video chấp nhận MP4, tối đa 1 tệp, độ dài không quá 30 giây và dung lượng dưới 30MB. Nếu video mở hộp dài hơn, người mua nên cắt lấy đoạn thể hiện rõ tình trạng kiện hàng và sản phẩm. Bằng chứng mờ, thiếu sáng hoặc không thấy được mã vận đơn có thể khiến yêu cầu bị từ chối và người mua phải gửi bổ sung trong vòng 3 ngày.",
  },

  // ------------------------------------------------------------------ thanh toán
  {
    id: "chunk_0087",
    docId: "news_payment_methods",
    index: 0,
    section: "Danh sách phương thức",
    tokens: 226,
    excerpt:
      "Shopee hỗ trợ Ví ShopeePay, thẻ tín dụng/ghi nợ, trả góp qua thẻ, thanh toán QR, chuyển khoản qua app ngân hàng, thẻ NAPAS, Apple Pay, Google Pay và COD.",
    content:
      "Shopee Việt Nam hiện hỗ trợ các phương thức thanh toán sau:\n\n• Ví ShopeePay — thanh toán trực tiếp bằng số dư ví, hỗ trợ hoàn tiền nhanh nhất.\n• Thẻ tín dụng / thẻ ghi nợ (Visa, Mastercard, JCB, American Express).\n• Trả góp qua thẻ tín dụng — kỳ hạn 3, 6, 9 hoặc 12 tháng, áp dụng cho đơn từ mức tối thiểu do ngân hàng quy định.\n• Thanh toán bằng mã QR.\n• Chuyển khoản qua ứng dụng ngân hàng (liên kết trực tiếp trong luồng thanh toán).\n• Thẻ nội địa NAPAS (thẻ ATM có đăng ký Internet Banking).\n• Apple Pay và Google Pay.\n• Thanh toán khi nhận hàng (COD).",
  },
  {
    id: "chunk_0088",
    docId: "news_payment_methods",
    index: 1,
    section: "Điều kiện áp dụng",
    tokens: 192,
    excerpt:
      "COD không áp dụng cho một số đơn hàng giá trị cao hoặc đơn quốc tế; trả góp yêu cầu giá trị đơn tối thiểu theo quy định ngân hàng.",
    content:
      "Không phải phương thức nào cũng khả dụng cho mọi đơn hàng. Thanh toán khi nhận hàng (COD) có thể không được hỗ trợ với đơn hàng giá trị cao, đơn từ Shop nước ngoài hoặc khu vực giao hàng ngoài vùng phục vụ của đơn vị vận chuyển. Trả góp qua thẻ tín dụng yêu cầu giá trị đơn hàng đạt mức tối thiểu do ngân hàng phát hành quy định và chỉ áp dụng với danh sách ngân hàng liên kết. Danh sách phương thức khả dụng luôn được hiển thị tại bước \"Phương thức thanh toán\" trước khi người mua đặt hàng.",
  },
  {
    id: "chunk_0094",
    docId: "news_qr_payment",
    index: 0,
    section: "Các bước thanh toán QR",
    tokens: 149,
    excerpt:
      "Chọn Thanh toán QR ở bước đặt hàng, mở app ngân hàng quét mã và xác nhận trong thời hạn hiệu lực của mã.",
    content:
      "Khi chọn \"Thanh toán QR\" tại bước đặt hàng, Shopee sinh ra một mã QR có thời hạn hiệu lực nhất định. Người mua mở ứng dụng ngân hàng hoặc ví điện tử có hỗ trợ VietQR, quét mã và xác nhận giao dịch. Sau khi ngân hàng báo thành công, trạng thái đơn hàng tự động chuyển sang \"Đã thanh toán\". Nếu mã hết hạn trước khi thanh toán, người mua quay lại đơn hàng trong mục \"Đơn Mua\" và tạo lại mã mới.",
  },

  // ------------------------------------------------------------------ quy định người bán
  {
    id: "chunk_0203",
    docId: "legal_prohibited",
    index: 3,
    section: "Mục 1 — Hàng hoá bị cấm",
    tokens: 244,
    excerpt:
      "Cấm đăng bán vũ khí, chất ma tuý, động vật hoang dã, hàng giả, tiền tệ, thuốc kê đơn, chất nổ và nội dung khiêu dâm.",
    content:
      "1. Danh mục hàng hoá bị cấm tuyệt đối trên Shopee\n\nNgười bán không được đăng bán các nhóm sau: vũ khí, đạn dược, vật liệu nổ và công cụ hỗ trợ; chất ma tuý và tiền chất; động vật hoang dã, sản phẩm từ động vật thuộc danh mục nguy cấp (ngà voi, sừng tê giác, vảy tê tê); hàng giả, hàng nhái, hàng vi phạm quyền sở hữu trí tuệ; tiền tệ (kể cả tiền lưu niệm chưa được phép), tem phiếu và giấy tờ tuỳ thân; thuốc kê đơn, thuốc gây nghiện và thiết bị y tế chưa được cấp phép; hoá chất độc hại; sản phẩm khiêu dâm, đồi truỵ; thiết bị nghe lén, phá sóng, thiết bị định vị bí mật; nội tạng và mô người; hàng hoá thuộc diện cấm nhập khẩu theo pháp luật Việt Nam.",
  },
  {
    id: "chunk_0207",
    docId: "legal_prohibited",
    index: 7,
    section: "Mục 2 — Hàng hoá hạn chế",
    tokens: 213,
    excerpt:
      "Nhóm hạn chế gồm thực phẩm chức năng, mỹ phẩm, rượu, thiết bị y tế… — chỉ được bán khi cung cấp đủ giấy phép hợp lệ.",
    content:
      "2. Danh mục hàng hoá hạn chế\n\nMột số nhóm hàng chỉ được đăng bán khi Người bán cung cấp đầy đủ giấy phép và chứng nhận hợp lệ, gồm: thực phẩm chức năng và thực phẩm bảo vệ sức khoẻ (giấy công bố sản phẩm); mỹ phẩm (số tiếp nhận phiếu công bố); rượu và đồ uống có cồn (giấy phép kinh doanh rượu); thiết bị y tế loại A, B; sản phẩm dành cho trẻ sơ sinh; hoá chất gia dụng; sim số và thẻ viễn thông. Shopee có quyền yêu cầu bổ sung hồ sơ bất kỳ lúc nào và gỡ sản phẩm nếu Người bán không cung cấp trong thời hạn thông báo.",
  },
  {
    id: "chunk_0181",
    docId: "legal_listing_rules",
    index: 4,
    section: "Mục 4 — Hành vi vi phạm khi đăng bán",
    tokens: 205,
    excerpt:
      "Cấm đặt tên sản phẩm gây hiểu nhầm, spam từ khoá, dùng ảnh của shop khác, đăng trùng lặp và niêm yết giá ảo.",
    content:
      "4. Các hành vi bị xử phạt\n\nNgoài danh mục hàng cấm, Người bán còn bị xử lý khi: đặt tên sản phẩm gây hiểu nhầm hoặc nhồi từ khoá không liên quan; sử dụng hình ảnh có gắn logo, watermark của shop khác hoặc ảnh không phải sản phẩm thật; đăng trùng lặp cùng một sản phẩm ở nhiều listing để chiếm kết quả tìm kiếm; niêm yết giá ảo rồi yêu cầu người mua thanh toán ngoài sàn; chèn thông tin liên hệ (số điện thoại, mạng xã hội) vào tên hoặc mô tả sản phẩm. Mỗi vi phạm bị tính điểm phạt; tích luỹ đủ điểm sẽ dẫn tới hạn chế tính năng hoặc khoá shop.",
  },

  // ------------------------------------------------------------------ vận chuyển / đơn quốc tế
  {
    id: "chunk_0152",
    docId: "news_cross_border",
    index: 1,
    section: "Tra cứu đơn quốc tế",
    tokens: 187,
    excerpt:
      "Vào Đơn Mua → chọn đơn có nhãn Hàng quốc tế → Xem chi tiết vận chuyển để thấy toàn bộ mốc từ kho nước ngoài về Việt Nam.",
    content:
      "Đơn hàng từ Shop nước ngoài được gắn nhãn \"Hàng quốc tế\" hoặc \"Shopee International\". Để theo dõi, người mua vào \"Tôi\" → \"Đơn Mua\", chọn đơn hàng và nhấn \"Xem chi tiết vận chuyển\". Màn hình này hiển thị đầy đủ mốc hành trình: rời kho người bán → tới trung tâm phân loại nước xuất → xuất cảnh → nhập cảnh Việt Nam → thông quan → giao cho đơn vị vận chuyển nội địa → đang giao. Mã vận đơn quốc tế cũng có thể được tra trên website của đơn vị vận chuyển tương ứng.",
  },
  {
    id: "chunk_0153",
    docId: "news_cross_border",
    index: 2,
    section: "Thời gian giao dự kiến",
    tokens: 171,
    excerpt:
      "Đơn quốc tế thường mất 7–20 ngày; thời gian thông quan không tính vào cam kết giao hàng của Shopee.",
    content:
      "Thời gian giao đơn quốc tế thường dao động từ 7 đến 20 ngày làm việc tuỳ quốc gia xuất phát và thời điểm trong năm. Giai đoạn thông quan phụ thuộc cơ quan hải quan và không được tính vào thời gian cam kết giao hàng của Shopee. Nếu đơn hàng không cập nhật trạng thái quá 7 ngày liên tiếp, người mua nên liên hệ Bộ phận Chăm sóc Khách hàng kèm mã đơn để được kiểm tra. Đơn quá thời hạn giao dự kiến sẽ được tự động gia hạn thời gian bảo vệ người mua.",
  },
  {
    id: "chunk_0166",
    docId: "legal_shipping",
    index: 3,
    section: "Mục 3 — Đơn thất lạc và hư hỏng",
    tokens: 182,
    excerpt:
      "Đơn được xác định thất lạc sau 15 ngày không cập nhật trạng thái; người mua được hoàn 100% giá trị đơn hàng và phí vận chuyển.",
    content:
      "3. Xử lý đơn thất lạc, hư hỏng\n\nMột đơn hàng được xác định là thất lạc nếu không có cập nhật trạng thái vận chuyển trong 15 ngày liên tiếp và đơn vị vận chuyển xác nhận không tìm thấy kiện hàng. Trong trường hợp này, người mua được hoàn 100% giá trị đơn hàng bao gồm cả phí vận chuyển đã trả. Với kiện hàng hư hỏng do vận chuyển, người mua cần cung cấp video mở hộp và ảnh kiện hàng trong vòng 48 giờ kể từ khi nhận để được bồi thường.",
  },
  {
    id: "chunk_0167",
    docId: "legal_shipping",
    index: 4,
    section: "Mục 4 — Đơn vị vận chuyển và thời gian",
    tokens: 176,
    excerpt:
      "Shopee liên kết với SPX Express, Giao Hàng Nhanh, Viettel Post, J&T Express, Ninja Van và Grab Express.",
    content:
      "4. Đơn vị vận chuyển liên kết\n\nShopee hợp tác với SPX Express, Giao Hàng Nhanh, Viettel Post, J&T Express, Ninja Van và Grab Express. Thời gian giao dự kiến hiển thị tại trang sản phẩm được tính theo khu vực người mua và đơn vị vận chuyển được chọn: nội thành 1–2 ngày, liên tỉnh 2–5 ngày, khu vực vùng sâu vùng xa 4–7 ngày. Thời gian này không bao gồm ngày lễ, Tết và các đợt cao điểm khuyến mãi.",
  },

  // ------------------------------------------------------------------ bảo mật (dùng cho nhiễu / BM25)
  {
    id: "chunk_0221",
    docId: "legal_privacy",
    index: 9,
    section: "Mục 4 — Quyền của chủ thể dữ liệu",
    tokens: 190,
    excerpt:
      "Người dùng có quyền truy cập, chỉnh sửa, rút lại sự đồng ý và yêu cầu xoá dữ liệu cá nhân của mình.",
    content:
      "4. Quyền của người dùng đối với dữ liệu cá nhân\n\nNgười dùng có quyền: truy cập và xem dữ liệu cá nhân Shopee đang lưu; yêu cầu chỉnh sửa thông tin không chính xác; rút lại sự đồng ý đã cung cấp trước đó; yêu cầu xoá dữ liệu khi không còn nhu cầu sử dụng dịch vụ; phản đối việc xử lý dữ liệu cho mục đích tiếp thị. Yêu cầu được gửi qua Trung tâm Hỗ trợ và Shopee phản hồi trong vòng 30 ngày. Một số dữ liệu giao dịch vẫn phải lưu theo yêu cầu của pháp luật kế toán và thuế.",
  },
];

export const CHUNKS_BY_ID: Record<string, Chunk> = Object.fromEntries(
  CHUNKS.map((chunk) => [chunk.id, chunk]),
);

export function getChunk(id: string): Chunk | undefined {
  return CHUNKS_BY_ID[id];
}
