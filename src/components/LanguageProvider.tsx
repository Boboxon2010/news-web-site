'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type SiteLanguage = 'uz' | 'ru' | 'en';

const messages: Record<string, Record<SiteLanguage, string>> = {
  'Bosh sahifa': { uz: 'Bosh sahifa', ru: 'Главная', en: 'Home' },
  'Biz haqimizda': { uz: 'Biz haqimizda', ru: 'О лицее', en: 'About us' },
  'Litsey haqida': { uz: 'Litsey haqida', ru: 'О лицее', en: 'About the lyceum' },
  'Yangiliklar': { uz: 'Yangiliklar', ru: 'Новости', en: 'News' },
  'Yangiliklar va E\'lonlar': { uz: 'Yangiliklar va E\'lonlar', ru: 'Новости и объявления', en: 'News and announcements' },
  'Qabul': { uz: 'Qabul', ru: 'Приём', en: 'Admissions' },
  'Qabul komissiyasi': { uz: 'Qabul komissiyasi', ru: 'Приёмная комиссия', en: 'Admissions committee' },
  'Fotogalereya': { uz: 'Fotogalereya', ru: 'Фотогалерея', en: 'Photo gallery' },
  'Galereya': { uz: 'Galereya', ru: 'Галерея', en: 'Gallery' },
  'Bog\'lanish': { uz: 'Bog\'lanish', ru: 'Контакты', en: 'Contact' },
  'Bog\'lanish va Manzil': { uz: 'Bog\'lanish va Manzil', ru: 'Контакты и адрес', en: 'Contact and address' },
  'Aloqa': { uz: 'Aloqa', ru: 'Связаться', en: 'Contact' },
  'So\'nggi Yangiliklar va E\'lonlar': { uz: 'So\'nggi Yangiliklar va E\'lonlar', ru: 'Последние новости и объявления', en: 'Latest news and announcements' },
  'Hozircha yangiliklar mavjud emas.': { uz: 'Hozircha yangiliklar mavjud emas.', ru: 'Пока нет новостей.', en: 'There are no news items yet.' },
  'Rasmlarni ko\'rish': { uz: 'Rasmlarni ko\'rish', ru: 'Смотреть фотографии', en: 'View photos' },
  'Fotolavhalar': { uz: 'Fotolavhalar', ru: 'Фотоматериалы', en: 'Photo highlights' },
  'Maqola': { uz: 'Maqola', ru: 'Статья', en: 'Article' },
  'Bo‘lim': { uz: 'Bo‘lim', ru: 'Раздел', en: 'Category' },
  'Sana': { uz: 'Sana', ru: 'Дата', en: 'Date' },
  'Yangilik matni yuklanmoqda...': { uz: 'Yangilik matni yuklanmoqda...', ru: 'Загрузка текста новости...', en: 'Loading news...' },
  'Yangilik matnini yuklashda xatolik yuz berdi.': { uz: 'Yangilik matnini yuklashda xatolik yuz berdi.', ru: 'Не удалось загрузить текст новости.', en: 'Could not load the news text.' },
  'Tungi rejim': { uz: 'Tungi rejim', ru: 'Тёмная тема', en: 'Dark mode' },
  'Kunduzgi rejim': { uz: 'Kunduzgi rejim', ru: 'Светлая тема', en: 'Light mode' },
  'Tungi rejimga o\'tish': { uz: 'Tungi rejimga o\'tish', ru: 'Включить тёмную тему', en: 'Switch to dark mode' },
  'Kunduzgi rejimga o\'tish': { uz: 'Kunduzgi rejimga o\'tish', ru: 'Включить светлую тему', en: 'Switch to light mode' },
  'Tilni tanlash': { uz: 'Tilni tanlash', ru: 'Выбрать язык', en: 'Choose language' },
  'Til': { uz: 'Til', ru: 'Язык', en: 'Language' },
  'Barcha huquqlar himoyalangan.': { uz: 'Barcha huquqlar himoyalangan.', ru: 'Все права защищены.', en: 'All rights reserved.' },
  'O\'zbekiston Respublikasi Ichki ishlar vazirligi Xorazm akademik litseyi. Barcha huquqlar himoyalangan.': { uz: 'O\'zbekiston Respublikasi Ichki ishlar vazirligi Xorazm akademik litseyi. Barcha huquqlar himoyalangan.', ru: 'Хорезмский академический лицей Министерства внутренних дел Республики Узбекистан. Все права защищены.', en: 'Khorezm Academic Lyceum of the Ministry of Internal Affairs of the Republic of Uzbekistan. All rights reserved.' },
  'Ma’lumot yuklanmoqda': { uz: 'Ma’lumot yuklanmoqda', ru: 'Загрузка данных', en: 'Loading data' },
  'Ma’lumotlar yuklanmoqda': { uz: 'Ma’lumotlar yuklanmoqda', ru: 'Загрузка данных', en: 'Loading data' },
  'Yuborilmoqda...': { uz: 'Yuborilmoqda...', ru: 'Отправка...', en: 'Sending...' },
  'Murojaatni Yuborish': { uz: 'Murojaatni Yuborish', ru: 'Отправить обращение', en: 'Send message' },
  'Onlayn Murojaat Yuborish': { uz: 'Onlayn Murojaat Yuborish', ru: 'Отправить обращение онлайн', en: 'Send an online message' },
  'Ism va Familiyangiz': { uz: 'Ism va Familiyangiz', ru: 'Имя и фамилия', en: 'Full name' },
  'Telefon raqamingiz (ixtiyoriy)': { uz: 'Telefon raqamingiz (ixtiyoriy)', ru: 'Ваш телефон (необязательно)', en: 'Your phone (optional)' },
  'Emailingiz (ixtiyoriy)': { uz: 'Emailingiz (ixtiyoriy)', ru: 'Ваш email (необязательно)', en: 'Your email (optional)' },
  'Murojaat Yoki Savolingiz Matni': { uz: 'Murojaat Yoki Savolingiz Matni', ru: 'Текст обращения или вопроса', en: 'Message or question' },
  'Manzilimiz': { uz: 'Manzilimiz', ru: 'Наш адрес', en: 'Our address' },
  'Telefon raqam': { uz: 'Telefon raqam', ru: 'Телефон', en: 'Phone' },
  'Elektron pochta': { uz: 'Elektron pochta', ru: 'Электронная почта', en: 'Email' },
  'Ish Vaqti': { uz: 'Ish Vaqti', ru: 'Часы работы', en: 'Working hours' },
  'Pochta indeksi': { uz: 'Pochta indeksi', ru: 'Почтовый индекс', en: 'Postal code' },
  'Ma’lumot kiritilmagan': { uz: 'Ma’lumot kiritilmagan', ru: 'Данные не указаны', en: 'Not provided' },
  'Murojaatlaringiz admin paneliga saqlandi.': { uz: 'Murojaatingiz admin paneliga saqlandi.', ru: 'Ваше обращение сохранено.', en: 'Your message has been saved.' },
  'Admin login va paroli': { uz: 'Admin login va paroli', ru: 'Логин и пароль администратора', en: 'Admin username and password' },
  'Sayt sozlamalari': { uz: 'Sayt sozlamalari', ru: 'Настройки сайта', en: 'Site settings' },
  'Sozlamalarni saqlash': { uz: 'Sozlamalarni saqlash', ru: 'Сохранить настройки', en: 'Save settings' },
  'Saqlandi': { uz: 'Saqlandi', ru: 'Сохранено', en: 'Saved' },
  'Login/parolni yangilash': { uz: 'Login/parolni yangilash', ru: 'Изменить логин/пароль', en: 'Update username/password' },
  'Akkaunt ma’lumotlari saqlandi.': { uz: 'Akkaunt ma’lumotlari saqlandi.', ru: 'Данные аккаунта сохранены.', en: 'Account details saved.' },
  'Dashboard (Statistika)': { uz: 'Dashboard (Statistika)', ru: 'Панель (статистика)', en: 'Dashboard (statistics)' },
  'Rahbariyat': { uz: 'Rahbariyat', ru: 'Руководство', en: 'Leadership' },
  'Murojaatlar': { uz: 'Murojaatlar', ru: 'Обращения', en: 'Messages' },
  'Sozlamalar': { uz: 'Sozlamalar', ru: 'Настройки', en: 'Settings' },
  'Tizimdan chiqish': { uz: 'Tizimdan chiqish', ru: 'Выйти из системы', en: 'Log out' },
  'Tizimga kirish': { uz: 'Tizimga kirish', ru: 'Войти', en: 'Log in' },
  'Yangi yangilik': { uz: 'Yangi yangilik', ru: 'Новая новость', en: 'New article' },
  'Yangilikni tahrirlash': { uz: 'Yangilikni tahrirlash', ru: 'Редактировать новость', en: 'Edit article' },
  'Saqlash': { uz: 'Saqlash', ru: 'Сохранить', en: 'Save' },
  'Bekor qilish': { uz: 'Bekor qilish', ru: 'Отмена', en: 'Cancel' },
  'Rahbariyatni boshqarish': { uz: 'Rahbariyatni boshqarish', ru: 'Управление руководством', en: 'Manage leadership' },
  'Yangiliklar boshqaruvi': { uz: 'Yangiliklar boshqaruvi', ru: 'Управление новостями', en: 'News management' },
  'Qabul - 2026/2027': { uz: 'Qabul - 2026/2027', ru: 'Приём - 2026/2027', en: 'Admissions - 2026/2027' },
  'ICHKI ISHLAR VAZIRLIGI XORAZM AKADEMIK LITSEYI': { uz: 'ICHKI ISHLAR VAZIRLIGI XORAZM AKADEMIK LITSEYI', ru: 'ХОРЕЗМСКИЙ АКАДЕМИЧЕСКИЙ ЛИЦЕЙ МВД', en: 'KHOREZM ACADEMIC LYCEUM OF THE MINISTRY OF INTERNAL AFFAIRS' },
  'Rasmiy Axborot va Yangiliklar Portali': { uz: 'Rasmiy Axborot va Yangiliklar Portali', ru: 'Официальный информационный портал', en: 'Official Information and News Portal' },
  'Litsey Hayoti': { uz: 'Litsey Hayoti', ru: 'Жизнь лицея', en: 'Lyceum life' },
  'Tashkilot Haqida': { uz: 'Tashkilot Haqida', ru: 'О лицее', en: 'About the institution' },
  'Litsey Rahbariyati': { uz: 'Litsey Rahbariyati', ru: 'Руководство лицея', en: 'Lyceum leadership' },
  'Rasmiy tasdiqlangan rahbar va komandir-o\'qituvchilarimiz': { uz: 'Rasmiy tasdiqlangan rahbar va komandir-o\'qituvchilarimiz', ru: 'Официально утверждённые руководители и преподаватели-командиры', en: 'Officially appointed leaders and instructor-commanders' },
  'Rahbariyat ma\'lumotlari admin tomonidan kiritilmoqda.': { uz: 'Rahbariyat ma\'lumotlari admin tomonidan kiritilmoqda.', ru: 'Данные о руководстве добавляются администратором.', en: 'Leadership details are being added by the administrator.' },
  'Qidirish': { uz: 'Qidirish', ru: 'Поиск', en: 'Search' },
  'Saralash': { uz: 'Saralash', ru: 'Сортировка', en: 'Sort' },
  'Alifbo bo‘yicha': { uz: 'Alifbo bo‘yicha', ru: 'По алфавиту', en: 'Alphabetical' },
  'Lavozim bo‘yicha': { uz: 'Lavozim bo‘yicha', ru: 'По должности', en: 'By position' },
  'Filtr bo‘yicha rahbariyat ma’lumoti topilmadi.': { uz: 'Filtr bo‘yicha rahbariyat ma’lumoti topilmadi.', ru: 'По фильтру руководство не найдено.', en: 'No leadership entries match this filter.' },
  'IIV Xorazm Akademik Litseyiga Qabul': { uz: 'IIV Xorazm Akademik Litseyiga Qabul', ru: 'Приём в Хорезмский академический лицей МВД', en: 'Admissions to the MIA Khorezm Academic Lyceum' },
  'Qabul Bosqichlari': { uz: 'Qabul Bosqichlari', ru: 'Этапы приёма', en: 'Admission stages' },
  'Hujjat topshirish': { uz: 'Hujjat topshirish', ru: 'Подача документов', en: 'Submit documents' },
  'Umumta\'lim maktablarining 9-sinf bitiruvchilari my.dtm.uz (Bilimni baholash agentligi) orqali ariza topshirishadi.': { uz: 'Umumta\'lim maktablarining 9-sinf bitiruvchilari my.dtm.uz (Bilimni baholash agentligi) orqali ariza topshirishadi.', ru: 'Выпускники 9-х классов подают заявление через my.dtm.uz (Агентство оценки знаний).', en: 'Ninth-grade graduates apply through my.dtm.uz (Knowledge Assessment Agency).' },
  'Tibbiy ko\'rik va jismoniy tayyorgarlik': { uz: 'Tibbiy ko\'rik va jismoniy tayyorgarlik', ru: 'Медицинский осмотр и физическая подготовка', en: 'Medical examination and physical fitness' },
  'IIV maxsus komissiyasi tomonidan salomatlik va jismoniy tayyorgarlik me\'yorlari sinovdan o\'tkaziladi.': { uz: 'IIV maxsus komissiyasi tomonidan salomatlik va jismoniy tayyorgarlik me\'yorlari sinovdan o\'tkaziladi.', ru: 'Специальная комиссия МВД проверяет здоровье и физическую подготовку.', en: 'The MIA special commission assesses health and physical fitness.' },
  'Saralash test sinovlari': { uz: 'Saralash test sinovlari', ru: 'Отборочные тесты', en: 'Selection tests' },
  'Aniq va ijtimoiy fanlar hamda psixologik darajani aniqlash bo\'yicha test sinovlari topshiriladi.': { uz: 'Aniq va ijtimoiy fanlar hamda psixologik darajani aniqlash bo\'yicha test sinovlari topshiriladi.', ru: 'Проводятся тесты по точным и общественным наукам, а также оценка психологической готовности.', en: 'Applicants take tests in exact and social sciences and a psychological assessment.' },
  'O\'qishga qabul qilish': { uz: 'O\'qishga qabul qilish', ru: 'Зачисление на обучение', en: 'Admission to study' },
  'Test natijalariga ko\'ra eng yuqori ball to\'plagan nomzodlar litsey o\'quvchilar safiga qabul qilinadi.': { uz: 'Test natijalariga ko\'ra eng yuqori ball to\'plagan nomzodlar litsey o\'quvchilar safiga qabul qilinadi.', ru: 'В лицей зачисляются кандидаты с наивысшими результатами тестирования.', en: 'Candidates with the highest test scores are admitted to the lyceum.' },
  'Talab Qilinadigan Hujjatlar:': { uz: 'Talab Qilinadigan Hujjatlar:', ru: 'Необходимые документы:', en: 'Required documents:' },
  'Ariza (Onlayn portal orqali)': { uz: 'Ariza (Onlayn portal orqali)', ru: 'Заявление (через онлайн-портал)', en: 'Application (via the online portal)' },
  'Tug\'ilganlik haqida guvohnoma / ID karta nusxasi': { uz: 'Tug\'ilganlik haqida guvohnoma / ID karta nusxasi', ru: 'Копия свидетельства о рождении или ID-карты', en: 'Copy of birth certificate or ID card' },
  '9-sinfni bitirganligi haqida shahodatnoma (Attestat)': { uz: '9-sinfni bitirganligi haqida shahodatnoma (Attestat)', ru: 'Аттестат об окончании 9-го класса', en: 'Certificate of completion of grade 9' },
  '3x4 o\'lchamli rangli fotosurat (8 ta)': { uz: '3x4 o\'lchamli rangli fotosurat (8 ta)', ru: '8 цветных фотографий размером 3×4', en: 'Eight color photos, 3×4 cm' },
  'Tibbiy ma\'lumotnoma (086-U shakl)': { uz: 'Tibbiy ma\'lumotnoma (086-U shakl)', ru: 'Медицинская справка (форма 086-У)', en: 'Medical certificate (form 086-U)' },
  'Savollaringiz bormi?': { uz: 'Savollaringiz bormi?', ru: 'Есть вопросы?', en: 'Have questions?' },
  'Qabul komissiyasi ishonch telefoni orqali barcha savollaringizga javob olishingiz mumkin.': { uz: 'Qabul komissiyasi ishonch telefoni orqali barcha savollaringizga javob olishingiz mumkin.', ru: 'Ответы на вопросы можно получить по телефону приёмной комиссии.', en: 'Contact the admissions committee hotline for answers to your questions.' },
  'IIV Xorazm Akademik Litseyida bo‘lib o‘tgan tadbirlar va o‘quv jarayonlaridan lavhalar': { uz: 'IIV Xorazm Akademik Litseyida bo‘lib o‘tgan tadbirlar va o‘quv jarayonlaridan lavhalar', ru: 'Моменты мероприятий и учебного процесса в Хорезмском академическом лицее МВД', en: 'Highlights from events and learning at the MIA Khorezm Academic Lyceum' },
  'Galereya rasmlari hozircha joylanmagan.': { uz: 'Galereya rasmlari hozircha joylanmagan.', ru: 'Фотографии пока не добавлены.', en: 'No gallery photos have been added yet.' },
  'Biz Bilan Aloqaga Chiqing': { uz: 'Biz Bilan Aloqaga Chiqing', ru: 'Свяжитесь с нами', en: 'Get in touch' },
  'Litsey ma\'muriyatiga savol, taklif yoki murojaatlaringizni yo\'llashingiz mumkin.': { uz: 'Litsey ma\'muriyatiga savol, taklif yoki murojaatlaringizni yo\'llashingiz mumkin.', ru: 'Вы можете отправить администрации лицея вопрос, предложение или обращение.', en: 'Send the lyceum administration a question, suggestion, or message.' },
  'Ish vaqti': { uz: 'Ish vaqti', ru: 'Часы работы', en: 'Working hours' },
  'Bog‘lanish uchun telefon yoki emaildan kamida bittasini kiriting.': { uz: 'Bog‘lanish uchun telefon yoki emaildan kamida bittasini kiriting.', ru: 'Укажите телефон или электронную почту для связи.', en: 'Provide a phone number or email so we can contact you.' },
  'Murojaatingiz admin paneliga saqlandi.': { uz: 'Murojaatingiz admin paneliga saqlandi.', ru: 'Ваше обращение сохранено.', en: 'Your message has been saved.' },
  'Boshqaruv Paneliga Kirish': { uz: 'Boshqaruv Paneliga Kirish', ru: 'Вход в панель управления', en: 'Admin panel login' },
  'Login (Username)': { uz: 'Login (Username)', ru: 'Логин', en: 'Username' },
  'Parol': { uz: 'Parol', ru: 'Пароль', en: 'Password' },
  'Ochiq eshiklar kuni': { uz: 'Ochiq eshiklar kuni', ru: 'День открытых дверей', en: 'Open Day' },
  'Yangi xabar qo\'shish': { uz: 'Yangi xabar qo\'shish', ru: 'Добавить новость', en: 'Add a news item' },
  'Sayt sozlamalarini tahrirlash': { uz: 'Sayt sozlamalarini tahrirlash', ru: 'Изменить настройки сайта', en: 'Edit site settings' },
  'Xush kelibsiz,': { uz: 'Xush kelibsiz,', ru: 'Добро пожаловать,', en: 'Welcome,' },
  'Sayt holati va so\'nggi ma\'lumotlar bilan tanishing.': { uz: 'Sayt holati va so\'nggi ma\'lumotlar bilan tanishing.', ru: 'Обзор состояния сайта и последних данных.', en: 'Review the site status and latest activity.' },
  'Bugungi sana': { uz: 'Bugungi sana', ru: 'Сегодня', en: 'Today' },
  'Jami yangiliklar': { uz: 'Jami yangiliklar', ru: 'Всего новостей', en: 'Total news' },
  'Haftalik noyob tashriflar': { uz: 'Haftalik noyob tashriflar', ru: 'Уникальные посетители за неделю', en: 'Unique weekly visits' },
  'Tizim holati': { uz: 'Tizim holati', ru: 'Состояние системы', en: 'System status' },
  'Faol': { uz: 'Faol', ru: 'Активна', en: 'Active' },
  'Tezkor harakatlar': { uz: 'Tezkor harakatlar', ru: 'Быстрые действия', en: 'Quick actions' },
  'Tizim haqida': { uz: 'Tizim haqida', ru: 'О системе', en: 'About the system' },
  'Tizim versiyasi:': { uz: 'Tizim versiyasi:', ru: 'Версия системы:', en: 'System version:' },
  'Foydalanuvchi huquqi:': { uz: 'Foydalanuvchi huquqi:', ru: 'Права пользователя:', en: 'User role:' },
  'Xavfsizlik:': { uz: 'Xavfsizlik:', ru: 'Безопасность:', en: 'Security:' },
  '+ Yangi yangilik': { uz: '+ Yangi yangilik', ru: '+ Новая новость', en: '+ New article' },
  'Hozircha yangilik qo\'shilmagan.': { uz: 'Hozircha yangilik qo\'shilmagan.', ru: 'Новости пока не добавлены.', en: 'No news items have been added yet.' },
  'Tahrirlash': { uz: 'Tahrirlash', ru: 'Изменить', en: 'Edit' },
  'O\'chirish': { uz: 'O\'chirish', ru: 'Удалить', en: 'Delete' },
  'Onlayn murojaatlar': { uz: 'Onlayn murojaatlar', ru: 'Онлайн-обращения', en: 'Online messages' },
  'Yangi': { uz: 'Yangi', ru: 'Новое', en: 'New' },
  'O\'qilgan deb belgilash': { uz: 'O\'qilgan deb belgilash', ru: 'Отметить как прочитанное', en: 'Mark as read' },
  'Rahbariyat va xodimlar': { uz: 'Rahbariyat va xodimlar', ru: 'Руководство и сотрудники', en: 'Leadership and staff' },
  'Yangi ma\'lumot qo\'shish': { uz: 'Yangi ma\'lumot qo\'shish', ru: 'Добавить данные', en: 'Add information' },
  'Ma\'lumotni tahrirlash': { uz: 'Ma\'lumotni tahrirlash', ru: 'Изменить данные', en: 'Edit information' },
  'Qo\'shimcha ma\'lumot': { uz: 'Qo\'shimcha ma\'lumot', ru: 'Дополнительная информация', en: 'Additional information' },
  'Rahbar rasmi (900 KB gacha)': { uz: 'Rahbar rasmi (900 KB gacha)', ru: 'Фото руководителя (до 900 КБ)', en: 'Leader photo (up to 900 KB)' },
  'Rasmni olib tashlash': { uz: 'Rasmni olib tashlash', ru: 'Удалить фото', en: 'Remove photo' },
  'Yangi login (ixtiyoriy)': { uz: 'Yangi login (ixtiyoriy)', ru: 'Новый логин (необязательно)', en: 'New username (optional)' },
  'Yangi parol (ixtiyoriy)': { uz: 'Yangi parol (ixtiyoriy)', ru: 'Новый пароль (необязательно)', en: 'New password (optional)' },
  'Joriy parol': { uz: 'Joriy parol', ru: 'Текущий пароль', en: 'Current password' },
  'Yangi parolni tasdiqlash': { uz: 'Yangi parolni tasdiqlash', ru: 'Подтвердите новый пароль', en: 'Confirm new password' },
  'Ism, familiya yoki lavozim': { uz: 'Ism, familiya yoki lavozim', ru: 'Имя, фамилия или должность', en: 'Name, surname, or position' },
  'Pochta indeksi:': { uz: 'Pochta indeksi:', ru: 'Почтовый индекс:', en: 'Postal code:' },
  'O‘zbekiston Respublikasi ichki ishlar vazirligining Xorazm Akademik litseyi Rasmiy Portali': { uz: 'O‘zbekiston Respublikasi ichki ishlar vazirligining Xorazm Akademik litseyi Rasmiy Portali', ru: 'Официальный портал Хорезмского академического лицея Министерства внутренних дел Республики Узбекистан', en: 'Official portal of the Khorezm Academic Lyceum of the Ministry of Internal Affairs of the Republic of Uzbekistan' },
  'Kelajak posbonlari va bilimli yoshlarni tarbiyalash maskani. Litsey faoliyatiga oid rasmiy axborotlar va yangiliklar minbari.': { uz: 'Kelajak posbonlari va bilimli yoshlarni tarbiyalash maskani. Litsey faoliyatiga oid rasmiy axborotlar va yangiliklar minbari.', ru: 'Место воспитания будущих защитников и образованной молодёжи. Официальная информация и новости о деятельности лицея.', en: 'A place to educate future defenders and knowledgeable young people. Official information and news about the lyceum.' },
  'O‘zbekiston Respublikasi Ichki Ishlar Vazirligi Tizimidagi Muassasa': { uz: 'O‘zbekiston Respublikasi Ichki Ishlar Vazirligi Tizimidagi Muassasa', ru: 'Учреждение системы Министерства внутренних дел Республики Узбекистан', en: 'An institution within the Ministry of Internal Affairs of Uzbekistan' },
  'Dushanba - Shanba: 08:30 - 18:00': { uz: 'Dushanba - Shanba: 08:30 - 18:00', ru: 'Понедельник - суббота: 08:30 - 18:00', en: 'Monday - Saturday: 08:30 - 18:00' },
  'Ish Rejimi': { uz: 'Ish Rejimi', ru: 'Часы работы', en: 'Working hours' },
  'Masalan: admin': { uz: 'Masalan: admin', ru: 'Например: admin', en: 'For example: admin' },
  'Litseyimizdagi barcha rasmiy e\'lonlar, tadbirlar hamda muhim yangiliklar platformasi.': { uz: 'Litseyimizdagi barcha rasmiy e\'lonlar, tadbirlar hamda muhim yangiliklar platformasi.', ru: 'Площадка для официальных объявлений, мероприятий и важных новостей лицея.', en: 'A place for official announcements, events, and important lyceum news.' },
  'Batafsil va Rasmlarni Ko\'rish': { uz: 'Batafsil va Rasmlarni Ko\'rish', ru: 'Подробнее и фотографии', en: 'Details and photos' },
  'E\'lon': { uz: 'E\'lon', ru: 'Объявление', en: 'Announcement' },
  'Tadbir': { uz: 'Tadbir', ru: 'Мероприятие', en: 'Event' },
  'Yutuqlar': { uz: 'Yutuqlar', ru: 'Достижения', en: 'Achievements' },
  'Telefon:': { uz: 'Telefon:', ru: 'Телефон:', en: 'Phone:' },
  'Elektron pochta:': { uz: 'Elektron pochta:', ru: 'Электронная почта:', en: 'Email:' },
  '✅ Ariza (Onlayn portal orqali)': { uz: '✅ Ariza (Onlayn portal orqali)', ru: '✅ Заявление (через онлайн-портал)', en: '✅ Application (via online portal)' },
  '✅ Tug‘ilganlik haqida guvohnoma / ID karta nusxasi': { uz: '✅ Tug‘ilganlik haqida guvohnoma / ID karta nusxasi', ru: '✅ Копия свидетельства о рождении или ID-карты', en: '✅ Copy of birth certificate or ID card' },
  '✅ 9-sinfni bitirganligi haqida shahodatnoma (Attestat)': { uz: '✅ 9-sinfni bitirganligi haqida shahodatnoma (Attestat)', ru: '✅ Аттестат об окончании 9-го класса', en: '✅ Certificate of completion of grade 9' },
  '✅ 3x4 o‘lchamli rangli fotosurat (8 ta)': { uz: '✅ 3x4 o‘lchamli rangli fotosurat (8 ta)', ru: '✅ 8 цветных фотографий размером 3×4', en: '✅ Eight color photos, 3×4 cm' },
  '✅ Tibbiy ma’lumotnoma (086-U shakl)': { uz: '✅ Tibbiy ma’lumotnoma (086-U shakl)', ru: '✅ Медицинская справка (форма 086-У)', en: '✅ Medical certificate (form 086-U)' },
  'Rahbariyat ma\'lumotlari hali kiritilmagan.': { uz: 'Rahbariyat ma\'lumotlari hali kiritilmagan.', ru: 'Данные о руководстве пока не внесены.', en: 'Leadership information has not been added yet.' },
  'Qidiruv bo‘yicha rahbariyat ma’lumoti topilmadi.': { uz: 'Qidiruv bo‘yicha rahbariyat ma’lumoti topilmadi.', ru: 'По запросу руководство не найдено.', en: 'No leadership entries match your search.' },
  'Jami:': { uz: 'Jami:', ru: 'Всего:', en: 'Total:' },
  'O\'qilmagan:': { uz: 'O\'qilmagan:', ru: 'Не прочитано:', en: 'Unread:' },
  'Menyuni ochish': { uz: 'Menyuni ochish', ru: 'Открыть меню', en: 'Open menu' },
  'Menyuni yopish': { uz: 'Menyuni yopish', ru: 'Закрыть меню', en: 'Close menu' },
  'Super Admin': { uz: 'Super Admin', ru: 'Суперадминистратор', en: 'Super Admin' },
  'Yangilik va e’lon': { uz: 'Yangilik va e’lon', ru: 'Новости и объявления', en: 'News and announcements' },
  'Asosiy sarlavha': { uz: 'Asosiy sarlavha', ru: 'Главный заголовок', en: 'Main heading' },
  'Qisqa ta’rif': { uz: 'Qisqa ta’rif', ru: 'Краткое описание', en: 'Short description' },
  'Badge matni': { uz: 'Badge matni', ru: 'Текст значка', en: 'Badge text' },
  'About sahifasi sarlavhasi': { uz: 'About sahifasi sarlavhasi', ru: 'Заголовок страницы «О лицее»', en: 'About page heading' },
  'About sahifasi qisqa matni': { uz: 'About sahifasi qisqa matni', ru: 'Краткий текст страницы «О лицее»', en: 'About page summary' },
  'News sahifasi sarlavhasi': { uz: 'News sahifasi sarlavhasi', ru: 'Заголовок страницы новостей', en: 'News page heading' },
  'News sahifasi qisqa matni': { uz: 'News sahifasi qisqa matni', ru: 'Краткий текст страницы новостей', en: 'News page summary' },
  'Manzil': { uz: 'Manzil', ru: 'Адрес', en: 'Address' },
  'Hujjatlar': { uz: 'Hujjatlar', ru: 'Документы', en: 'Documents' },
  'Kategoriya': { uz: 'Kategoriya', ru: 'Категория', en: 'Category' },
  'Qisqacha mazmun': { uz: 'Qisqacha mazmun', ru: 'Краткое содержание', en: 'Summary' },
  'To‘liq matn': { uz: 'To‘liq matn', ru: 'Полный текст', en: 'Full text' },
  'Rasmlar': { uz: 'Rasmlar', ru: 'Фотографии', en: 'Images' },
  'F.I.Sh.': { uz: 'F.I.Sh.', ru: 'Ф.И.О.', en: 'Full name' },
  'Lavozimi': { uz: 'Lavozimi', ru: 'Должность', en: 'Position' },
  'Joriy login:': { uz: 'Joriy login:', ru: 'Текущий логин:', en: 'Current username:' },
  'O‘zgarishlarni tasdiqlash uchun joriy parol talab qilinadi.': { uz: 'O‘zgarishlarni tasdiqlash uchun joriy parol talab qilinadi.', ru: 'Для подтверждения изменений требуется текущий пароль.', en: 'Your current password is required to confirm changes.' },
  'Yangi parol kamida 12 belgidan iborat bo‘lib, katta-kichik harf, raqam va maxsus belgini o‘z ichiga olishi kerak. Faqat loginni yoki faqat parolni ham o‘zgartirish mumkin.': { uz: 'Yangi parol kamida 12 belgidan iborat bo‘lib, katta-kichik harf, raqam va maxsus belgini o‘z ichiga olishi kerak. Faqat loginni yoki faqat parolni ham o‘zgartirish mumkin.', ru: 'Новый пароль должен содержать не менее 12 символов, строчные и заглавные буквы, цифру и специальный символ. Можно изменить только логин или только пароль.', en: 'The new password must be at least 12 characters and include upper- and lowercase letters, a number, and a special character. You may change only the username or only the password.' },
  'Telefon, e-pochta, aniq manzil, ish vaqti va pochta indeksini rasmiy tasdiqlangan qiymatlar bilan to‘ldiring.': { uz: 'Telefon, e-pochta, aniq manzil, ish vaqti va pochta indeksini rasmiy tasdiqlangan qiymatlar bilan to‘ldiring.', ru: 'Укажите официально подтверждённые телефон, электронную почту, адрес, часы работы и почтовый индекс.', en: 'Enter the officially confirmed phone, email, address, working hours, and postal code.' },
  'Emailingizni kiriting': { uz: 'Emailingizni kiriting', ru: 'Введите адрес электронной почты', en: 'Enter your email address' },
  'Murojaatingizni shu yerga yozing...': { uz: 'Murojaatingizni shu yerga yozing...', ru: 'Напишите обращение здесь...', en: 'Write your message here...' },
  'Yopish (Esc)': { uz: 'Yopish (Esc)', ru: 'Закрыть (Esc)', en: 'Close (Esc)' },
  'Biriktirilgan Hujjatlar:': { uz: 'Biriktirilgan Hujjatlar:', ru: 'Прикреплённые документы:', en: 'Attached documents:' },
  'Yuklab olish': { uz: 'Yuklab olish', ru: 'Скачать', en: 'Download' },
  'Xavfsizlik': { uz: 'Xavfsizlik', ru: 'Безопасность', en: 'Security' },
  'Hozircha murojaatlar yo‘q.': { uz: 'Hozircha murojaatlar yo‘q.', ru: 'Обращений пока нет.', en: 'There are no messages yet.' },
};

