import { propOr } from 'ramda'

const SPECIAL_USE_FLAGS = ['\\All', '\\Archive', '\\Drafts', '\\Flagged', '\\Junk', '\\Sent', '\\Trash']
const SPECIAL_USE_BOXES = {
  '\\Sent': [
    'aika', 'bidaliak', 'bidalita', 'dihantar', 'e rometsweng', 'e tindami', 'elküldött', 'elküldöttek', 'enviadas',
    'enviadas', 'enviados', 'enviats', 'envoyés', 'ethunyelweyo', 'expediate', 'ezipuru', 'gesendete', 'gestuur',
    'gönderilmiş öğeler', 'göndərilənlər', 'iberilen', 'inviati', 'išsiųstieji', 'kuthunyelwe', 'lasa', 'lähetetyt',
    'messages envoyés', 'naipadala', 'nalefa', 'napadala', 'nosūtītās ziņas', 'odeslané', 'padala', 'poslane',
    'poslano', 'poslano', 'poslané', 'poslato', 'saadetud', 'saadetud kirjad', 'sendt', 'sendt', 'sent', 'sent items',
    'sent messages', 'sända poster', 'sänt', 'terkirim', 'ti fi ranṣẹ', 'të dërguara', 'verzonden', 'vilivyotumwa',
    'wysłane', 'đã gửi', 'σταλθέντα', 'жиберилген', 'жіберілгендер', 'изпратени', 'илгээсэн', 'ирсол шуд', 'испратено',
    'надіслані', 'отправленные', 'пасланыя', 'юборилган', 'ուղարկված', 'נשלחו', 'פריטים שנשלחו', 'المرسلة', 'بھیجے گئے',
    'سوزمژہ', 'لېګل شوی', 'موارد ارسال شده', 'पाठविले', 'पाठविलेले', 'प्रेषित', 'भेजा गया', 'প্রেরিত', 'প্রেরিত', 'প্ৰেৰিত', 'ਭੇਜੇ', 'મોકલેલા',
    'ପଠାଗଲା', 'அனுப்பியவை', 'పంపించబడింది', 'ಕಳುಹಿಸಲಾದ', 'അയച്ചു', 'යැවු පණිවුඩ', 'ส่งแล้ว', 'გაგზავნილი', 'የተላኩ', 'បាន​ផ្ញើ',
    '寄件備份', '寄件備份', '已发信息', '送信済みﾒｰﾙ', '발신 메시지', '보낸 편지함'
  ],
  '\\Trash': [
    'articole șterse', 'bin', 'borttagna objekt', 'deleted', 'deleted items', 'deleted messages', 'elementi eliminati',
    'elementos borrados', 'elementos eliminados', 'gelöschte objekte', 'item dipadam', 'itens apagados', 'itens excluídos',
    'mục đã xóa', 'odstraněné položky', 'pesan terhapus', 'poistetut', 'praht', 'prügikast', 'silinmiş öğeler',
    'slettede beskeder', 'slettede elementer', 'trash', 'törölt elemek', 'usunięte wiadomości', 'verwijderde items',
    'vymazané správy', 'éléments supprimés', 'видалені', 'жойылғандар', 'удаленные', 'פריטים שנמחקו', 'العناصر المحذوفة',
    'موارد حذف شده', 'รายการที่ลบ', '已删除邮件', '已刪除項目', '已刪除項目'
  ],
  '\\Junk': [
    'bulk mail', 'correo no deseado', 'courrier indésirable', 'istenmeyen', 'istenmeyen e-posta', 'junk', 'levélszemét',
    'nevyžiadaná pošta', 'nevyžádaná pošta', 'no deseado', 'posta indesiderata', 'pourriel', 'roskaposti', 'skräppost',
    'spam', 'spam', 'spamowanie', 'søppelpost', 'thư rác', 'спам', 'דואר זבל', 'الرسائل العشوائية', 'هرزنامه', 'สแปม',
    '‎垃圾郵件', '垃圾邮件', '垃圾電郵'
  ],
  '\\Drafts': [
    'ba brouillon', 'borrador', 'borrador', 'borradores', 'bozze', 'brouillons', 'bản thảo', 'ciorne', 'concepten', 'draf',
    'drafts', 'drög', 'entwürfe', 'esborranys', 'garalamalar', 'ihe edeturu', 'iidrafti', 'izinhlaka', 'juodraščiai', 'kladd',
    'kladder', 'koncepty', 'koncepty', 'konsep', 'konsepte', 'kopie robocze', 'layihələr', 'luonnokset', 'melnraksti', 'meralo',
    'mesazhe të padërguara', 'mga draft', 'mustandid', 'nacrti', 'nacrti', 'osnutki', 'piszkozatok', 'rascunhos', 'rasimu',
    'skice', 'taslaklar', 'tsararrun saƙonni', 'utkast', 'vakiraoka', 'vázlatok', 'zirriborroak', 'àwọn àkọpamọ́', 'πρόχειρα',
    'жобалар', 'нацрти', 'нооргууд', 'сиёҳнавис', 'хомаки хатлар', 'чарнавікі', 'чернетки', 'чернови', 'черновики', 'черновиктер',
    'սևագրեր', 'טיוטות', 'مسودات', 'مسودات', 'موسودې', 'پیش نویسها', 'ڈرافٹ/', 'ड्राफ़्ट', 'प्रारूप', 'খসড়া', 'খসড়া', 'ড্ৰাফ্ট', 'ਡ੍ਰਾਫਟ', 'ડ્રાફ્ટસ',
    'ଡ୍ରାଫ୍ଟ', 'வரைவுகள்', 'చిత్తు ప్రతులు', 'ಕರಡುಗಳು', 'കരടുകള്‍', 'කෙටුම් පත්', 'ฉบับร่าง', 'მონახაზები', 'ረቂቆች', 'សារព្រាង', '下書き', '草稿',
    '草稿', '草稿', '임시 보관함'
  ],
  // The \Archive flag is rarely used by major email providers so we also check the path.
  // Thunderbird names them Archives instead of Archive.
  '\\Archive': ['archive', 'archives']
}
const SPECIAL_USE_BOX_FLAGS = Object.keys(SPECIAL_USE_BOXES)

/**
 * Checks if a mailbox is for special use
 *
 * @param {Object} mailbox
 * @return {String} Special use flag (if detected)
 */
export function checkSpecialUse (mailbox) {
  if (mailbox.flags) {
    for (let i = 0; i < SPECIAL_USE_FLAGS.length; i++) {
      const type = SPECIAL_USE_FLAGS[i]
      if ((mailbox.flags || []).indexOf(type) >= 0) {
        mailbox.specialUse = type
        mailbox.specialUseFlag = type
        return type
      }
    }
  }

  return checkSpecialUseByName(mailbox)
}

function checkSpecialUseByName (mailbox) {
  const name = propOr('', 'name', mailbox).toLowerCase().trim()

  for (let i = 0; i < SPECIAL_USE_BOX_FLAGS.length; i++) {
    const type = SPECIAL_USE_BOX_FLAGS[i]
    if (SPECIAL_USE_BOXES[type].indexOf(name) >= 0) {
      mailbox.specialUse = type
      return type
    }
  }

  return false
}
