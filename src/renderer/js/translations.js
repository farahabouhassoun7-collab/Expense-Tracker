'use strict';

export const translations = {
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_transactions: "Transactions",
    nav_statistics: "Statistics",
    nav_settings: "Settings",
    theme_light: "Light",
    theme_dark: "Dark",
    app_version: "v1.0.0",

    // App Header
    btn_add_income: "Add Income",
    btn_add_expense: "Add Expense",

    // Dashboard
    card_balance_label: "Balance",
    card_income_label: "Total Income",
    card_expenses_label: "Total Expenses",
    card_transactions_label: "Transactions",
    card_count_sub: "all time",
    chart_spending_category: "Spending by Category",
    chart_empty_expense: "No expense data yet.<br>Add expenses to see your spending breakdown.",
    recent_transactions_title: "Recent Transactions",
    btn_view_all: "View all →",
    recent_empty_heading: "No transactions yet",
    recent_empty_body: "Add your first income or expense to get started.",

    // Transactions
    search_placeholder: "Search transactions...",
    filter_all_categories: "All Categories",
    btn_export_csv: "Export CSV",
    table_th_date: "Date",
    table_th_type: "Type",
    table_th_title: "Title",
    table_th_category: "Category",
    table_th_amount: "Amount",
    table_th_actions: "Actions",
    btn_edit: "Edit",
    btn_delete: "Delete",
    transactions_empty_heading: "No transactions yet",
    transactions_empty_body: "Add your first income or expense to get started.",

    // Statistics
    stats_total_income: "Total Income",
    stats_total_expenses: "Total Expenses",
    stats_balance: "Balance",
    chart_spending_by_category: "Spending by Category",
    chart_monthly_expenses: "Monthly Expenses",
    stats_empty_category: "No expense data yet.",
    stats_empty_monthly: "No expense data yet.",

    // Settings
    settings_general_title: "General Settings",
    settings_currency_label: "Currency",
    settings_theme_label: "Theme",
    settings_export_label: "Export Data",
    settings_export_hint: "Export all transactions as a CSV file for backup or analysis.",
    settings_about_title: "About",
    settings_app_version_label: "Application Version",
    settings_db_location_label: "Database Location",
    settings_total_transactions_label: "Total Transactions",
    settings_language_label: "Language",

    // Modal Add/Edit
    modal_title_add_income: "Add Income",
    modal_title_edit_income: "Edit Income",
    modal_title_add_expense: "Add Expense",
    modal_title_edit_expense: "Edit Expense",
    modal_label_title: "Title *",
    modal_label_amount: "Amount *",
    modal_label_category: "Category *",
    modal_label_date: "Date *",
    modal_label_note: "Note",
    modal_placeholder_title: "Salary, Groceries, etc.",
    modal_placeholder_amount: "0.00",
    modal_placeholder_category: "Select category",
    modal_placeholder_note: "Optional note...",
    modal_cancel: "Cancel",
    modal_save: "Save",

    // Categories
    cat_food: "Food",
    cat_transport: "Transport",
    cat_shopping: "Shopping",
    cat_bills: "Bills",
    cat_entertainment: "Entertainment",
    cat_healthcare: "Healthcare",
    cat_other: "Other",

    // Types
    type_income: "Income",
    type_expense: "Expense",

    // Messages
    msg_confirm_delete: "Delete this transaction? This cannot be undone.",
    msg_delete_failed: "Delete failed",
    msg_delete_success: "Transaction deleted.",
    msg_export_success: "Export successful.",
    msg_export_failed: "Export failed",
    msg_settings_load_error: "Unable to load settings.",
    msg_settings_save_error: "Failed to save settings",
    msg_currency_updated: "Currency updated.",
    msg_theme_updated: "Theme updated.",
    msg_language_updated: "Language updated.",
    msg_db_load_error: "Failed to load database path.",
    msg_invalid_title: "Title is required (1-100 characters).",
    msg_invalid_amount: "Amount must be a positive number.",
    msg_invalid_category: "Please select a category.",
    msg_invalid_date: "Please enter a valid date.",
    msg_add_success: "Transaction added successfully.",
    msg_edit_success: "Transaction updated successfully.",
    msg_unknown: "Unknown",
  },
  ar: {
    // Navigation
    nav_dashboard: "لوحة التحكم",
    nav_transactions: "المعاملات",
    nav_statistics: "الإحصائيات",
    nav_settings: "الإعدادات",
    theme_light: "فاتح",
    theme_dark: "داكن",
    app_version: "نسخة v1.0.0",

    // App Header
    btn_add_income: "إضافة دخل",
    btn_add_expense: "إضافة مصروف",

    // Dashboard
    card_balance_label: "الرصيد",
    card_income_label: "إجمالي الدخل",
    card_expenses_label: "إجمالي المصروفات",
    card_transactions_label: "المعاملات",
    card_count_sub: "كل الأوقات",
    chart_spending_category: "المصروفات حسب الفئة",
    chart_empty_expense: "لا توجد بيانات مصروفات بعد.<br>أضف مصروفات لرؤية تفاصيل الإنفاق.",
    recent_transactions_title: "المعاملات الأخيرة",
    btn_view_all: "عرض الكل ←",
    recent_empty_heading: "لا توجد معاملات بعد",
    recent_empty_body: "أضف أول دخل أو مصروف للبدء.",

    // Transactions
    search_placeholder: "البحث عن المعاملات...",
    filter_all_categories: "كل الفئات",
    btn_export_csv: "تصدير CSV",
    table_th_date: "التاريخ",
    table_th_type: "النوع",
    table_th_title: "العنوان",
    table_th_category: "الفئة",
    table_th_amount: "القيمة",
    table_th_actions: "الإجراءات",
    btn_edit: "تعديل",
    btn_delete: "حذف",
    transactions_empty_heading: "لا توجد معاملات بعد",
    transactions_empty_body: "أضف أول دخل أو مصروف للبدء.",

    // Statistics
    stats_total_income: "إجمالي الدخل",
    stats_total_expenses: "إجمالي المصروفات",
    stats_balance: "الرصيد",
    chart_spending_by_category: "المصروفات حسب الفئة",
    chart_monthly_expenses: "المصروفات الشهرية",
    stats_empty_category: "لا توجد بيانات مصروفات بعد.",
    stats_empty_monthly: "لا توجد بيانات مصروفات بعد.",

    // Settings
    settings_general_title: "الإعدادات العامة",
    settings_currency_label: "العملة",
    settings_theme_label: "المظهر",
    settings_export_label: "تصدير البيانات",
    settings_export_hint: "تصدير جميع المعاملات كملف CSV للنسخ الاحتياطي أو التحليل.",
    settings_about_title: "حول التطبيق",
    settings_app_version_label: "إصدار التطبيق",
    settings_db_location_label: "موقع قاعدة البيانات",
    settings_total_transactions_label: "إجمالي المعاملات",
    settings_language_label: "اللغة",

    // Modal Add/Edit
    modal_title_add_income: "إضافة دخل",
    modal_title_edit_income: "تعديل الدخل",
    modal_title_add_expense: "إضافة مصروف",
    modal_title_edit_expense: "تعديل المصروف",
    modal_label_title: "العنوان *",
    modal_label_amount: "القيمة *",
    modal_label_category: "الفئة *",
    modal_label_date: "التاريخ *",
    modal_label_note: "ملاحظة",
    modal_placeholder_title: "راتب، بقالة، إلخ.",
    modal_placeholder_amount: "0.00",
    modal_placeholder_category: "اختر الفئة",
    modal_placeholder_note: "ملاحظة اختيارية...",
    modal_cancel: "إلغاء",
    modal_save: "حفظ",

    // Categories
    cat_food: "طعام",
    cat_transport: "نقل",
    cat_shopping: "تسوق",
    cat_bills: "فواتير",
    cat_entertainment: "ترفيه",
    cat_healthcare: "رعاية صحية",
    cat_other: "أخرى",

    // Types
    type_income: "دخل",
    type_expense: "مصروف",

    // Messages
    msg_confirm_delete: "هل تريد حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
    msg_delete_failed: "فشل الحذف",
    msg_delete_success: "تم حذف المعاملة بنجاح.",
    msg_export_success: "تم التصدير بنجاح.",
    msg_export_failed: "فشل التصدير",
    msg_settings_load_error: "تعذر تحميل الإعدادات.",
    msg_settings_save_error: "فشل حفظ الإعدادات",
    msg_currency_updated: "تم تحديث العملة.",
    msg_theme_updated: "تم تحديث المظهر.",
    msg_language_updated: "تم تحديث اللغة.",
    msg_db_load_error: "فشل تحميل مسار قاعدة البيانات.",
    msg_invalid_title: "العنوان مطلوب (من 1 إلى 100 حرف).",
    msg_invalid_amount: "يجب أن تكون القيمة رقماً موجباً.",
    msg_invalid_category: "يرجى اختيار فئة.",
    msg_invalid_date: "يرجى إدخال تاريخ صالح.",
    msg_add_success: "تم إضافة المعاملة بنجاح.",
    msg_edit_success: "تم تحديث المعاملة بنجاح.",
    msg_unknown: "غير معروف",
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = lang === 'ar' ? 'ar' : 'en';
}

