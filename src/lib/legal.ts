import type { L10n } from "@/lib/i18n/config";

/** Draft legal texts. They MUST be reviewed by NOOR's legal adviser before commercial launch (flagged on the page). */
export const legalPages: Record<"terms" | "privacy" | "cookies", L10n[]> = {
  terms: [
    {
      en: "NOOR Travel & Tours (EASYOIL FZE, Dubai, United Arab Emirates) sells travel services on behalf of airlines, hotels and local operators, and operates some services directly (desert safaris, transfers, activities).",
      fr: "NOOR Travel & Tours (EASYOIL FZE, Dubaï, Émirats arabes unis) vend des services de voyage pour le compte de compagnies aériennes, d'hôtels et d'opérateurs locaux, et opère directement certains services (safaris, transferts, activités).",
      ar: "تبيع نور للسفر والسياحة (EASYOIL FZE، دبي، الإمارات العربية المتحدة) خدمات السفر نيابة عن شركات الطيران والفنادق والمشغلين المحليين، وتشغّل بعض الخدمات مباشرة (رحلات السفاري والتوصيل والأنشطة).",
    },
    {
      en: "A booking is confirmed only when NOOR sends a confirmation with a booking reference and, where payment is required, after the payment provider has confirmed the payment. Requests and quotes are not confirmations.",
      fr: "Une réservation n'est confirmée que lorsque NOOR envoie une confirmation avec une référence et, si un paiement est requis, après confirmation du paiement par le prestataire de paiement. Les demandes et devis ne valent pas confirmation.",
      ar: "لا يُعتبر الحجز مؤكدًا إلا عندما ترسل نور تأكيدًا برقم مرجعي، وبعد تأكيد مزود الدفع للدفعة عند الحاجة. الطلبات وعروض الأسعار ليست تأكيدات.",
    },
    {
      en: "Prices are charged in UAE dirhams (AED). Amounts shown in other currencies are indicative. Cancellation and change conditions are stated on each product and in your confirmation.",
      fr: "Les prix sont facturés en dirhams des Émirats (AED). Les montants affichés dans d'autres devises sont indicatifs. Les conditions d'annulation et de modification figurent sur chaque produit et dans votre confirmation.",
      ar: "تُحتسب الأسعار بالدرهم الإماراتي. المبالغ المعروضة بعملات أخرى تقريبية. تُذكر شروط الإلغاء والتعديل في كل منتج وفي تأكيد الحجز.",
    },
    {
      en: "Visa assistance is a preparation and submission service. The decision to grant a visa belongs exclusively to the competent authorities, and service fees are not refunded if a visa is refused.",
      fr: "L'assistance visa est un service de préparation et de dépôt. La décision d'accorder un visa appartient exclusivement aux autorités compétentes et les frais de service ne sont pas remboursés en cas de refus.",
      ar: "المساعدة في التأشيرات خدمة تحضير وتقديم. قرار منح التأشيرة يعود حصريًا للسلطات المختصة، ولا تُسترد رسوم الخدمة في حال الرفض.",
    },
  ],
  privacy: [
    {
      en: "We collect the information you give us (name, contact details, traveller details, documents for visa applications) to provide the services you request, and we keep it only as long as needed for those services and our legal obligations.",
      fr: "Nous collectons les informations que vous nous transmettez (nom, coordonnées, voyageurs, documents de visa) pour fournir les services demandés, et nous les conservons uniquement le temps nécessaire à ces services et à nos obligations légales.",
      ar: "نجمع المعلومات التي تقدمها (الاسم وبيانات الاتصال وبيانات المسافرين ومستندات التأشيرة) لتقديم الخدمات المطلوبة، ونحتفظ بها فقط للمدة اللازمة لهذه الخدمات والتزاماتنا القانونية.",
    },
    {
      en: "Card payments are handled by our payment provider on its own secure page. NOOR never receives or stores your full card number.",
      fr: "Les paiements par carte sont traités par notre prestataire sur sa propre page sécurisée. NOOR ne reçoit ni ne conserve jamais votre numéro de carte complet.",
      ar: "يعالج مزود الدفع لدينا المدفوعات بالبطاقات على صفحته الآمنة. لا تتلقى نور رقم بطاقتك الكامل ولا تخزنه أبدًا.",
    },
    {
      en: "Visa documents are stored in private storage, accessible only to you and to authorised NOOR staff. Every staff access is logged.",
      fr: "Les documents de visa sont stockés dans un espace privé, accessible uniquement à vous et au personnel NOOR autorisé. Chaque accès du personnel est journalisé.",
      ar: "تُحفظ مستندات التأشيرة في تخزين خاص لا يصل إليه سواك وموظفو نور المخولون، ويُسجَّل كل وصول من الموظفين.",
    },
    {
      en: "We share data with suppliers (airlines, hotels, operators) only to fulfil your booking. You can ask to access, correct or delete your data by contacting us.",
      fr: "Nous partageons les données avec les fournisseurs (compagnies, hôtels, opérateurs) uniquement pour exécuter votre réservation. Vous pouvez demander l'accès, la rectification ou la suppression de vos données en nous contactant.",
      ar: "نشارك البيانات مع الموردين (شركات الطيران والفنادق والمشغلين) لتنفيذ حجزك فقط. يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها بالتواصل معنا.",
    },
  ],
  cookies: [
    {
      en: "NOOR uses only the cookies needed for the site to work: your session when signed in (noor_session) and your display currency (noor_currency). We do not use advertising or tracking cookies.",
      fr: "NOOR n'utilise que les cookies nécessaires au fonctionnement du site : votre session lorsque vous êtes connecté (noor_session) et votre devise d'affichage (noor_currency). Nous n'utilisons pas de cookies publicitaires ni de suivi.",
      ar: "تستخدم نور ملفات تعريف الارتباط الضرورية فقط: جلستك عند تسجيل الدخول (noor_session) وعملة العرض (noor_currency). لا نستخدم ملفات إعلانية أو للتتبع.",
    },
  ],
};
