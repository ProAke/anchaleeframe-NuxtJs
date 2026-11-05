export const orderStatusLabels: Record<string, string> = {
  pending: 'รอจัดการ',
  processing: 'กำลังเตรียม',
  shipped: 'กำลังจัดส่ง',
  delivered: 'สำเร็จแล้ว',
  cancelled: 'ยกเลิก',
}
export const shipmentStatusLabels: Record<string, string> = {
  in_transit: 'กำลังจัดส่ง',
  delivered: 'ส่งสำเร็จ',
  returned: 'ตีกลับ',
}
export const paymentStatusLabels: Record<string, string> = {
  unpaid: 'รอชำระ',
  paid: 'ชำระแล้ว',
  refunded: 'คืนเงินแล้ว',
}
export const paymentMethodLabels: Record<string, string> = {
  cod: 'เก็บเงินปลายทาง',
  promptpay_qr: 'PromptPay QR',
  bank_transfer: 'โอนเงินผ่านธนาคาร',
  transfer: 'โอนเงินผ่านธนาคาร',
  other: 'ช่องทางอื่น',
}
export const shippingMethodLabels: Record<string, string> = {
  company_truck: 'รถขนส่งของร้าน',
  private_carrier: 'บริษัทขนส่งเอกชน',
}
