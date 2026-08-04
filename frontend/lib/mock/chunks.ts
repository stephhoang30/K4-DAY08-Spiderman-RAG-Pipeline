import type { Chunk, KbChunk } from "@/lib/types";

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

// ---------------------------------------------------------------------------
// Trình duyệt chunk (trang Kho tri thức)
// ---------------------------------------------------------------------------

/**
 * Chunk THẬT được cắt từ `data/standardized/**\/*.md` bằng cửa sổ ký tự cố định
 * (chunk_size=800, step=700) nên hai chunk liền nhau luôn trùng đúng 100 ký tự —
 * đây là phần được tô nền ở trình duyệt chunk.
 *
 * Chỉ giữ tối đa 6 chunk đầu mỗi tài liệu để file mock không phình to; tổng số
 * chunk thật của từng tài liệu vẫn lấy từ `DOCUMENTS[].chunkCount`.
 * Tách riêng khỏi `CHUNKS` (chunk được trích dẫn ở trang Chat) để không làm
 * thay đổi dữ liệu mà các trang khác đang dùng.
 */
export const KB_CHUNKS: KbChunk[] = [

  // ---- legal_return_refund ----
  {
    id: "kb_legal_return_refund_000",
    docId: "legal_return_refund",
    index: 0,
    section: "CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN Nguồn: https://help.shopee.vn/portal/4/article/77251 Tải ngày: 2026-08-04 CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN 1. ĐỐI TƯỢNG VÀ PHẠM VI…",
    content:
      "CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN\n\nNguồn: https://help.shopee.vn/portal/4/article/77251 Tải ngày: 2026-08-04\n\nCHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN\n\n1. ĐỐI TƯỢNG VÀ PHẠM VI ÁP DỤNG\n\n1.1.Đối Tượng Áp Dụng\n\n1. Chính Sách Trả Hàng và Hoàn Tiền này áp dụng đối với Người Mua, Người Bán, các đơn vị cung cấp dịch vụ vận chuyển, nhân viên giao nhận (shipper) của các đơn vị cung cấp dịch vụ vận chuyển trên Sàn Giao Dịch Thương Mại Điện Tử Shopee (“Sàn Shopee”) và/hoặc các bên khác có liên quan.\n2. Khái niệm Người Mua sẽ được dùng để chỉ Người Mua hoặc Người Nhận Hàng trong từng trường hợp;\nKhái niệm Người Bán sẽ được dùng để chỉ Người Bán hoặc Người Gửi Hàng trong từng trường hợp. Shopee bảo lưu quyền sửa đổi Chính Sách Trả Hàng và Hoàn Tiền này vào bất cứ thời điểm nào.\n\n1.2.Phạm Vi Áp Dụng\n\nChính Sách ",
  },
  {
    id: "kb_legal_return_refund_001",
    docId: "legal_return_refund",
    index: 1,
    section: "1.2.Phạm Vi Áp Dụng",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "Trả Hàng và Hoàn Tiền này quy định về quyền và nghĩa vụ của Người Mua được yêu cầu trả hàng, hoàn tiền; cũng như quyền và nghĩa vụ của Shopee, Người Bán, đơn vị vận…",
    content:
      "đổi Chính Sách Trả Hàng và Hoàn Tiền này vào bất cứ thời điểm nào.\n\n1.2.Phạm Vi Áp Dụng\n\nChính Sách Trả Hàng và Hoàn Tiền này quy định về quyền và nghĩa vụ của Người Mua được yêu cầu trả hàng, hoàn tiền; cũng như quyền và nghĩa vụ của Shopee, Người Bán, đơn vị vận chuyển và/hoặc các bên có liên quan trong quá trình giải quyết yêu cầu của Người Mua.\n\n2. ĐIỀU KIỆN ÁP DỤNG\n\n2.1.Theo các điều khoản và điều kiện được quy định trong Chính Sách Trả Hàng và Hoàn Tiền này và tạo thành một phần của Điều Khoản Dịch Vụ, Shopee đảm bảo quyền lợi của Người Mua bằng cách cho phép Người Mua gửi yêu cầu hoàn trả sản phẩm đã mua (“Sản Phẩm Hoàn Trả”) và/hoặc hoàn tiền trước hoặc sau khi hết Thời Gian Shopee Đảm Bảo. Thời Gian Shopee Đảm Bảo đã được quy định trong Điều Khoản Dịch Vụ.\n2.2.Thời Gian Shopee Đảm",
  },
  {
    id: "kb_legal_return_refund_002",
    docId: "legal_return_refund",
    index: 2,
    section: "2. ĐIỀU KIỆN ÁP DỤNG",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "Bảo thực hiện bởi Shopee, theo yêu cầu của Người Dùng, để hỗ trợ Người Dùng trong việc giải quyết các xung đột, tranh chấp, khiếu nại có thể phát sinh trong quá…",
    content:
      "ảm Bảo. Thời Gian Shopee Đảm Bảo đã được quy định trong Điều Khoản Dịch Vụ.\n2.2.Thời Gian Shopee Đảm Bảo thực hiện bởi Shopee, theo yêu cầu của Người Dùng, để hỗ trợ Người Dùng trong việc giải quyết các xung đột, tranh chấp, khiếu nại có thể phát sinh trong quá trình giao dịch trên Sàn Shopee. Người Dùng có thể liên hệ với nhau để thỏa thuận về việc giải quyết tranh chấp của họ hoặc báo cáo lên Shopee hoặc cơ quan nhà nước có thẩm quyền để được hỗ trợ trong việc giải quyết bất kỳ tranh chấp xảy ra trước, trong hoặc sau Thời Gian Shopee Đảm Bảo.\n2.3.Chính Sách Trả Hàng và Hoàn Tiền cho sản phẩm thuộc Shopee Mall được quy định tại Điều Khoản Dịch Vụ Shopee Mall.\n\n3. ĐIỀU KIỆN YÊU CẦU TRẢ HÀNG/HOÀN TIỀN\n\n3.1.Người Mua đồng ý rằng Người Mua chỉ có thể yêu cầu trả hàng/hoàn tiền trong các trư",
  },
  {
    id: "kb_legal_return_refund_003",
    docId: "legal_return_refund",
    index: 3,
    section: "3. ĐIỀU KIỆN YÊU CẦU TRẢ HÀNG/HOÀN TIỀN",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ờng hợp sau: 1. Người Mua đã thanh toán bằng các phương thức thanh toán hợp lệ và trực tiếp trên Trang Shopee nhưng (i) không nhận được Sản Phẩm, hoặc (ii) không…",
    content:
      "G/HOÀN TIỀN\n\n3.1.Người Mua đồng ý rằng Người Mua chỉ có thể yêu cầu trả hàng/hoàn tiền trong các trường hợp sau:\n1. Người Mua đã thanh toán bằng các phương thức thanh toán hợp lệ và trực tiếp trên Trang Shopee nhưng\n(i) không nhận được Sản Phẩm, hoặc (ii) không nhận được toàn bộ các Sản Phẩm đã đặt, hoặc (iii) nhận được Sản Phẩm là hàng giả, hàng nhái;\n2. Sản Phẩm bị lỗi hoặc bị hư hại trong quá trình vận chuyển;\n3. Người Bán giao sai Sản Phẩm cho Người Mua (ví dụ: sai kích cỡ, sai màu sắc, v.v);\n4. Sản Phẩm mà Người Mua nhận được khác biệt một cách rõ rệt so với thông tin mà Người Bán cung cấp trong mục mô tả sản phẩm;\n5. Sản Phẩm hết hạn sử dụng;\n6. Người Bán đã tự thỏa thuận và đồng ý cho Người Mua trả hàng (tuy nhiên Shopee sẽ cần Người Bán xác nhận lại những thỏa thuận này).\n7. Sản Ph",
  },
  {
    id: "kb_legal_return_refund_004",
    docId: "legal_return_refund",
    index: 4,
    section: "3. ĐIỀU KIỆN YÊU CẦU TRẢ HÀNG/HOÀN TIỀN",
    tokens: 235,
    charCount: 800,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ẩm ở trạng thái nguyên vẹn và nguyên bao bì nhưng Người Mua không còn nhu cầu (\"Trả hàng COM\"), theo yêu cầu tại Điều 4 dưới đây. 3.2.Người Mua có thể gửi yêu cầu…",
    content:
      " Người Mua trả hàng (tuy nhiên Shopee sẽ cần Người Bán xác nhận lại những thỏa thuận này).\n7. Sản Phẩm ở trạng thái nguyên vẹn và nguyên bao bì nhưng Người Mua không còn nhu cầu (\"Trả hàng COM\"), theo yêu cầu tại Điều 4 dưới đây.\n3.2.Người Mua có thể gửi yêu cầu trả hàng/hoàn tiền trong vòng 15 (mười lăm) ngày kể từ lúc đơn hàng được cập nhật giao hàng thành công. Riêng đối với các Sản Phẩm là thực phẩm tươi sống và đông lạnh, Người Mua cần gửi yêu cầu trả hàng/hoàn tiền trong vòng 24 giờ kể từ lúc đơn hàng được cập nhật giao hàng thành công. Một số trường hợp Người Mua có nhu cầu trả hàng/hoàn tiền sau thời hạn trên, Shopee sẽ xem xét và có thể hỗ trợ Người Mua được trả hàng/hoàn tiền trong phạm vi phù hợp với Chính Sách Shopee.\n3.3. Đối với các đơn hàng được thanh toán bằng hình thức Tha",
  },
  {
    id: "kb_legal_return_refund_005",
    docId: "legal_return_refund",
    index: 5,
    section: "3. ĐIỀU KIỆN YÊU CẦU TRẢ HÀNG/HOÀN TIỀN",
    tokens: 235,
    charCount: 800,
    charStart: 3500,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "nh toán khi nhận hàng (COD) và/hoặc Chuyển khoản ngân hàng, tài khoản Shopee của Người Mua phải liên kết với các phương thức nhận hoàn tiền hợp lệ theo quy định áp…",
    content:
      " phạm vi phù hợp với Chính Sách Shopee.\n3.3. Đối với các đơn hàng được thanh toán bằng hình thức Thanh toán khi nhận hàng (COD) và/hoặc Chuyển khoản ngân hàng, tài khoản Shopee của Người Mua phải liên kết với các phương thức nhận hoàn tiền hợp lệ theo quy định áp dụng của Shopee (ví dụ như Tài Khoản Ngân Hàng và/hoặc các ví điện tử hợp lệ như Ví ShopeePay) trước khi thực hiện yêu cầu Trả hàng / Hoàn tiền. Để làm rõ, Người Mua sẽ không thể thực hiện yêu cầu Trả hàng/ Hoàn tiền trong trường hợp tài khoản Shopee của Người Mua không liên kết thành công với các phương thức nhận hoàn tiền theo quy định tại Điều 3.3 này.\n3.4. Tất cả các yêu cầu trả hàng hoàn tiền phải được thực hiện trên tài khoản Shopee của chính Người Mua đã đặt đơn hàng.\n3.5.Shopee luôn xem xét cẩn thận các yêu cầu trả hàng/ho",
  },

  // ---- legal_privacy ----
  {
    id: "kb_legal_privacy_000",
    docId: "legal_privacy",
    index: 0,
    section: "1. GIỚI THIỆU",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "CHÍNH SÁCH BẢO MẬT Nguồn: https://help.shopee.vn/portal/4/article/77244 Tải ngày: 2026-08-04 CHÍNH SÁCH BẢO MẬT 1. GIỚI THIỆU 1.1. Chào mừng bạn đến với nền tảng…",
    content:
      "CHÍNH SÁCH BẢO MẬT\n\nNguồn: https://help.shopee.vn/portal/4/article/77244 Tải ngày: 2026-08-04\n\nCHÍNH SÁCH BẢO MẬT\n\n1. GIỚI THIỆU\n\n1.1. Chào mừng bạn đến với nền tảng Shopee.vn (bao gồm website và ứng dụng di động Shopee) được vận hành bởi Công ty TNHH Shopee và các công ty liên kết (gọi riêng và gọi chung là, \"Shopee\", \"chúng tôi\", hay \"của chúng tôi\"). Shopee nghiêm túc thực hiện trách nhiệm của mình liên quan đến bảo mật thông tin theo các quy định về bảo vệ bí mật thông tin cá nhân của pháp luật Việt Nam (“Luật riêng tư”) và cam kết tôn trọng quyền riêng tư và sự quan tâm của tất cả người dùng đối với website và ứng dụng di động của chúng tôi (“Nền tảng”) (chúng tôi gọi chung Các Nền tảng và các dịch vụ chúng tôi cung cấp như được mô tả trong Nền tảng của chúng tôi là \"các Dịch Vụ\"). Ng",
  },
  {
    id: "kb_legal_privacy_001",
    docId: "legal_privacy",
    index: 1,
    section: "1. GIỚI THIỆU",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ười dùng có nghĩa là người đăng ký tài khoản với chúng tôi để sử dụng các Dịch Vụ, bao gồm cả người mua và người bán (gọi chung và gọi riêng là “Các Người Dùng”…",
    content:
      " và các dịch vụ chúng tôi cung cấp như được mô tả trong Nền tảng của chúng tôi là \"các Dịch Vụ\"). Người dùng có nghĩa là người đăng ký tài khoản với chúng tôi để sử dụng các Dịch Vụ, bao gồm cả người mua và người bán (gọi chung và gọi riêng là “Các Người Dùng”, “bạn” hoặc “của bạn”). Chúng tôi nhận biết tầm quan trọng của dữ liệu cá nhân mà bạn đã tin tưởng giao cho chúng tôi và tin rằng chúng tôi có trách nhiệm quản lý, bảo vệ và xử lý dữ liệu cá nhân của bạn một cách thích hợp. Chính sách bảo mật này (\"Chính sách bảo mật\" hay \"Chính sách\") được thiết kế để giúp bạn hiểu được cách thức chúng tôi thu thập, sử dụng, tiết lộ và/hoặc xử lý dữ liệu cá nhân mà bạn đã cung cấp cho chúng tôi và/hoặc lưu giữ về bạn, cho dù là hiện nay hoặc trong tương lai, cũng như để giúp bạn đưa ra quyết định sá",
  },
  {
    id: "kb_legal_privacy_002",
    docId: "legal_privacy",
    index: 2,
    section: "1. GIỚI THIỆU",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ng suốt trước khi cung cấp cho chúng tôi bất kỳ dữ liệu cá nhân nào của bạn. 1.2. \"Dữ Liệu Cá Nhân\" hay \"dữ liệu cá nhân\" có nghĩa là dữ liệu, dù đúng hay không, về…",
    content:
      "c lưu giữ về bạn, cho dù là hiện nay hoặc trong tương lai, cũng như để giúp bạn đưa ra quyết định sáng suốt trước khi cung cấp cho chúng tôi bất kỳ dữ liệu cá nhân nào của bạn.\n1.2. \"Dữ Liệu Cá Nhân\" hay \"dữ liệu cá nhân\" có nghĩa là dữ liệu, dù đúng hay không, về một cá nhân mà thông qua đó có thể được xác định được danh tính, hoặc từ dữ liệu đó và thông tin khác mà một tổ chức có hoặc có khả năng tiếp cận. Các ví dụ thường gặp về dữ liệu cá nhân có thể gồm có tên, số chứng minh nhân dân và thông tin liên hệ.\n1.3. Bằng việc sử dụng Các Dịch Vụ, đăng ký một tài khoản với chúng tôi hoặc truy cập Nền tảng, bạn xác nhận và đồng ý rằng bạn chấp nhận các phương pháp, yêu cầu, và/hoặc chính sách được mô tả trong Chính sách bảo mật này, và theo đây bạn xác nhận bạn đã biết rõ và đồng ý toàn bộ ch",
  },
  {
    id: "kb_legal_privacy_003",
    docId: "legal_privacy",
    index: 3,
    section: "1. GIỚI THIỆU",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "o phép chúng tôi thu thập, sử dụng, tiết lộ và/hoặc xử lý dữ liệu cá nhân của bạn như mô tả trong đây. NẾU BẠN KHÔNG ĐỒNG Ý CHO PHÉP XỬ LÝ DỮ LIỆU CÁ NHÂN CỦA BẠN…",
    content:
      "ược mô tả trong Chính sách bảo mật này, và theo đây bạn xác nhận bạn đã biết rõ và đồng ý toàn bộ cho phép chúng tôi thu thập, sử dụng, tiết lộ và/hoặc xử lý dữ liệu cá nhân của bạn như mô tả trong đây. NẾU BẠN KHÔNG ĐỒNG Ý\n\nCHO PHÉP XỬ LÝ DỮ LIỆU CÁ NHÂN CỦA BẠN NHƯ MÔ TẢ TRONG CHÍNH SÁCH NÀY, VUI LÒNG\n\nKHÔNG SỬ DỤNG CÁC DỊCH VỤ CỦA CHÚNG TÔI HAY TRUY CẬP NỀN TẢNG HOẶC TRANG WEB\n\nCỦA CHÚNG TÔI. Nếu chúng tôi thay đổi Chính sách bảo mật của mình, chúng tôi sẽ thông báo cho bạn bao gồm cả thông qua việc đăng tải những thay đổi đó hoặc Chính sách bảo mật sửa đổi trên Nền tảng của chúng tôi. Trong phạm vi pháp luật cho phép, việc tiếp tục sử dụng các Dịch Vụ hoặc Nền Tảng, bao gồm giao dịch của bạn, được xem là bạn đã công nhận và đồng ý với các thay đổi trong Chính Sách Bảo Mật này.\n1.4. Chí",
  },
  {
    id: "kb_legal_privacy_004",
    docId: "legal_privacy",
    index: 4,
    section: "KHÔNG SỬ DỤNG CÁC DỊCH VỤ CỦA CHÚNG TÔI HAY TRUY CẬP NỀN TẢNG H…",
    tokens: 235,
    charCount: 800,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "nh sách này áp dụng cùng với các thông báo, điều khoản hợp đồng, điều khoản chấp thuận khác áp dụng liên quan đến việc chúng tôi thu thập, lưu trữ, sử dụng, tiết lộ…",
    content:
      " bạn, được xem là bạn đã công nhận và đồng ý với các thay đổi trong Chính Sách Bảo Mật này.\n1.4. Chính sách này áp dụng cùng với các thông báo, điều khoản hợp đồng, điều khoản chấp thuận khác áp dụng liên quan đến việc chúng tôi thu thập, lưu trữ, sử dụng, tiết lộ và/hoặc xử lý dữ liệu cá nhân của bạn và không nhằm ghi đè những thông báo hoặc các điều khoản đó trừ khi chúng tôi có tuyên bố ràng khác.\n1.5. Chính sách này được áp dụng cho cả Người bán và Người mua đang sử dụng Dịch vụ trừ khi có tuyên bố rõ ràng ngược lại.\n\n2.KHI NÀO SHOPEE SẼ THU THẬP DỮ LIỆU CÁ NHÂN?\n\n2.1. Chúng tôi sẽ/có thể thu thập dữ liệu cá nhân về bạn:\n\n* khi bạn đăng ký và/hoặc sử dụng Các Dịch Vụ hoặc Nền tảng của chúng tôi, hoặc mở một tài khoản với chúng tôi;\n* khi bạn gửi bất kỳ biểu mẫu nào, bao gồm đơn đăng ký",
  },
  {
    id: "kb_legal_privacy_005",
    docId: "legal_privacy",
    index: 5,
    section: "2.1. Chúng tôi sẽ/có thể thu thập dữ liệu cá nhân về bạn:",
    tokens: 235,
    charCount: 800,
    charStart: 3500,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "hoặc các mẫu đơn khác liên quan đến bất kỳ sản phẩm và dịch vụ nào của chúng tôi, bằng hình thức trực tuyến hay dưới hình thức khác; * khi bạn ký kết bất kỳ thỏa…",
    content:
      "úng tôi, hoặc mở một tài khoản với chúng tôi;\n* khi bạn gửi bất kỳ biểu mẫu nào, bao gồm đơn đăng ký hoặc các mẫu đơn khác liên quan đến bất kỳ sản phẩm và dịch vụ nào của chúng tôi, bằng hình thức trực tuyến hay dưới hình thức khác;\n* khi bạn ký kết bất kỳ thỏa thuận nào hoặc cung cấp các tài liệu hoặc thông tin khác liên quan đến tương tác giữa bạn với chúng tôi, hoặc khi bạn sử dụng các sản phẩm và dịch vụ của chúng tôi;\n* khi bạn tương tác với chúng tôi, chẳng hạn như thông qua các cuộc gọi điện thoại (có thể được ghi âm lại), thư từ, fax, gặp gỡ trực tiếp, các nền ứng dụng truyền thông xã hội và email;\n* khi bạn sử dụng các dịch vụ điện tử của chúng tôi, hoặc tương tác với chúng tôi qua Nền tảng hoặc Trang Web hoặc Các Dịch Vụ của chúng tôi. Trường hợp này bao gồm thông qua tập tin co",
  },

  // ---- legal_listing_rules ----
  {
    id: "kb_legal_listing_rules_000",
    docId: "legal_listing_rules",
    index: 0,
    section: "QUY ĐỊNH VỀ ĐĂNG BÁN SẢN PHẨM TRÊN SHOPEE",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "QUY ĐỊNH VỀ ĐĂNG BÁN SẢN PHẨM TRÊN SHOPEE Nguồn: https://help.shopee.vn/portal/4/article/77246 Tải ngày: 2026-08-04 QUY ĐỊNH VỀ ĐĂNG BÁN SẢN PHẨM TRÊN SHOPEE A…",
    content:
      "QUY ĐỊNH VỀ ĐĂNG BÁN SẢN PHẨM TRÊN SHOPEE\n\nNguồn: https://help.shopee.vn/portal/4/article/77246 Tải ngày: 2026-08-04\n\nQUY ĐỊNH VỀ ĐĂNG BÁN SẢN PHẨM TRÊN SHOPEE\n\nA. PHẠM VI VÀ ĐỐI TƯỢNG ÁP DỤNG\n\n_1. Đối tượng áp dụng_\n\nQuy định này áp dụng đối với tất cả Người Bán trên Sàn TMĐT Shopee (“ _Sàn Shopee_ ”)\n\n_2. Phạm vi áp dụng_\n\nQuy định này quy định về việc đăng bán các sản phẩm trên Sàn Shopee.\n\nB. QUY ĐỊNH CHUNG:\n\n_1. Nguyên tắc chung_\n\na. Đăng bán sản phẩm trên Shopee là hoạt động của Người Bán dùng hàng hóa, dịch vụ và tài liệu về hàng hóa, dịch vụ để giới thiệu với khách hàng về hàng hóa, dịch vụ đó.\nb. Khi đăng bán sản phẩm trên Shopee, Người Bán có trách nhiệm tuân thủ các quy định tại Điều 117, Điều\n120.4, Điều 121 của Luật Thương Mại và các văn bản quy phạm pháp luật có liên quan đến",
  },
  {
    id: "kb_legal_listing_rules_001",
    docId: "legal_listing_rules",
    index: 1,
    section: "1. Nguyên tắc chung",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "hoạt động trưng bày, giới thiệu hàng hóa, dịch vụ. Đối với Người Bán là pháp nhân có vốn đầu tư nước ngoài, Người Bán cần có Giấy phép kinh doanh phù hợp với quy…",
    content:
      "iều 117, Điều\n120.4, Điều 121 của Luật Thương Mại và các văn bản quy phạm pháp luật có liên quan đến hoạt động trưng bày, giới thiệu hàng hóa, dịch vụ. Đối với Người Bán là pháp nhân có vốn đầu tư nước ngoài, Người Bán cần có Giấy phép kinh doanh phù hợp với quy định của pháp luật hiện hành.\nc. Tất cả chứng từ mà Người Bán được yêu cầu cung cấp thì Người Bán phải đảm bảo và cam kết tất cả các chứng từ mà Người Bán cung cấp cho Shopee đều được scan từ chứng từ gốc, không được làm giả, chỉnh sửa, tẩy xóa.\n\n_2. Các nội dung không được phép đăng bán_\n\nNgười Bán được quyền đăng các sản phẩm lên Shopee nhằm mục đích kinh doanh. Tuy nhiên, NGHIÊM CẤM đăng tải những sản phẩm có nội dung sau đây:\na. Phản động, chống phá, bài xích tôn giáo, khiêu dâm, bạo lực, đi ngược lại thuần phong mỹ tục, truyền",
  },
  {
    id: "kb_legal_listing_rules_002",
    docId: "legal_listing_rules",
    index: 2,
    section: "2. Các nội dung không được phép đăng bán",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "thống và văn hóa Việt Nam, xâm phạm chủ quyền, toàn vẹn lãnh thổ, an ninh quốc gia của Việt Nam; b. Đăng thông tin rác, phá rối hay làm mất uy tín của các dịch vụ…",
    content:
      "Phản động, chống phá, bài xích tôn giáo, khiêu dâm, bạo lực, đi ngược lại thuần phong mỹ tục, truyền thống và văn hóa Việt Nam, xâm phạm chủ quyền, toàn vẹn lãnh thổ, an ninh quốc gia của Việt Nam;\nb. Đăng thông tin rác, phá rối hay làm mất uy tín của các dịch vụ do Shopee cung cấp;\nc. Xúc phạm, khích bác đến người khác dưới bất kỳ hình thức nào;\nd. Tuyên truyền về những thông tin mà pháp luật nghiêm cấm như: sử dụng heroin, thuốc lắc, giết người, cướp của,vv… (Ví dụ: sản phẩm in hình lá cần sa, shisha);\ne. Khuyến khích, quảng cáo cho việc sử dụng các sản phẩm độc hại (VD: thuốc lá, rượu, cần sa);\nf. Các sản phẩm văn hóa đồi trụy (băng đĩa, sách báo, vật phẩm);\ng. Tài liệu bí mật quốc gia, bí mật nhà nước, bí mật kinh doanh, bí mật cá nhân;\nh. Con người và/hoặc các bộ phận của cơ thể con n",
  },
  {
    id: "kb_legal_listing_rules_003",
    docId: "legal_listing_rules",
    index: 3,
    section: "2. Các nội dung không được phép đăng bán",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "gười; i. Động vật và chế phẩm từ động vật (bao gồm động vật hoang dã) như: chó, mèo, cá, ốc, chuột, nhím, ốc mượn hồn, hamster, ngà voi, sừng tê giác, cao hổ, da/…",
    content:
      "í mật nhà nước, bí mật kinh doanh, bí mật cá nhân;\nh. Con người và/hoặc các bộ phận của cơ thể con người;\ni. Động vật và chế phẩm từ động vật (bao gồm động vật hoang dã) như: chó, mèo, cá, ốc, chuột, nhím, ốc mượn hồn, hamster, ngà voi, sừng tê giác, cao hổ, da/ lông động vật,...) j. Những sản phẩm có tính chất phân biệt chủng tộc, xúc phạm đến dân tộc hoặc quốc gia nào đó;\nk. Hạn chế tối đa những sản phẩm mang tính cá nhân (như hình cá nhân, hình ảnh của gia đình, hình ảnh của con cái);\nl. Vi phạm quyền sở hữu trí tuệ và/hoặc bất kỳ nhãn hiệu hàng hóa nào của bất kỳ bên thứ ba nào;\nm. Các sản phẩm nằm trong Danh sách sản phẩm bị cấm/hạn chế của Shopee.\n\n_3. Các hành vi không được thực hiện_\n\na. Sử dụng thông tin, hình ảnh, âm thanh vi phạm pháp luật, thiếu thẩm mỹ, trái với truyền thống l",
  },
  {
    id: "kb_legal_listing_rules_004",
    docId: "legal_listing_rules",
    index: 4,
    section: "3. Các hành vi không được thực hiện",
    tokens: 235,
    charCount: 800,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ịch sử, văn hóa, đạo đức, thuần phong mỹ tục Việt Nam. b. Xúc phạm uy tín, danh dự, nhân phẩm của tổ chức, cá nhân. c. Sử dụng hình ảnh, lời nói, chữ viết của cá…",
    content:
      "\n\na. Sử dụng thông tin, hình ảnh, âm thanh vi phạm pháp luật, thiếu thẩm mỹ, trái với truyền thống lịch sử, văn hóa, đạo đức, thuần phong mỹ tục Việt Nam.\nb. Xúc phạm uy tín, danh dự, nhân phẩm của tổ chức, cá nhân.\nc. Sử dụng hình ảnh, lời nói, chữ viết của cá nhân khi chưa được cá nhân đó đồng ý, trừ trường hợp được pháp luật cho phép.\nd. Cung cấp thông tin, quảng cáo không đúng hoặc gây nhầm lẫn về khả năng kinh doanh, khả năng cung cấp sản phẩm, hàng hóa, dịch vụ của tổ chức, cá nhân kinh doanh sản phẩm, hàng hóa, dịch vụ; về số lượng, chất lượng, giá, công dụng, kiểu dáng, bao bì, nhãn hiệu, xuất xứ, chủng loại, phương thức phục vụ, thời hạn bảo hành của sản phẩm, hàng hoá, dịch vụ đã đăng ký hoặc đã được công bố.\ne. So sánh trực tiếp về giá cả, chất lượng, hiệu quả sử dụng sản phẩm, ",
  },
  {
    id: "kb_legal_listing_rules_005",
    docId: "legal_listing_rules",
    index: 5,
    section: "3. Các hành vi không được thực hiện",
    tokens: 235,
    charCount: 800,
    charStart: 3500,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "hàng hóa, dịch vụ của mình với giá cả, chất lượng, hiệu quả sử dụng sản phẩm, hàng hóa, dịch vụ cùng loại của tổ chức, cá nhân khác. f. Có nội dung cạnh tranh không…",
    content:
      "ăng ký hoặc đã được công bố.\ne. So sánh trực tiếp về giá cả, chất lượng, hiệu quả sử dụng sản phẩm, hàng hóa, dịch vụ của mình với giá cả, chất lượng, hiệu quả sử dụng sản phẩm, hàng hóa, dịch vụ cùng loại của tổ chức, cá nhân khác.\nf. Có nội dung cạnh tranh không lành mạnh theo quy định của pháp luật về cạnh tranh.\ng. Quảng cáo cho các doanh nghiệp khác. Ví dụ như sản phẩm có chứa hình ảnh, logo, địa chỉ, hotline, đường link của doanh nghiệp hoặc website mua bán khác.\nh. Đăng bán một sản phẩm lặp đi lặp lại (spam) trên cùng một danh mục hoặc các danh mục khác nhau.\ni. Thay đổi nội dung tin đăng để gian lận đánh giá hoặc tạo đơn ảo để gian lận tăng số lượng đơn hàng và đánh giá.\nj. Đăng bán không đúng ngành hàng, sử dụng hình ảnh minh họa không đúng về hàng hóa, dịch vụ được đăng bán nhằm ",
  },

  // ---- legal_prohibited ----
  {
    id: "kb_legal_prohibited_000",
    docId: "legal_prohibited",
    index: 0,
    section: "CHÍNH SÁCH CẤM/HẠN CHẾ SẢN PHẨM",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "CHÍNH SÁCH CẤM/HẠN CHẾ SẢN PHẨM Nguồn: https://help.shopee.vn/portal/4/article/77247 Tải ngày: 2026-08-04 CHÍNH SÁCH CẤM/HẠN CHẾ SẢN PHẨM 1. ĐỐI TƯỢNG ÁP DỤNG Chính…",
    content:
      "CHÍNH SÁCH CẤM/HẠN CHẾ SẢN PHẨM\n\nNguồn: https://help.shopee.vn/portal/4/article/77247 Tải ngày: 2026-08-04\n\nCHÍNH SÁCH CẤM/HẠN CHẾ SẢN PHẨM\n\n1. ĐỐI TƯỢNG ÁP DỤNG\n\nChính sách này áp dụng đối với tất cả Người Bán trên Sàn TMĐT Shopee (“ _Sàn Shopee_ ”).\n\n2. PHẠM VI ÁP DỤNG\n\nChính sách này áp dụng đối với việc đăng bán sản phẩm, hàng hóa, dịch vụ trên Sàn Shopee. Mỗi khi đăng bán sản phẩm, Người Bán có trách nhiệm đảm bảo hàng hóa của mình tuân thủ Luật pháp hiện hành đồng thời không vi phạm các Điều Khoản Sử Dụng và Chính Sách Shopee. Vui lòng đọc kỹ các hướng dẫn dưới đây về _Chính Sách Cấm/Hạn Chế Sản Phẩm_ mua bán trên Shopee.\nDanh sách có thể sẽ thay đổi dựa theo tình hình thực tế, vui lòng cập nhật thường xuyên để đảm bảo hàng hóa của bạn không vi phạm Chính Sách Shopee.\n\n3. HÀNH VI VI ",
  },
  {
    id: "kb_legal_prohibited_001",
    docId: "legal_prohibited",
    index: 1,
    section: "3. HÀNH VI VI PHẠM VÀ BIỆN PHÁP XỬ LÝ",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "PHẠM VÀ BIỆN PHÁP XỬ LÝ Việc vi phạm Chính Sách Cấm/Hạn Chế Sản Phẩm có thể dẫn đến việc Người Bán phải chịu một loạt các chế tài, bao gồm nhưng không giới hạn các…",
    content:
      "g cập nhật thường xuyên để đảm bảo hàng hóa của bạn không vi phạm Chính Sách Shopee.\n\n3. HÀNH VI VI PHẠM VÀ BIỆN PHÁP XỬ LÝ\n\nViệc vi phạm Chính Sách Cấm/Hạn Chế Sản Phẩm có thể dẫn đến việc Người Bán phải chịu một loạt các chế tài, bao gồm nhưng không giới hạn các chế tài sau:\n(i) Sản phẩm bị xóa;\n(ii) Tài khoản bị giới hạn quyền;\n(iii) Tài khoản bị đình chỉ hoạt động hoặc bị xóa;\n(iv) Cấn trừ số dư tài khoản Shopee, phong tỏa quyền rút tiền từ số dư tài khoản Shopee;\n(v) Các chế tài khác theo chính sách của Shopee hoặc theo quy định của pháp luật bao gồm nhưng không giới hạn phạt hành chính, xử lý hình sự và/hoặc bồi thường thiệt hại.\nViệc áp dụng các biện pháp chế tài cụ thể khác sẽ thuộc toàn quyền quyết định của Shopee theo Chính Sách Xử Lý Gian Lận/Vi Phạm có hiệu lực trong từng thời ",
  },
  {
    id: "kb_legal_prohibited_002",
    docId: "legal_prohibited",
    index: 2,
    section: "3. HÀNH VI VI PHẠM VÀ BIỆN PHÁP XỬ LÝ",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "điểm trên Sàn Shopee. 4. DANH SÁCH SẢN PHẨM BỊ CẤM/HẠN CHẾ MUA BÁN TRÊN SHOPEE 4.1. Hàng vi phạm bản quyền: Hàng nhái, hàng giả, bản sao trái phép của một sản phẩm…",
    content:
      "toàn quyền quyết định của Shopee theo Chính Sách Xử Lý Gian Lận/Vi Phạm có hiệu lực trong từng thời điểm trên Sàn Shopee.\n\n4. DANH SÁCH SẢN PHẨM BỊ CẤM/HẠN CHẾ MUA BÁN TRÊN SHOPEE\n\n4.1. Hàng vi phạm bản quyền: Hàng nhái, hàng giả, bản sao trái phép của một sản phẩm hay hiện vật mà có thể vi phạm quyền tác giả, quyền thương hiệu, hoặc các quyền sở hữu trí tuệ khác của các bên thứ ba.\n\n4.2. Thiết bị, trang phục quân đội, lực lượng thi hành pháp luật và chính phủ\n\na. Các vật phẩm và thiết bị được cấp bởi chính phủ, công an hoặc quân đội.\nb. Các thiết bị, trang phục, vật dụng có chứa hình ảnh quốc huy.\n\n4.3. Tài liệu phản động & Thông tin xâm phạm đến An ninh quốc gia\n\na. Sản phẩm liên quan đến khủng bố hoặc các tổ chức khủng bố.\nb. Sản phẩm liên quan đến chiến dịch, bầu cử, vấn đề chính trị h",
  },
  {
    id: "kb_legal_prohibited_003",
    docId: "legal_prohibited",
    index: 3,
    section: "4.3. Tài liệu phản động & Thông tin xâm phạm đến An ninh quốc g…",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "oặc vấn đề tranh luận công khai, chiến tranh… c. Sản phẩm ủng hộ hoặc chống lại hoặc công kích một chính trị gia hoặc đảng phái chính trị. d. Sách báo, ấn phẩm…",
    content:
      "khủng bố hoặc các tổ chức khủng bố.\nb. Sản phẩm liên quan đến chiến dịch, bầu cử, vấn đề chính trị hoặc vấn đề tranh luận công khai, chiến tranh…\nc. Sản phẩm ủng hộ hoặc chống lại hoặc công kích một chính trị gia hoặc đảng phái chính trị.\nd. Sách báo, ấn phẩm, băng đĩa có yếu tố liên quan đến chính trị.\ne. Tất cả các sản phẩm/ thiết bị có hình ảnh bản đồ hoặc sử dụng bản đồ.\n\n4.4. Dịch vụ bất hợp pháp\n\na. Tiền đang có giá trị lưu hành, tiền phát hành bởi chế độ cũ, tiền giả (trừ tiền âm phủ), tiền ảo (Bitcoin, Pi,...), thẻ tín dụng và thẻ ghi nợ đã kích hoạt.\nb. Cổ phiếu, cổ phần, các loại chứng khoán và các loại con dấu.\nc. Máy chơi cờ bạc, các sản phẩm hỗ trợ cho việc thực hiện hành vi đánh bạc.\nd. Thông tin và giá trị sản phẩm không được thể hiện rõ ràng / sản phẩm có tính chất may rủi/",
  },
  {
    id: "kb_legal_prohibited_004",
    docId: "legal_prohibited",
    index: 4,
    section: "4.4. Dịch vụ bất hợp pháp",
    tokens: 235,
    charCount: 800,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "cờ bạc/ xổ số/các sản phẩm dưới dạng hộp quà bí mật, sản phẩm ngẫu nhiên. e. Cung cấp các dịch vụ như: nạp tiền điện tử, tuyển dụng, môi giới bất động sản, bảo…",
    content:
      "h bạc.\nd. Thông tin và giá trị sản phẩm không được thể hiện rõ ràng / sản phẩm có tính chất may rủi/ cờ bạc/ xổ số/các sản phẩm dưới dạng hộp quà bí mật, sản phẩm ngẫu nhiên.\ne. Cung cấp các dịch vụ như: nạp tiền điện tử, tuyển dụng, môi giới bất động sản, bảo hiểm,v.v..., đặc biệt là các dịch vụ bất hợp pháp như mại dâm, bị cấm trên nền tảng của Shopee.\n\n4.5. Súng, vũ khí và các sản phẩm có hình dạng giống vũ khí\n\na. Súng, vũ khí và các sản phẩm có hình dạng giống vũ khí:\n* Các loại đồ chơi có hình dáng giống như các loại súng, lựu đạn, bom, mìn..., trừ đồ chơi phun nước hoặc tạo bong bóng;\n* Súng nén bằng hơi nước hoặc lò-xo bắn đạn nhựa hoặc các loại đạn khác.\n* Súng hơi nước; súng bắn phát quang hoặc bắn gây tiếng nổ.\nb. Kiếm, mác, lê, dao găm, cung nỏ (làm bằng các loại vật liệu kể cả",
  },
  {
    id: "kb_legal_prohibited_005",
    docId: "legal_prohibited",
    index: 5,
    section: "4.5. Súng, vũ khí và các sản phẩm có hình dạng giống vũ khí",
    tokens: 235,
    charCount: 800,
    charStart: 3500,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "gỗ, tre, giấy nén...). Các loại đồ chơi có hình dáng giống các loại vũ khí khác. c. Hơi cay, bình xịt hơi cay, bình xịt CS, bình xịt hơi ngạt, bình xịt chất độc…",
    content:
      "át quang hoặc bắn gây tiếng nổ.\nb. Kiếm, mác, lê, dao găm, cung nỏ (làm bằng các loại vật liệu kể cả gỗ, tre, giấy nén...). Các loại đồ chơi có hình dáng giống các loại vũ khí khác.\nc. Hơi cay, bình xịt hơi cay, bình xịt CS, bình xịt hơi ngạt, bình xịt chất độc, bình xịt chất gây mê, bình xịt chất gây ngứa.\nd. Dùi cui, dùi cui điện, dùi cui kim loại, dùi cui cao su.\ne. Tay đấm gấu, nhẫn tự vệ.\nf. Tất cả các bộ phận, bộ dụng cụ, đạn dược, linh kiện và phụ kiện dành cho súng, bao gồm nhưng không giới hạn ở:\n* Các phụ kiện súng bên trong như: đạn, băng đạn, nòng súng, bộ dụng cụ chuyển đổi vũ khí và kim hoả.\n* Các phụ kiện súng bên ngoài như: bộ giảm thanh, báng súng, khóa nòng, các bộ phận điều khiển hỏa lực và cò súng.\n* Bất cứ sản phẩm nào khác mà theo quyết định của riêng Shopee có thể đư",
  },

  // ---- legal_shipping ----
  {
    id: "kb_legal_shipping_000",
    docId: "legal_shipping",
    index: 0,
    section: "CHÍNH SÁCH VẬN CHUYỂN SHOPEE",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "CHÍNH SÁCH VẬN CHUYỂN SHOPEE Nguồn: https://help.shopee.vn/portal/4/article/77250 Tải ngày: 2026-08-04 CHÍNH SÁCH VẬN CHUYỂN SHOPEE A. PHẠM VI VÀ ĐỐI TƯỢNG ÁP DỤNG…",
    content:
      "CHÍNH SÁCH VẬN CHUYỂN SHOPEE\n\nNguồn: https://help.shopee.vn/portal/4/article/77250 Tải ngày: 2026-08-04\n\nCHÍNH SÁCH VẬN CHUYỂN SHOPEE\n\nA. PHẠM VI VÀ ĐỐI TƯỢNG ÁP DỤNG\n\n_1. Đối tượng áp dụng_\n\na. Chính Sách Vận Chuyển này áp dụng đối với Người Mua, Người Bán, các đơn vị cung cấp dịch vụ vận chuyển, nhân viên giao nhận (shipper) của các đơn vị cung cấp dịch vụ vận chuyển trên Sàn TMĐT Shopee (“Sàn Shopee”);\nb. Khái niệm Người Mua sẽ được dùng để chỉ Người Mua hoặc Người Nhận Hàng trong từng trường hợp;\nKhái niệm Người Bán sẽ được dùng để chỉ Người Bán hoặc Người Gửi Hàng trong từng trường hợp. Bằng cách sử dụng dịch vụ vận chuyển được hỗ trợ trên Sàn Shopee, Người Mua/ Người Bán đã thừa nhận và đồng ý với các yêu cầu, và/hoặc các điều khoản và điều kiện, thực tiễn áp dụng nêu trong Chính Sác",
  },
  {
    id: "kb_legal_shipping_001",
    docId: "legal_shipping",
    index: 1,
    section: "1. Đối tượng áp dụng",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "h Vận Chuyển này. Shopee bảo lưu quyền sửa đổi Chính Sách Vận Chuyển này vào bất cứ thời điểm nào. _2. Phạm vi áp dụng_ a. Chính Sách Vận Chuyển này quy định về các…",
    content:
      "à đồng ý với các yêu cầu, và/hoặc các điều khoản và điều kiện, thực tiễn áp dụng nêu trong Chính Sách Vận Chuyển này. Shopee bảo lưu quyền sửa đổi Chính Sách Vận Chuyển này vào bất cứ thời điểm nào.\n\n_2. Phạm vi áp dụng_\n\na. Chính Sách Vận Chuyển này quy định về các loại hàng hóa không hỗ trợ vận chuyển, vận chuyển có điều kiện, quy định về đóng gói hàng hóa, các quyền, nghĩa vụ của các Bên liên quan đến việc vận chuyển hàng hóa mà Sàn Shopee hỗ trợ vận chuyển.\nb. Chính Sách Vận Chuyển này không áp dụng đối với trường hợp Người Bán tự tổ chức vận chuyển hàng hóa của Người Bán, dù một phần hoặc toàn bộ. Trong trường hợp này, Người Bán phải đảm bảo tuân thủ các quy định của pháp luật có liên quan và tự chịu trách nhiệm trước pháp luật, Người Mua và bên thứ ba đối với phạm vi vận chuyển mà Ng",
  },
  {
    id: "kb_legal_shipping_002",
    docId: "legal_shipping",
    index: 2,
    section: "2. Phạm vi áp dụng",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ười Bán tự tổ chức. B. QUY ĐỊNH VỀ HÀNG HÓA KHÔNG HỖ TRỢ VẬN CHUYỂN, VẬN CHUYỂN CÓ ĐIỀU KIỆN _1. Quy định về các loại hàng hóa không hỗ trợ vận chuyển trên Shopee_…",
    content:
      "uan và tự chịu trách nhiệm trước pháp luật, Người Mua và bên thứ ba đối với phạm vi vận chuyển mà Người Bán tự tổ chức.\n\nB. QUY ĐỊNH VỀ HÀNG HÓA KHÔNG HỖ TRỢ VẬN CHUYỂN, VẬN CHUYỂN CÓ ĐIỀU KIỆN\n\n_1. Quy định về các loại hàng hóa không hỗ trợ vận chuyển trên Shopee_\n\n1.1. Các loại hàng hóa không hỗ trợ vận chuyển trên Sàn Shopee bao gồm nhưng không giới hạn các loại hàng hóa sau:\na. Hàng hóa thuộc danh mục cấm/hạn chế trên Sàn Shopee. Xem chi tiết tại _TẠI ĐÂY_ ;\nb. Các vật phẩm làm bằng vàng, bạc, đá quý hoặc các loại kim khí quý khác;\nc. Hóa chất tẩy rửa đậm đặc, dung dịch/ bột dùng pha chế sản xuất công nghiệp;\nd. Đơn hàng có giá trị hàng hóa lớn hơn 50.000.000VNĐ (Tổng giá trị hàng hóa với giá khuyến mãi nếu có, không bao gồm mã giảm giá của Shopee, mã giảm giá của Người Bán, xu và phí ",
  },
  {
    id: "kb_legal_shipping_003",
    docId: "legal_shipping",
    index: 3,
    section: "1. Quy định về các loại hàng hóa không hỗ trợ vận chuyển trên S…",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "vận chuyển); e. Đơn hàng có dấu hiệu gian lận, lợi dụng các Chính Sách, hỗ trợ của Shopee; f. Người Mua/Người Bán không tuân theo các hướng dẫn, quy định và khuyến…",
    content:
      "i giá khuyến mãi nếu có, không bao gồm mã giảm giá của Shopee, mã giảm giá của Người Bán, xu và phí vận chuyển);\ne. Đơn hàng có dấu hiệu gian lận, lợi dụng các Chính Sách, hỗ trợ của Shopee;\nf. Người Mua/Người Bán không tuân theo các hướng dẫn, quy định và khuyến cáo về vận chuyển của Shopee được nêu ra trong Chính Sách Vận Chuyển;\ng. Người dùng vi phạm các Tiêu chuẩn cộng đồng của Shopee. Tham khảo Tiêu chuẩn cộng đồng _TẠI ĐÂY_ ;\nh. Các đơn hàng vi phạm về số lượng và giá trị mua hàng giới hạn theo từng chương trình khuyến mại. Nội dung chi tiết sẽ được thông báo theo từng chương trình;\ni. Hàng hóa không có đầy đủ hóa đơn, chứng từ chứng minh nguồn gốc, xuất xứ hàng hóa theo quy định của pháp luật;\nj. Các loại hàng hóa không hỗ trợ vận chuyển khác theo thông báo của Shopee trong từng thờ",
  },
  {
    id: "kb_legal_shipping_004",
    docId: "legal_shipping",
    index: 4,
    section: "1. Quy định về các loại hàng hóa không hỗ trợ vận chuyển trên S…",
    tokens: 235,
    charCount: 800,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "i điểm. 1.2. Miễn trừ trách nhiệm cho Shopee và các bên có liên quan: Với các mặt hàng thuộc danh mục Shopee không hỗ trợ vận chuyển kể trên, Shopee cũng như các…",
    content:
      "háp luật;\nj. Các loại hàng hóa không hỗ trợ vận chuyển khác theo thông báo của Shopee trong từng thời điểm.\n1.2. Miễn trừ trách nhiệm cho Shopee và các bên có liên quan: Với các mặt hàng thuộc danh mục Shopee không hỗ trợ vận chuyển kể trên, Shopee cũng như các bên có liên quan trong quá trình vận chuyển hàng hóa sẽ không chịu trách nhiệm nếu hàng hóa bị thu giữ, tiêu hủy hay hư hỏng, mất mát trong quá trình vận chuyển. Người Bán chịu hoàn toàn trách nhiệm trước Shopee và pháp luật (nếu có) khi gửi hàng vi phạm Chính Sách Vận Chuyển của Shopee và pháp luật Việt Nam.\n1.3. Trong trường hợp Người Bán cố tình vi phạm các quy định về hàng hóa không hỗ trợ vận chuyển trên Sàn Shopee, Người Bán phải bồi thường đầy đủ và toàn bộ các thiệt hại phát sinh mà Shopee và/hoặc các bên có liên Quan trong ",
  },
  {
    id: "kb_legal_shipping_005",
    docId: "legal_shipping",
    index: 5,
    section: "1. Quy định về các loại hàng hóa không hỗ trợ vận chuyển trên S…",
    tokens: 235,
    charCount: 800,
    charStart: 3500,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "quá trình vận chuyển phải gánh chịu. _2. Quy định về các loại hàng hóa vận chuyển có điều kiện_ Nhóm hàng hóa đặc biệt sau đây chỉ được chấp nhận vận chuyển với…",
    content:
      "i bồi thường đầy đủ và toàn bộ các thiệt hại phát sinh mà Shopee và/hoặc các bên có liên Quan trong quá trình vận chuyển phải gánh chịu.\n\n_2. Quy định về các loại hàng hóa vận chuyển có điều kiện_\n\nNhóm hàng hóa đặc biệt sau đây chỉ được chấp nhận vận chuyển với điều kiện bắt buộc:\na. Các sản phẩm cây cảnh i. Người Bán chỉ được hỗ trợ kênh vận chuyển Hỏa Tốc và Nhanh.\nii. Do đặc tính của sản phẩm thuộc nhóm này, đơn vị vận chuyển chỉ hỗ trợ khi sản phẩm được đóng gói đúng quy cách nhưng Người Bán sẽ hoàn toàn chịu trách nhiệm nếu có hư hỏng, tổn thất khi vận chuyển.\nShopee được miễn trừ mọi trách nhiệm, và sẽ không giải quyết bất kỳ khiếu nại, yêu cầu bồi thường nào phát sinh.\niii. Xem chi tiết hướng dẫn đối với nhóm mặt hàng này _TẠI ĐÂY_.\nb. Thực phẩm tươi sống hoặc hàng hóa còn hạn sử d",
  },

  // ---- news_payment_methods ----
  {
    id: "kb_news_payment_methods_000",
    docId: "news_payment_methods",
    index: 0,
    section: "[Thành viên mới] Shopee hiện đang có những phương thức thanh to…",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Thành viên mới] Shopee hiện đang có những phương thức thanh toán nào? ## [Thành viên mới] Shopee hiện đang có những phương thức thanh toán nào? Hiện nay Shopee…",
    content:
      "# [Thành viên mới] Shopee hiện đang có những phương thức thanh toán nào?\n\n## [Thành viên mới] Shopee hiện đang có những phương thức thanh toán nào?\n\nHiện nay Shopee Việt Nam đang hỗ trợ 09 hình thức thanh toán, bao gồm:\n\n1. Ví ShopeePay\n\n2. Thẻ Tín dụng/Ghi nợ\n\n3. Trả góp bằng Thẻ tín dụng\n\n4. Thanh toán QR\n\n5. Ứng dụng ngân hàng\n\n6. Thẻ nội địa NAPAS\n\n7. Apple Pay\n\n8. Google Pay\n\n9. Thanh toán khi nhận hàng (COD)\n\n10. SPayLater\n\n1. Ví ShopeePay\n\nVí ShopeePay là một ví điện tử được tích hợp bên trong Ứng dụng Shopee Sau khi đã thiết lập thành côngtài khoản Ví ShopeePay và tiến hànhnạp đủ số dư, bạn có thểsử dụng Ví ShopeePay để thanh toán khi mua sắm trực tuyến, cũng như khi mua sắm trực tiếp tại các cửa hàng chấp nhận thanh toán\n\n2. Thẻ Tín dụng/Ghi nợ\n\nBạn có thể sử dụng Thẻ tín dụng hoặ",
  },
  {
    id: "kb_news_payment_methods_001",
    docId: "news_payment_methods",
    index: 1,
    section: "2. Thẻ Tín dụng/Ghi nợ",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "c Thẻ ghi nợ thuộc các hệ thống thẻ Visa, thẻ Mastercard, thẻ JCB, và thẻ American Express (AMEX)khi thanh toán đơn hàng trên Shopee ⚠️Lưu ý:chỉ áp dụng cho đơn…",
    content:
      "p tại các cửa hàng chấp nhận thanh toán\n\n2. Thẻ Tín dụng/Ghi nợ\n\nBạn có thể sử dụng Thẻ tín dụng hoặc Thẻ ghi nợ thuộc các hệ thống thẻ Visa, thẻ Mastercard, thẻ JCB, và thẻ American Express (AMEX)khi thanh toán đơn hàng trên Shopee ⚠️Lưu ý:chỉ áp dụng cho đơn hàng có giá trị thanh toán (bao gồm phí vận chuyển và các chi phí phát sinh khác) từ 10.000 VNĐ trở lên\n\n3. Trả góp bằng Thẻ tín dụng\n\nBên cạnh hình thức thanh toán toàn bộ giá trị đơn hàng, Shopee cũng hỗ trợ khách hàngthanh toán thông qua hình thức trả góp khi sử dụng tính năng thanh toán bằng Thẻ tín dụng ⚠️Lưu ý: Phương thức Trả góp bằng Thẻ tín dụng KHÔNG áp dụng cho đơn hàng Quốc tế\n\n4. Thanh toán QR\n\nLà hình thức thanh toán cho phép Người mua thanh toán bằng dịch vụ ngân hàng trực tuyến (internet banking) Và chỉ áp dụng cho đơ",
  },
  {
    id: "kb_news_payment_methods_002",
    docId: "news_payment_methods",
    index: 2,
    section: "4. Thanh toán QR",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "n hàng có giá trị thanh toán cuối cùng (gồm phí vận chuyển và các chi phí phát sinh khác) từ 10.000 VNĐ trở lên (*)(*) đơn hàng không bao gồm các sản phẩm thuộc…",
    content:
      "phép Người mua thanh toán bằng dịch vụ ngân hàng trực tuyến (internet banking) Và chỉ áp dụng cho đơn hàng có giá trị thanh toán cuối cùng (gồm phí vận chuyển và các chi phí phát sinh khác) từ 10.000 VNĐ trở lên (*)(*) đơn hàng không bao gồm các sản phẩm thuộc nhóm Nạp thẻ & Dịch vụ\n\n5. Ứng dụng ngân hàng\n\nLà hình thức thanh toán cho phép bạn hoàn tất giao dịch bằng cách chuyển hướng trực tiếp từ ứng dụng mua hàng Shopee sang ứng dụng của Ngân hàng đã cài đặt trên điện thoại Hình thức này nhanh chóng, bảo mật cao và chỉ áp dụng cho một số Người bán hoặc Ngân hàng có hỗ trợ liên kết Chi tiết tại bài viết [[Thanh toán Ứng dụng Ngân hàng] Các câu hỏi thường gặp ](https://help.shopee.vn/portal/4/article/200848?previousPage=other%20articles)\n\n6. Thẻ nội địa NAPAS\n\nBạn có thể sử dụng thẻ nội địa",
  },
  {
    id: "kb_news_payment_methods_003",
    docId: "news_payment_methods",
    index: 3,
    section: "6. Thẻ nội địa NAPAS",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "NAPAS có đăng ký dịch vụ Internet Banking để thanh toán các đơn hàng. Xemhướng dẫn thanh toán đơn hàng bằng thẻ nội địa NAPAS ⚠️Lưu ý: Chỉ áp dụng cho đơn hàng có…",
    content:
      "/article/200848?previousPage=other%20articles)\n\n6. Thẻ nội địa NAPAS\n\nBạn có thể sử dụng thẻ nội địa NAPAS có đăng ký dịch vụ Internet Banking để thanh toán các đơn hàng. Xemhướng dẫn thanh toán đơn hàng bằng thẻ nội địa NAPAS ⚠️Lưu ý: Chỉ áp dụng cho đơn hàng có giá trị thanh toán cuối cùng (gồm phí vận chuyển và các chi phí phát sinh khác) từ 10.000 VNĐ trở lên (*) (*) đơn hàng không bao gồm các sản phẩm thuộc nhóm Nạp thẻ & Dịch vụ Xem thêm: Danh sách các ngân hàng phát hành Thẻ nội địa NapasTẠI ĐÂY\n\n7. Apple Pay\n\nBạn có thể sử dụng Apple Pay để thanh toán đơn hàng khi mua sắm trên ứng dụng Shopee. Để lựa chọn/sử dụng được hình thức thanh toán này, đơn hàng phải có giá trị thanh toán cuối cùng (đã bao gồm phí vận chuyển và các chi phí phát sinh khác - nếu có) từ 10.000 VNĐ đến 25.000.00",
  },
  {
    id: "kb_news_payment_methods_004",
    docId: "news_payment_methods",
    index: 4,
    section: "7. Apple Pay",
    tokens: 235,
    charCount: 800,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "0 VNĐ ⚠️Lưu ý: * Phương thức thanh toán Apple Pay chỉ được hỗ trợ trên một số thiết bị theo quy định của Apple. Trên các thiết bị này, bạn cần thiết lập Apple Pay…",
    content:
      " cùng (đã bao gồm phí vận chuyển và các chi phí phát sinh khác - nếu có) từ 10.000 VNĐ đến 25.000.000 VNĐ ⚠️Lưu ý:\n* Phương thức thanh toán Apple Pay chỉ được hỗ trợ trên một số thiết bị theo quy định của Apple. Trên các thiết bị này, bạn cần thiết lập Apple Pay bằng cách thêm thẻ tín dụng/thẻ ghi nợ vào ứng dụng Ví (Wallet) để hoàn tất thiết lập thanh toán. Bạn có thể xem hướng dẫn Thiết lập Apple PayTẠI ĐÂY\n* Phương thức thanh toán Apple Pay KHÔNG áp dụng cho các đơn hàng sau:\n* Đơn hàng có sản phẩm thuộc nhóm Nạp thẻ & Dịch vụ\n* * Đơn hàng có phương thức vận chuyển “Người bán tự vận chuyển” hoặc “Seller Own Fleet - Vận chuyển quốc tế”\n* * Đơn hàng ShopeeFood\n\n8. Google Pay\n\nGoogle Pay (Google Wallet) là phương thức thanh toán cho đơn hàng mua trên ứng dụng Shopee, được hỗ trợ trên một s",
  },
  {
    id: "kb_news_payment_methods_005",
    docId: "news_payment_methods",
    index: 5,
    section: "8. Google Pay",
    tokens: 235,
    charCount: 800,
    charStart: 3500,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ố thiết bị sử dụng hệ điều hành Android tương thích (xem chi tiếttại đây). Để sử dụng được hình thức thanh toán này khi mua sắm trên ứng dụng Shopee, đơn hàng phải…",
    content:
      "ogle Wallet) là phương thức thanh toán cho đơn hàng mua trên ứng dụng Shopee, được hỗ trợ trên một số thiết bị sử dụng hệ điều hành Android tương thích (xem chi tiếttại đây). Để sử dụng được hình thức thanh toán này khi mua sắm trên ứng dụng Shopee, đơn hàng phải có giá trị thanh toán cuối cùng (đã bao gồm phí vận chuyển và các chi phí phát sinh khác - nếu có) từ 10.000 VNĐ đến 120.000.000 VNĐ.\n⚠️Lưu ý:\n* Để sử dụng phương thức thanh toán này, bạn cần tải về ứng dụng Google Pay (Google Wallet) trên Play Store (Cửa hàng Play), sau đó hoàn tất thiết lập Google Pay bằng cách thêm thẻ ghi nợ hoặc thẻ tín dụng vào ứng dụng. Bạn có thể xem hướng dẫn chi tiết cách thiết lậptại đây\n* Phương thức thanh toán Google Pay KHÔNG áp dụng cho đơn hàng bao gồm các sản phẩm thuộc nhóm Nạp thẻ & Dịch vụ, đơn",
  },

  // ---- news_qr_payment ----
  {
    id: "kb_news_qr_payment_000",
    docId: "news_qr_payment",
    index: 0,
    section: "[Thanh toán] Làm thế nào để thanh toán bằng phương thức Thanh t…",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Thanh toán] Làm thế nào để thanh toán bằng phương thức Thanh toán QR ## [Thanh toán] Làm thế nào để thanh toán bằng phương thức Thanh toán QR ## Thanh toán bằng…",
    content:
      "# [Thanh toán] Làm thế nào để thanh toán bằng phương thức Thanh toán QR\n\n## [Thanh toán] Làm thế nào để thanh toán bằng phương thức Thanh toán QR\n\n## Thanh toán bằng phương thức Thanh toán QR, hay còn gọi là Chuyển khoản ngân hàng bằng mã QR chỉ áp dụng cho đơn hàng có giá trị thanh toán cuối cùng (gồm phí vận chuyển và các chi phí phát sinh khác) từ 10.000 VNĐ trở lên (*). Và chỉ áp dụng cho một số Người bán nhất định\n\n## (*) đơn hàng không bao gồm các sản phẩm thuộc nhóm Nạp thẻ & Dịch vụ\n\n## Để thanh toán bằng phương thức Thanh toán QR trên Shopee, bạn hãy làm theo các bước như sau:\n\n## Bước 1: Tại trang Thanh toán > Chọn phương thức Thanh toán QR > Đặt hàng\n\n## Bước 2: Chọn Lưu mã QR hiển thị trên màn hình\n\n## Bước 3: Truy cập Ứng dụng Ngân hàng di động/Ví điện tử > Chọn chức năng Quét",
  },
  {
    id: "kb_news_qr_payment_001",
    docId: "news_qr_payment",
    index: 1,
    section: "Bước 4: Chọn ảnh mã QR thanh toán đã lưu",
    tokens: 230,
    charCount: 781,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 0,
    excerpt:
      "ảnh QR ## Bước 4: Chọn ảnh mã QR thanh toán đã lưu Bước 5: Kiểm tra thông tin số tài khoản, số tiền và nhấn rồi hoàn tất thanh toán ⚠️Lưu ý: * Số tiền chuyển khoản…",
    content:
      "n thị trên màn hình\n\n## Bước 3: Truy cập Ứng dụng Ngân hàng di động/Ví điện tử > Chọn chức năng Quét ảnh QR\n\n## Bước 4: Chọn ảnh mã QR thanh toán đã lưu\n\nBước 5: Kiểm tra thông tin số tài khoản, số tiền và nhấn rồi hoàn tất thanh toán ⚠️Lưu ý:\n* Số tiền chuyển khoản phải bằng Tổng Thanh Toán được hiển thị trên Trang Thông Tin Thanh Toán\n* KHÔNG thanh toán cộng dồn, mỗi hóa đơn là một giao dịch chuyển khoản duy nhất\n* Thời gian cập nhật trạng thái đơn hàng thành công từ 1-3 ngày làm việc tính từ thời điểm Người mua đã chuyển khoản thanh toán thành công cho đơn hàng\n* Trường hợp bạn thanh toán một lần cho nhiều đơn hàng, hệ thống sẽ ghi nhận thanh toán KHÔNG thành công và số tiền sẽ được hoàn về tài khoản thanh toán\n* Phí giao dịch chuyển tiền sẽ do Người mua trả (nếu có).",
  },

  // ---- news_order_tracking ----
  {
    id: "kb_news_order_tracking_000",
    docId: "news_order_tracking",
    index: 0,
    section: "[Thành viên mới] Cách theo dõi tình trạng vận chuyển của đơn hà…",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Thành viên mới] Cách theo dõi tình trạng vận chuyển của đơn hàng? ## [Thành viên mới] Cách theo dõi tình trạng vận chuyển của đơn hàng? Hướng dẫn theo dõi áp…",
    content:
      "# [Thành viên mới] Cách theo dõi tình trạng vận chuyển của đơn hàng?\n\n## [Thành viên mới] Cách theo dõi tình trạng vận chuyển của đơn hàng?\n\nHướng dẫn theo dõi áp dụng cho**tất cả đơn hàng** (bao gồm đơn hàng trong nước và đơn hàng quốc tế)\n\n**1. Xem Người bán đã gửi hàng cho đơn vị vận chuyển hay chưa**\n\n* Vào mục **Tôi** > **Chờ lấy hàng** > Chọn đơn hàng cần kiểm tra (hoặc thông tin được hiển thị phía dưới đơn hàng)\n\n**2. Kiểm tra tình trạng giao hàng**\n\n* Tại mục **Tôi** > **Đang giao** > Chọn đơn hàng cần kiểm tra > Thông tin trạng thái đơn hàng sẽ được cập nhật tại đây\n**⚠️**** _Lưu ý:_**\n* Shopee chưa hỗ trợ giao hàng theo giờ cụ thể\n* Shopee chưa hỗ trợ cung cấp số điện thoại của shipper/nhân viên giao hàng\n\n**3. Kiểm tra chi tiết tình trạng đơn hàng**\n\n**Bước 1:** Vào mục **Tôi** ",
  },
  {
    id: "kb_news_order_tracking_001",
    docId: "news_order_tracking",
    index: 1,
    section: "3. Kiểm tra chi tiết tình trạng đơn hàng",
    tokens: 200,
    charCount: 681,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 0,
    excerpt:
      "> **Đơn mua** > Chọn đơn hàng cần kiểm **Bước 2:** Kiểm tra tình trạng tại mục **Thông tin vận chuyển** **4. Tra cứu bằng mã vận đơn trên trang đơn vị vận chuyển**…",
    content:
      "pper/nhân viên giao hàng\n\n**3. Kiểm tra chi tiết tình trạng đơn hàng**\n\n**Bước 1:** Vào mục **Tôi** > **Đơn mua** > Chọn đơn hàng cần kiểm\n**Bước 2:** Kiểm tra tình trạng tại mục **Thông tin vận chuyển**\n\n**4. Tra cứu bằng mã vận đơn trên trang đơn vị vận chuyển**\n\nDùng Mã vận đơn để tiến hành tra cứu trên trang web của đơn vị vận chuyển\n**Riêng đối với đơn hàng Quốc tế, bạn có thể xem chi tiết hướng dẫn tại đây**\n\n**5. Theo dõi tại mục \"Trò chuyện với Shopee\"**\n\nNhằm giúp Người mua dễ dàng tra cứu thông tin đơn hàng của mình, khi sử dụng mục \"Trò chuyện với Shopee\", bạn có thể kiểm tra bằng cách sau đây.\n**Xem Thêm:** Tôi Muốn Đổi Địa Chỉ/Thông tin/Số Điện Thoại Nhận Hàng",
  },

  // ---- news_refund_evidence ----
  {
    id: "kb_news_refund_evidence_000",
    docId: "news_refund_evidence",
    index: 0,
    section: "[Trả hàng/Hoàn tiền] Hướng dẫn chuẩn bị bằng chứng khi yêu cầu…",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Trả hàng/Hoàn tiền] Hướng dẫn chuẩn bị bằng chứng khi yêu cầu Trả hàng/ Hoàn tiền ## [Trả hàng/Hoàn tiền] Hướng dẫn chuẩn bị bằng chứng khi yêu cầu Trả hàng/…",
    content:
      "# [Trả hàng/Hoàn tiền] Hướng dẫn chuẩn bị bằng chứng khi yêu cầu Trả hàng/ Hoàn tiền\n\n## [Trả hàng/Hoàn tiền] Hướng dẫn chuẩn bị bằng chứng khi yêu cầu Trả hàng/ Hoàn tiền\n\nKhi bạn cần gửi yêu cầu Trả hàng/Hoàn tiền trên Shopee, việc cung cấp đầy đủ và chính xác bằng chứng là rất quan trọng để đảm bảo yêu cầu của bạn được xử lý nhanh chóng. Tùy thuộc vào từng trường hợp, loại bằng chứng bạn cần chuẩn bị sẽ khác nhau.\n\n### 1. Khiếu nại chưa nhận được hàng\n\nNếu bạn chưa nhận được hàng, bạn không cần cung cấp bất kỳ bằng chứng nào. Shopee sẽ tự động xử lý yêu cầu dựa trên hệ thống theo dõi đơn hàng.\n\n### 2. Đã nhận được hàng, khiếu nại hàng có vấn đề (bể vỡ, sai mẫu, hàng lỗi, khác mô tả,...)\n\nTrong các trường hợp đã nhận hàng nhưng gặp vấn đề, Shopee khuyến khích bạn chuẩn bị bằng chứng là v",
  },
  {
    id: "kb_news_refund_evidence_001",
    docId: "news_refund_evidence",
    index: 1,
    section: "2. Đã nhận được hàng, khiếu nại hàng có vấn đề (bể vỡ, sai mẫu,…",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ideo mở kiện hàng. Video này sẽ là bằng chứng mạnh nhất để giải quyết khiếu nại của bạn. Video cần đảm bảo các yếu tố sau: * Quay xuyên suốt, liên tục, không bị cắt…",
    content:
      "Trong các trường hợp đã nhận hàng nhưng gặp vấn đề, Shopee khuyến khích bạn chuẩn bị bằng chứng là video mở kiện hàng. Video này sẽ là bằng chứng mạnh nhất để giải quyết khiếu nại của bạn.\nVideo cần đảm bảo các yếu tố sau:\n* Quay xuyên suốt, liên tục, không bị cắt ghép.\n* Góc quay rõ ràng, không bị khuất.\n* Chất lượng video tốt, không bị mờ nhòe.\n* Thể hiện rõ các thông tin sau:\n* Tình trạng kiện hàng: Quay 6 mặt của kiện hàng để chứng minh tình trạng khi bạn nhận được.\n* Quá trình mở kiện: Thấy rõ mã vận đơn trên kiện hàng, khớp với thông tin đơn hàng của bạn.\n* Tình trạng sản phẩm: Quay cận cảnh số lượng và tình trạng sản phẩm bên trong, đặc biệt là các niêm phong, tem nhãn (nếu có).\n⚠️Lưu ý: Khi bạn cần gửi trả sản phẩm, Shopee khuyến khích bạn quay lại video đóng kiện hàng hoàn trả. Vi",
  },
  {
    id: "kb_news_refund_evidence_002",
    docId: "news_refund_evidence",
    index: 2,
    section: "2. Đã nhận được hàng, khiếu nại hàng có vấn đề (bể vỡ, sai mẫu,…",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "deo này cũng cần đáp ứng các tiêu chí tương tự video mở hàng (quay xuyên suốt, rõ nét) và thể hiện rõ tình trạng sản phẩm (niêm phong, tem nhãn) và quá trình đóng…",
    content:
      " ý: Khi bạn cần gửi trả sản phẩm, Shopee khuyến khích bạn quay lại video đóng kiện hàng hoàn trả. Video này cũng cần đáp ứng các tiêu chí tương tự video mở hàng (quay xuyên suốt, rõ nét) và thể hiện rõ tình trạng sản phẩm (niêm phong, tem nhãn) và quá trình đóng gói\n\n### 3. Khiếu nại hàng giả/nhái\n\nĐối với trường hợp đặc biệt này, bạn cần chuẩn bị thêm bằng chứng chứng minh sản phẩm nhận được là hàng giả/nhái.\nDưới đây là một số ví dụ về bằng chứng bạn có thể cung cấp:\n| Loại bằng chứng | Cách thực hiện |\n| Quét mã QR/ Kiểm tra số seri | Quay video quét mã QR, kiểm tra số seri trên trang web của hãng để chứng minh sản phẩm không phải hàng thật. |\n| So sánh sản phẩm | Chụp ảnh/quay video so sánh sự khác biệt giữa sản phẩm thực nhận và sản phẩm chính hãng (màu sắc, chất liệu, tem nhãn, logo,",
  },
  {
    id: "kb_news_refund_evidence_003",
    docId: "news_refund_evidence",
    index: 3,
    section: "3. Khiếu nại hàng giả/nhái",
    tokens: 235,
    charCount: 800,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "mã sản phẩm). | | Bao bì sản phẩm | Chụp ảnh/quay video cho thấy sự sai khác của bao bì sản phẩm thực nhận so với bao bì chính hãng. | ### 4. Quy định về bằng chứng…",
    content:
      "ánh sự khác biệt giữa sản phẩm thực nhận và sản phẩm chính hãng (màu sắc, chất liệu, tem nhãn, logo, mã sản phẩm). |\n| Bao bì sản phẩm | Chụp ảnh/quay video cho thấy sự sai khác của bao bì sản phẩm thực nhận so với bao bì chính hãng. |\n\n### 4. Quy định về bằng chứng\n\nĐể yêu cầu của bạn được xử lý hiệu quả, hãy lưu ý các quy định sau về bằng chứng:\n* Dung lượng tối đa:\n* Hình ảnh: Không quá 5MB/ảnh.\n* Video: Không quá 100 MB/video (tối đa 1 phút).\n* Tải lên bằng chứng có dung lượng lớn: Nếu video/hình ảnh của bạn có dung lượng lớn hơn quy định, hãy tải lên YouTube hoặc Google Drive (để ở chế độ công khai) rồi gửi đường dẫn trong phần chú thích khi gửi yêu cầu.\n* Chất lượng: Bằng chứng phải rõ nét, không mờ nhòe.\n* Chi tiết: Chụp/quay cận cảnh lỗi hoặc điểm bất thường của sản phẩm.\n* Bằng ch",
  },
  {
    id: "kb_news_refund_evidence_004",
    docId: "news_refund_evidence",
    index: 4,
    section: "4. Quy định về bằng chứng",
    tokens: 151,
    charCount: 515,
    charStart: 2800,
    overlapPrev: 100,
    overlapNext: 0,
    excerpt:
      "ứng bổ sung: Nếu có, bạn có thể cung cấp thêm lịch sử chat với người bán hoặc các bằng chứng khác để Shopee có thêm thông tin xử lý. Nếu Shopee cần thêm bằng chứng…",
    content:
      " nét, không mờ nhòe.\n* Chi tiết: Chụp/quay cận cảnh lỗi hoặc điểm bất thường của sản phẩm.\n* Bằng chứng bổ sung: Nếu có, bạn có thể cung cấp thêm lịch sử chat với người bán hoặc các bằng chứng khác để Shopee có thêm thông tin xử lý.\nNếu Shopee cần thêm bằng chứng khác, bạn sẽ nhận được thông báo trong mục Thông báo > Cập nhật đơn hàng. Bạn cần bổ sung bằng chứng trong vòng 24 giờ. Sau thời gian này, Shopee sẽ chỉ xem xét dựa trên các bằng chứng đã có.\n\n5. Một số ví dụ minh họa về bằng chứng cần cung cấp\n\n!\n!\n!",
  },

  // ---- news_refund_request ----
  {
    id: "kb_news_refund_request_000",
    docId: "news_refund_request",
    index: 0,
    section: "[Trả hàng/ Hoàn tiền] Hướng dẫn gửi yêu cầu Trả hàng/ Hoàn tiền",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Trả hàng/ Hoàn tiền] Hướng dẫn gửi yêu cầu Trả hàng/ Hoàn tiền ## [Trả hàng/ Hoàn tiền] Hướng dẫn gửi yêu cầu Trả hàng/ Hoàn tiền ### 1. Hướng dẫn gửi yêu cầu…",
    content:
      "# [Trả hàng/ Hoàn tiền] Hướng dẫn gửi yêu cầu Trả hàng/ Hoàn tiền\n\n## [Trả hàng/ Hoàn tiền] Hướng dẫn gửi yêu cầu Trả hàng/ Hoàn tiền\n\n### 1. Hướng dẫn gửi yêu cầu Trả hàng/Hoàn tiền\n\nKhi cần yêu cầu trả hàng hoặc hoàn tiền trên Shopee, bạn có thể thực hiện theo một trong hai cách sau.\nCách 1: Gửi yêu cầu trực tiếp tại trang đơn hàng\n* Bước 1: Mở ứng dụng Shopee, vào mục Tôi> chọn thẻ Chờ giao hàng/Đã giao\n* Bước 2:Tại đơn hàng bạn cần xử lý, bấm Trả hàng/Hoàn tiền.\n* Bước 3: Chọn tình huống bạn đang gặp\n* * \"Tôi đã nhận hàng nhưng hàng có vấn đề (bể vỡ, sai mẫu, hàng lỗi, khác mô tả,...) - Miễn ship hoàn về \": Dành cho trường hợp sản phẩm bị lỗi, thiếu, hoặc không đúng mô tả.\n* * \"Tôi chưa nhận hàng/nhận thiếu hàng\": Dành cho trường hợp bạn chưa nhận được hàng hoặc bị thiếu sản phẩm tro",
  },
  {
    id: "kb_news_refund_request_001",
    docId: "news_refund_request",
    index: 1,
    section: "1. Hướng dẫn gửi yêu cầu Trả hàng/Hoàn tiền",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ng đơn. * Bước 4:Chọn sản phẩm cần khiếu nại (trong trường hợp đơn hàng chỉ có 1 sản phẩm, bạn không cần chọn ở bước này) * Bước 5: Chọn lý do khiếu nại * Bước 6…",
    content:
      "a nhận hàng/nhận thiếu hàng\": Dành cho trường hợp bạn chưa nhận được hàng hoặc bị thiếu sản phẩm trong đơn.\n* Bước 4:Chọn sản phẩm cần khiếu nại (trong trường hợp đơn hàng chỉ có 1 sản phẩm, bạn không cần chọn ở bước này)\n* Bước 5: Chọn lý do khiếu nại\n* Bước 6: Chọn phương án trả hàng/ hoàn tiền (nếu bạn chọn lý do khiếu nại Thiếu hàng)\n* Bước 7:Điền các thông tin cần thiết vào biểu mẫu, bao gồm:\n* * Chú thích thêm tình trạng hàng hóa tại mục Mô tả.\n* Bằng chứng thể hiện tình trạng sản phẩm (hình ảnh sản phẩm, video mở hộp,...)\n* Email liên hệ.\n* Bước 8:Chọn Gửi yêu cầu để hoàn tất Cách 2: Gửi yêu cầu tại mục Trò Chuyện Với Shopee\n* Bước 1:Tại trang chủ Shopee, vào mục Tôi > chọn Trò Chuyện Với Shopee.\n* Bước 2:Chọn Khiếu nại trả hàng hoàn tiền.\n* Bước 3:Chọn đơn hàng bạn cần gửi yêu cầu.",
  },
  {
    id: "kb_news_refund_request_002",
    docId: "news_refund_request",
    index: 2,
    section: "1. Hướng dẫn gửi yêu cầu Trả hàng/Hoàn tiền",
    tokens: 235,
    charCount: 800,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "* Bước 4: Xác nhận và gửi yêu cầu * * Xác nhận bạn Đã nhận hoặc Chưa nhận hàng. * Chọn lý do gửi yêu cầu. * Tải lên bằng chứng (ảnh/video). * Nhấn Gửi yêu cầu. 2…",
    content:
      " Với Shopee.\n* Bước 2:Chọn Khiếu nại trả hàng hoàn tiền.\n* Bước 3:Chọn đơn hàng bạn cần gửi yêu cầu.\n* Bước 4: Xác nhận và gửi yêu cầu\n* * Xác nhận bạn Đã nhận hoặc Chưa nhận hàng.\n* Chọn lý do gửi yêu cầu.\n* Tải lên bằng chứng (ảnh/video).\n* Nhấn Gửi yêu cầu.\n\n2. Lưu ý\n\n| Thời gian xử lý | Yêu cầu của bạn thường được xử lý trong khoảng 3 - 5 ngày làm việc. |\n| Kết quả xử lý | Shopee sẽ thông báo kết quả qua mục Thông báo > Cập nhật đơn hàng và/hoặc Email của bạn. |\n| Thời gian hoàn tiền | Nếu yêu cầu được chấp nhận, tiền sẽ được hoàn trong 1 - 14 ngày làm việc, tùy thuộc vào phương thức thanh toán. Để tìm hiểu thêm về thời gian hoàn tiền theo từng phương thức, vui lòng truy cập [[Trả hàng/Hoàn tiền] Thời gian nhận tiền hoàn và cách kiểm tra tiền hoàn](https://help.shopee.vn/portal/4/artic",
  },
  {
    id: "kb_news_refund_request_003",
    docId: "news_refund_request",
    index: 3,
    section: "2. Lưu ý",
    tokens: 93,
    charCount: 317,
    charStart: 2100,
    overlapPrev: 100,
    overlapNext: 0,
    excerpt:
      "le/189473?previousPage=other%20articles) | | Trường hợp Trả lại & Hoàn tiền | Bạn cần trả lại sản phẩm bằng cách yêu cầu bưu tá đến lấy hoặc tự ra bưu cục gửi. Sản…",
    content:
      "oàn tiền] Thời gian nhận tiền hoàn và cách kiểm tra tiền hoàn](https://help.shopee.vn/portal/4/article/189473?previousPage=other%20articles) |\n| Trường hợp Trả lại & Hoàn tiền | Bạn cần trả lại sản phẩm bằng cách yêu cầu bưu tá đến lấy hoặc tự ra bưu cục gửi. Sản phẩm sẽ được Người bán/Shopee xem xét khi nhận lại. |",
  },

  // ---- news_refund_tracking ----
  {
    id: "kb_news_refund_tracking_000",
    docId: "news_refund_tracking",
    index: 0,
    section: "[Trả hàng/ Hoàn tiền] Theo dõi tình trạng Trả hàng/ Hoàn tiền t…",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Trả hàng/ Hoàn tiền] Theo dõi tình trạng Trả hàng/ Hoàn tiền trên Shopee ## [Trả hàng/ Hoàn tiền] Theo dõi tình trạng Trả hàng/ Hoàn tiền trên Shopee ## Tất cả…",
    content:
      "# [Trả hàng/ Hoàn tiền] Theo dõi tình trạng Trả hàng/ Hoàn tiền trên Shopee\n\n## [Trả hàng/ Hoàn tiền] Theo dõi tình trạng Trả hàng/ Hoàn tiền trên Shopee\n\n## Tất cả các thông tin/trạng thái xử lý Trả hàng hoàn tiền của bạn sẽ được Shopee cập nhật và thông báo qua các hình thức:\n\n1. Trên ứng dụng Shopee\n\n1.1. Mục Trả hàng/Hoàn tiền\n\nThực hiện theo các bước:\n* Bước 1: Vào mục Tôi > Đơn Mua\n* Bước 2: Vào ô Trả hàng (rìa phải màn hình) Chọn mục Trả hàng/ Hoàn tiền (phía bên phải màn hình)\n* Bước 3: Chọn sản phẩm bạn muốn theo dõi tình trạng > Bấm Chi Tiết Trả Hàng/Hoàn Tiền\n* Bước 4: Xem thông tin và tình trạng xử lý yêu cầu Trả hàng/Hoàn tiền của bạn ở phía trên màn hình\n\n1.2. Mục Thông báo trên Ứng dụng Shopee :\n\nVào mục Thông báo > Tình trạng sẽ được hiển thị ở mục Cập nhật Đơn hàng\n\n2. Ngo",
  },
  {
    id: "kb_news_refund_tracking_001",
    docId: "news_refund_tracking",
    index: 1,
    section: "2.1. Biểu ngữ thông báo trên điện thoại",
    tokens: 184,
    charCount: 625,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 0,
    excerpt:
      "ài ứng dụng Shopee 2.1. Biểu ngữ thông báo trên điện thoại ## *Chọn Cho phép ứng dụng Shopee gửi thông báo để không bỏ lỡ thông tin nhé 2.2 Email ! *Cập nhật…",
    content:
      "n Ứng dụng Shopee :\n\nVào mục Thông báo > Tình trạng sẽ được hiển thị ở mục Cập nhật Đơn hàng\n\n2. Ngoài ứng dụng Shopee\n\n2.1. Biểu ngữ thông báo trên điện thoại\n\n## *Chọn Cho phép ứng dụng Shopee gửi thông báo để không bỏ lỡ thông tin nhé\n\n2.2 Email\n\n!\n*Cập nhật ngayEmail liên kết với tài khoản Shopee để theo dõi thông tin.\n\n3. Mục Trò Chuyện Với Shopee\n\nBước 1: Tại trang chủ Shopee, vào mục ‘Tôi’ Bước 2: Chọn ‘Trò Chuyện Với Shopee’ Bước 3: Chọn ‘Kiểm tra yêu cầu trả hàng hoàn tiền của tôi’ Bước 4: Chọn đơn hàng cần xem tình trạng xử lý yêu cầu Bước 5: Chờ Tép Thám Tử trả thông tin 6acb8b5a700d45f3a6854e81a7f79a1a.mp4",
  },

  // ---- news_refund_restrictions ----
  {
    id: "kb_news_refund_restrictions_000",
    docId: "news_refund_restrictions",
    index: 0,
    section: "[Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì?",
    tokens: 235,
    charCount: 800,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 100,
    excerpt:
      "# [Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì? ## [Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì? Sản phẩm hạn chế trả hàng là những sản phẩm có…",
    content:
      "# [Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì?\n\n## [Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì?\n\nSản phẩm hạn chế trả hàng là những sản phẩm có tính đặc thù cao, dễ hư hỏng hoặc cần điều kiện bảo quản nghiêm ngặt. Đối với nhóm sản phẩm này, Shopee không áp dụng lý do trả hàng ‘Hàng nguyên vẹn nhưng không còn nhu cầu’.\nSản phẩm hạn chế trả hàng thuộc các nhóm sản phẩm dưới đây:\n| Danh mục | Sản phẩm hạn chế trả hàng |\n| Nhà cửa & Đời sống | Cây cảnh (cây, hoa,...) |\n| Thực phẩm và đồ uống | - Các sản phẩm thuộc Sữa - trứng (Bột kem béo, Bơ động vật & thực vật, Phô mai & bột phô mai, Kem, Trứng, Đậu phụ)\n- Thực phẩm tươi sống & đông lạnh\n- Đồ ăn chế biến sẵn\n- Các loại bánh (bao gồm Bánh mì, Bánh kem, Bánh ngọt/ pastry và các loại bánh khác theo đánh giá của Shopee tại từ",
  },
  {
    id: "kb_news_refund_restrictions_001",
    docId: "news_refund_restrictions",
    index: 1,
    section: "[Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì?",
    tokens: 235,
    charCount: 800,
    charStart: 700,
    overlapPrev: 100,
    overlapNext: 100,
    excerpt:
      "ng thời điểm) | | Sức khỏe | - Găng tay & khẩu trang y tế | | Voucher & Dịch vụ | Tất cả các loại sản phẩm trong danh mục này | | Thể thao & Dã ngoại | - Áo Lót Thể…",
    content:
      " (bao gồm Bánh mì, Bánh kem, Bánh ngọt/ pastry và các loại bánh khác theo đánh giá của Shopee tại từng thời điểm) |\n| Sức khỏe | - Găng tay & khẩu trang y tế |\n| Voucher & Dịch vụ | Tất cả các loại sản phẩm trong danh mục này |\n| Thể thao & Dã ngoại | - Áo Lót Thể Thao\n- Đồ Bơi: không hỗ trợ khi đã mặc thử |\n| Thời trang nam/nữ | - Đồ lót: Quần/áo lót, Đồ lót giữ nhiệt, Phụ kiện đồ lót, Đồ định hình, Đồ lót bảo hộ, Áo liền thân,...: không hỗ trợ khi đã mặc thử\n- Vớ/Tất: Quần tất\n- Đồ Bầu: áo ngực cho con bú, đồ mặc cho con bú |\n| Thời trang trẻ em/trẻ sơ sinh | Đồ lót, Đồ bơi: không hỗ trợ khi đã mặc thử |\n| Mẹ & Bé | Đồ dùng cho con bú: Máy hút sữa & phụ kiện, Miếng lót thấm sữa, Túi trữ sữa,... |\n| Điện thoại & Phụ kiện | Sim |\n| Ô tô - Xe Máy - Xe Đạp | - Nhóm sản phẩm thuộc xe Ô tô, Mô",
  },
  {
    id: "kb_news_refund_restrictions_002",
    docId: "news_refund_restrictions",
    index: 2,
    section: "[Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì?",
    tokens: 139,
    charCount: 472,
    charStart: 1400,
    overlapPrev: 100,
    overlapNext: 0,
    excerpt:
      "tô, xe máy - Dầu & dầu nhờn: Dầu | | Khác | - Một số sản phẩm khác theo từng thời điểm cụ thể dựa trên đánh giá từ Shopee về tính hợp lệ, minh bạch và hiệu quả. -…",
    content:
      "a,... |\n| Điện thoại & Phụ kiện | Sim |\n| Ô tô - Xe Máy - Xe Đạp | - Nhóm sản phẩm thuộc xe Ô tô, Mô tô, xe máy\n- Dầu & dầu nhờn: Dầu |\n| Khác | - Một số sản phẩm khác theo từng thời điểm cụ thể dựa trên đánh giá từ Shopee về tính hợp lệ, minh bạch và hiệu quả.\n- Các thông tin sẽ được ghi chú rõ ràng tại trang chi tiết hoặc hình ảnh sản phẩm hoặc các nội dung đăng tải công khai khác. | Lưu ý: Danh sách này có thể thay đổi tùy từng thời điểm theo quyết định của Shopee.",
  },

  // ---- news_cross_border ----
  {
    id: "kb_news_cross_border_000",
    docId: "news_cross_border",
    index: 0,
    section: "[Đơn hàng Quốc tế] Hướng dẫn theo dõi hành trình đơn hàng Quốc…",
    tokens: 149,
    charCount: 507,
    charStart: 0,
    overlapPrev: 0,
    overlapNext: 0,
    excerpt:
      "# [Đơn hàng Quốc tế] Hướng dẫn theo dõi hành trình đơn hàng Quốc tế đã đặt trên Shopee? ## [Đơn hàng Quốc tế] Hướng dẫn theo dõi hành trình đơn hàng Quốc tế đã đặt…",
    content:
      "# [Đơn hàng Quốc tế] Hướng dẫn theo dõi hành trình đơn hàng Quốc tế đã đặt trên Shopee?\n\n## [Đơn hàng Quốc tế] Hướng dẫn theo dõi hành trình đơn hàng Quốc tế đã đặt trên Shopee?\n\nBạn có thể kiểm tra _trạng thái của đơn hàng Quốc tế_ đã đặt ngay trên Ứng dụng Shopee. Đồng thời dễ dàng theo dõi hành trình vận chuyển theo các bước\n**Bước 1** : Chọn **Tôi** > **Chờ lấy hàng** /**Đang giao** tại mục **Đơn mua**\n**Bước 2:** Bấm vào nội dung thông tin vận chuyển của đơn hàng cần theo dõi hành trình vận chuyển",
  },
];

export const KB_CHUNKS_BY_DOC: Record<string, KbChunk[]> = KB_CHUNKS.reduce<
  Record<string, KbChunk[]>
>((acc, chunk) => {
  (acc[chunk.docId] ??= []).push(chunk);
  return acc;
}, {});

/** Các chunk mẫu của một tài liệu, đã sắp theo thứ tự trong file gốc. */
export function getKbChunks(docId: string): KbChunk[] {
  return KB_CHUNKS_BY_DOC[docId] ?? [];
}

/** Chunk được trích dẫn ở trang Chat, lọc theo tài liệu. */
export function getCitedChunks(docId: string): Chunk[] {
  return CHUNKS.filter((chunk) => chunk.docId === docId);
}
