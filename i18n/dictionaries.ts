import type { Locale } from "@/types";
const dictionaries = {
  ar: {
    dir: "rtl",
    nav: {
      home: "الرئيسية",
      services: "الخدمات",
      work: "أعمالنا",
      barbers: "الحلاقون",
      about: "عن MB",
      location: "الموقع",
      book: "احجز",
    },
    hero: {
      tag: "تجربة عناية استثنائية",
      title: "أناقتك تبدأ من",
      body: "تفاصيل دقيقة. حضور واثق. تجربة حلاقة عصرية مصممة حولك.",
      book: "احجز موعدك",
      explore: "اكتشف خدماتنا",
      scroll: "اكتشف MB",
    },
    services: {
      tag: "خدماتنا",
      title: "عناية تليق بتفاصيلك",
      body: "مجموعة متكاملة من خدمات العناية، تُقدَّم بدقة واهتمام في كل زيارة.",
    },
    barbers: {
      tag: "فريقنا",
      title: "اختر من تثق بتفاصيلك",
      body: "ثلاثة مقاعد، تجربة واحدة بمعايير MB. الأسماء والصور الحقيقية ستضاف قريباً.",
    },
    work: {
      tag: "أعمالنا",
      title: "الدقة تظهر في النتيجة",
      body: "نماذج تجريبية جاهزة للاستبدال بأحدث أعمال MB من Instagram.",
      more: "عرض المزيد على Instagram",
      demo: "غلاف تجريبي",
    },
    about: {
      tag: "عن MB",
      title: "التفاصيل تصنع الفرق",
      body: "في MB نهتم بالتفاصيل التي تصنع الفرق، ونقدّم تجربة حلاقة عصرية تجمع بين الدقة، الراحة والأناقة.",
      stats: ["كل يوم", "فريق محترف", "تجربة مميزة"],
    },
    hours: {
      title: "أوقات العمل",
      daily: "يومياً",
      time: "11:00 صباحاً — 11:00 مساءً",
      open: "مفتوح الآن",
      closed: "مغلق الآن",
    },
    location: {
      tag: "الموقع",
      title: "نراك في MB",
      body: "استخدم رابط Google Maps للوصول إلينا بسهولة.",
      button: "افتح الموقع على Google Maps",
    },
    faq: {
      tag: "الأسئلة الشائعة",
      title: "قبل زيارتك",
      qs: [
        [
          "هل أحتاج لإنشاء حساب؟",
          "لا. نطلب الاسم ورقم الهاتف عند أول حجز فقط، ونحفظهما على جهازك لتسهيل الحجز القادم.",
        ],
        [
          "كيف أحجز موعداً؟",
          "اختر الخدمة والحلاق والتاريخ والوقت، ثم أكّد بياناتك. سيصل الطلب بحالة انتظار التأكيد.",
        ],
        [
          "هل أستطيع اختيار الحلاق؟",
          "نعم، أو اختر أي حلاق متاح ليجد النظام مقعداً متاحاً في الوقت الذي يناسبك.",
        ],
        [
          "كيف أعرف أن الحجز تم تأكيده؟",
          "تظهر حالة طلبك برقم مرجعي مستقل. يتولى فريق MB تأكيد الطلب بعد مراجعته.",
        ],
        [
          "هل يمكن تعديل الموعد؟",
          "تواصل معنا عبر الهاتف أو WhatsApp مع ذكر رقم الحجز.",
        ],
        [
          "ما أوقات الدوام؟",
          "نعمل يومياً من 11:00 صباحاً حتى 11:00 مساءً، ما لم يُعلن عن ساعات استثنائية.",
        ],
      ],
    },
    booking: {
      tag: "حجز موعد",
      title: "موعدك. بطريقتك.",
      steps: ["الخدمة", "الحلاق", "التاريخ", "الوقت", "بياناتك", "التأكيد"],
      any: "أي حلاق متاح",
      continue: "متابعة",
      back: "رجوع",
      name: "الاسم",
      phone: "رقم الهاتف",
      confirm: "تأكيد طلب الحجز",
      summary: "ملخص الحجز",
      pending: "بانتظار التأكيد",
      success: "تم استلام طلب حجزك",
      reference: "رقم الحجز",
      another: "العودة للرئيسية",
      noSlots: "لا توجد أوقات متاحة لهذا الاختيار.",
      offline: "يبدو أنك غير متصل بالإنترنت. اتصل بالإنترنت لإكمال الحجز.",
      error: "تعذر إتمام الحجز. تحقق من البيانات وحاول مرة أخرى.",
      conflict: "سبق حجز هذا الموعد. اختر وقتاً آخر.",
      demo: "وضع العرض — تُحفظ الحجوزات مؤقتاً حتى يتم ربط Firebase.",
    },
    footer: { line: "عناية دقيقة. حضور واثق.", rights: "جميع الحقوق محفوظة." },
  },
  en: {
    dir: "ltr",
    nav: {
      home: "Home",
      services: "Services",
      work: "Our Work",
      barbers: "Barbers",
      about: "About",
      location: "Location",
      book: "Book",
    },
    hero: {
      tag: "An exceptional grooming experience",
      title: "Your Style Starts at",
      body: "Precise details. Quiet confidence. A modern grooming experience designed around you.",
      book: "Book Your Appointment",
      explore: "Explore Our Services",
      scroll: "Discover MB",
    },
    services: {
      tag: "Our services",
      title: "Care for every detail",
      body: "A complete selection of grooming services, delivered with precision and attention on every visit.",
    },
    barbers: {
      tag: "Our team",
      title: "Choose who shapes your look",
      body: "Three chairs, one MB standard. Real names and portraits will be added soon.",
    },
    work: {
      tag: "Our work",
      title: "Precision you can see",
      body: "Demo covers ready to be replaced with MB’s latest Instagram work.",
      more: "View More on Instagram",
      demo: "Demo cover",
    },
    about: {
      tag: "About MB",
      title: "Details make the difference",
      body: "At MB, we focus on the details that make the difference, delivering a modern grooming experience built on precision, comfort and style.",
      stats: ["Open daily", "Dedicated team", "One standard"],
    },
    hours: {
      title: "Opening hours",
      daily: "Every day",
      time: "11:00 AM — 11:00 PM",
      open: "Open now",
      closed: "Closed now",
    },
    location: {
      tag: "Location",
      title: "Meet us at MB",
      body: "Use the provided Google Maps link for easy directions to the shop.",
      button: "Open in Google Maps",
    },
    faq: {
      tag: "FAQ",
      title: "Before your visit",
      qs: [
        [
          "Do I need an account?",
          "No. We only ask for your name and phone on the first booking and remember them on your device.",
        ],
        [
          "How do I book?",
          "Choose a service, barber, date and time, then confirm your details. Your request starts as pending.",
        ],
        [
          "Can I choose my barber?",
          "Yes, or choose Any Available Barber and we will find a free chair at your preferred time.",
        ],
        [
          "How do I know my booking is confirmed?",
          "Your request receives its own reference and status. The MB team confirms it after review.",
        ],
        [
          "Can I change my appointment?",
          "Contact us by phone or WhatsApp and include your booking reference.",
        ],
        [
          "What are the opening hours?",
          "We are open daily from 11:00 AM to 11:00 PM unless special hours are announced.",
        ],
      ],
    },
    booking: {
      tag: "Book an appointment",
      title: "Your time. Your way.",
      steps: ["Service", "Barber", "Date", "Time", "Details", "Confirm"],
      any: "Any Available Barber",
      continue: "Continue",
      back: "Back",
      name: "Name",
      phone: "Phone number",
      confirm: "Confirm booking request",
      summary: "Booking summary",
      pending: "Pending confirmation",
      success: "Your booking request was received",
      reference: "Booking reference",
      another: "Back to home",
      noSlots: "No available times for this selection.",
      offline:
        "You appear to be offline. Connect to the internet to complete your booking.",
      error:
        "We couldn’t complete the booking. Check your details and try again.",
      conflict: "That time was just booked. Please choose another.",
      demo: "Demo mode — bookings are temporary until Firebase is connected.",
    },
    footer: {
      line: "Precise care. Quiet confidence.",
      rights: "All rights reserved.",
    },
  },
} as const;
export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