export function getLanguage() {
  return currentLang;
}

export function translate(key) {
  return translations[currentLang][key] || key;
}

/**
 * Translates standard database categories into the selected UI language
 * @param {string} category 
 * @returns {string} Localized category name
 */
export function translateCategory(category) {
  const mapping = {
    'Food': 'cat_food',
    'Transport': 'cat_transport',
    'Shopping': 'cat_shopping',
    'Bills': 'cat_bills',
    'Entertainment': 'cat_entertainment',
    'Healthcare': 'cat_healthcare',
    'Other': 'cat_other'
  };
  const key = mapping[category];
  return key ? translate(key) : category;
}

/**
 * Translates standard type names (income/expense)
 * @param {string} type 
 * @returns {string} Localized type
 */
export function translateType(type) {
  if (type === 'income') return translate('type_income');
  if (type === 'expense') return translate('type_expense');
  return type;
}

/**
 * Traverses the DOM to translate elements with data-i18n / data-i18n-placeholder attributes
 * @param {string} lang 
 */
export function applyLanguage(lang) {
  setLanguage(lang);

  const html = document.documentElement;
  if (lang === 'ar') {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
  } else {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
  }

  // 1. Static Text Elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = translate(key);
    if (val && val !== key) {
      const svg = el.querySelector('svg');
      if (svg) {
        // Keep the svg, replace only the text nodes
        let textNode = Array.from(el.childNodes).find(
          node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ''
        );
        if (textNode) {
          textNode.nodeValue = ` ${val.trim()} `;
        } else {
          el.appendChild(document.createTextNode(` ${val.trim()} `));
        }
      } else {
        el.innerHTML = val;
      }
    }
  });

  // 2. Input Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = translate(key);
    if (val && val !== key) {
      el.setAttribute('placeholder', val);
    }
  });

  // 3. Elements with descriptive aria-label
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    const val = translate(key);
    if (val && val !== key) {
      el.setAttribute('aria-label', val);
    }
  });
}