interface LanguageContextValue {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue>({ language: 'uz', setLanguage: () => undefined });

function localizeDocument(language: SiteLanguage) {
  const normalize = (value: string) => value.replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim();
  const reverse = new Map<string, string>();
  for (const [original, translations] of Object.entries(messages)) {
    for (const translated of Object.values(translations)) {
      const key = normalize(translated);
      if (!reverse.has(key)) reverse.set(key, original);
    }
  }

  const elements = document.body.querySelectorAll<HTMLElement>('*');
  for (const element of elements) {
    if (element.closest('[data-no-translate],script,style,code,pre')) continue;
    for (const attribute of ['title', 'aria-label', 'placeholder', 'alt']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const original = reverse.get(normalize(value)) || value;
      const translated = messages[original]?.[language];
      if (translated && translated !== value) element.setAttribute(attribute, translated);
    }
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest('[data-no-translate],script,style,textarea,input,select,option,code,pre')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const value = node.nodeValue || '';
    const trimmed = value.trim();
    if (!trimmed) continue;
    const symbolPrefix = trimmed.match(/^([^\p{L}\p{N}]*)(.*)$/u);
    const candidate = symbolPrefix?.[2]?.trim() || trimmed;
    const original = reverse.get(normalize(candidate)) || candidate;
    const translated = messages[original]?.[language];
    if (translated && translated !== candidate) {
      node.nodeValue = value.replace(candidate, translated);
    }
  }

  document.documentElement.lang = language;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<SiteLanguage>('uz');
  const [hasLoadedLanguage, setHasLoadedLanguage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('site_language');
    const initial: SiteLanguage = saved === 'ru' || saved === 'en' ? saved : 'uz';
    setCurrentLanguage(initial);
    localizeDocument(initial);
    setHasLoadedLanguage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedLanguage) return;
    localStorage.setItem('site_language', language);
    localizeDocument(language);

    const observer = new MutationObserver(() => localizeDocument(language));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language, hasLoadedLanguage]);

  const value = useMemo(() => ({
    language,
    setLanguage: (nextLanguage: SiteLanguage) => setCurrentLanguage(nextLanguage),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
