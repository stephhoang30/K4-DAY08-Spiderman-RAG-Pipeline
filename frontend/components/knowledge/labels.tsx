import type { CustomerRole } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

/**
 * Nhãn tiếng Việt dùng chung cho các khối của trang Kho tri thức.
 * `topic` và `customer_role` lấy nguyên từ metadata của Task 1 / Task 2.
 */
export const ROLE_LABEL: Record<CustomerRole, string> = {
  buyer: "Người mua",
  seller: "Người bán",
  both: "Cả hai",
};

export const TOPIC_LABEL: Record<string, string> = {
  return_refund: "Trả hàng & hoàn tiền",
  privacy: "Bảo mật dữ liệu",
  seller_listing: "Đăng bán sản phẩm",
  prohibited_items: "Hàng cấm & hạn chế",
  shipping: "Vận chuyển",
  payment: "Thanh toán",
  order_tracking: "Theo dõi đơn hàng",
  refund_evidence: "Bằng chứng hoàn tiền",
  refund_request: "Gửi yêu cầu hoàn tiền",
  refund_tracking: "Theo dõi hoàn tiền",
  refund_restrictions: "Hạn chế trả hàng",
  cross_border: "Đơn hàng quốc tế",
};

export function topicLabel(topic: string): string {
  return TOPIC_LABEL[topic] ?? topic;
}

/** Nhãn vai trò khách hàng, màu khác nhau để quét bảng nhanh hơn. */
export function RoleBadge({ role }: { role: CustomerRole }) {
  const tone = role === "buyer" ? "accent" : role === "seller" ? "warn" : "neutral";
  return <Badge tone={tone}>{ROLE_LABEL[role]}</Badge>;
}

/**
 * 144183 -> "144.183". Tự viết thay vì Intl để kết quả render trên server và
 * trên trình duyệt luôn giống hệt nhau (tránh cảnh báo hydration).
 */
export function formatInt(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 144183 -> "144,2K" — dùng cho ô thống kê để số không tràn dòng. */
export function formatCompact(value: number): string {
  if (value < 10_000) return formatInt(value);
  const k = value / 1000;
  return `${k.toFixed(k >= 100 ? 0 : 1).replace(".", ",")}K`;
}

/** "2026-07-28" -> "28/07/2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
