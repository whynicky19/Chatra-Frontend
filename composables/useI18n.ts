import { ref, computed } from 'vue'

type Lang = 'ru' | 'en' | 'kk'

const _lang = ref<Lang>('ru')

if (import.meta.client) {
  const saved = localStorage.getItem('_lang') as Lang
  if (saved === 'en' || saved === 'ru' || saved === 'kk') _lang.value = saved
}

export const translations: Record<string, Record<Lang, string>> = {
  // Sidebar
  'nav.chats': { ru: 'Чаты', en: 'Chats', kk: 'Чаттар' },
  'nav.classes': { ru: 'Классы', en: 'Classes', kk: 'Сыныптар' },
  'nav.participants': { ru: 'Участники', en: 'Participants', kk: 'Қатысушылар' },
  'nav.ai': { ru: 'ИИ Ассистент', en: 'AI Assistant', kk: 'ЖИ Көмекші' },
  'nav.settings': { ru: 'Настройки', en: 'Settings', kk: 'Параметрлер' },
  'nav.online': { ru: 'Онлайн', en: 'Online', kk: 'Желіде' },
  'nav.logout': { ru: 'Выйти', en: 'Logout', kk: 'Шығу' },

  // Settings
  'settings.title': { ru: 'Настройки аккаунта', en: 'Account Settings', kk: 'Аккаунт параметрлері' },
  'settings.personal': { ru: 'Личная информация', en: 'Personal Info', kk: 'Жеке ақпарат' },
  'settings.notifications': { ru: 'Уведомления', en: 'Notifications', kk: 'Хабарламалар' },
  'settings.appearance': { ru: 'Внешний вид', en: 'Appearance', kk: 'Сыртқы түр' },
  'settings.security': { ru: 'Безопасность', en: 'Security', kk: 'Қауіпсіздік' },
  'settings.profile_details': { ru: 'Данные профиля', en: 'Profile Details', kk: 'Профиль деректері' },
  'settings.profile_sub': { ru: 'Управляйте публичной информацией и цифровой идентификацией.', en: 'Manage your public information and digital identity.', kk: 'Жалпыға ортақ ақпаратты және цифрлық жеке басыңызды басқарыңыз.' },
  'settings.save': { ru: 'Сохранить изменения', en: 'Save Changes', kk: 'Өзгерістерді сақтау' },
  'settings.full_name': { ru: 'ПОЛНОЕ ИМЯ', en: 'FULL NAME', kk: 'ТОЛЫҚ АТЫ' },
  'settings.email': { ru: 'EMAIL АДРЕС', en: 'EMAIL ADDRESS', kk: 'EMAIL МЕКЕНЖАЙЫ' },
  'settings.role': { ru: 'РОЛЬ', en: 'ROLE', kk: 'РӨЛІ' },
  'settings.institution': { ru: 'ОРГАНИЗАЦИЯ', en: 'INSTITUTION', kk: 'ҰЙЫМ' },
  'settings.preferences': { ru: 'Настройки', en: 'Preferences', kk: 'Баптаулар' },
  'settings.email_notif': { ru: 'Email уведомления', en: 'Email Notifications', kk: 'Email хабарламалары' },
  'settings.email_notif_sub': { ru: 'Обновления курсов и сообщения', en: 'Course updates and messages', kk: 'Курс жаңартулары мен хабарлар' },
  'settings.ai_insights': { ru: 'ИИ-аналитика', en: 'AI Insights', kk: 'ЖИ-аналитика' },
  'settings.ai_insights_sub': { ru: 'Персонализированные учебные оповещения', en: 'Personalized learning alerts', kk: 'Жеке оқу ескертулері' },
  'settings.desktop_popups': { ru: 'Всплывающие уведомления', en: 'Desktop Popups', kk: 'Қалқымалы хабарламалар' },
  'settings.desktop_popups_sub': { ru: 'Активность чата в реальном времени', en: 'Real-time chat activity', kk: 'Чаттың нақты уақыттағы белсенділігі' },
  'settings.light_mode': { ru: 'Светлая', en: 'Light Mode', kk: 'Жарық режим' },
  'settings.dark_mode': { ru: 'Тёмная', en: 'Dark Mode', kk: 'Қараңғы режим' },
  'settings.follow_system': { ru: 'Следовать настройкам системы', en: 'Follow system preferences', kk: 'Жүйе параметрлерін орындау' },
  'settings.deactivate': { ru: 'Деактивировать аккаунт', en: 'Deactivate Account', kk: 'Аккаунтты өшіру' },
  'settings.deactivate_sub': { ru: 'Это действие постоянно и не может быть отменено.', en: 'This action is permanent and cannot be undone.', kk: 'Бұл әрекет тұрақты және кері қайтарылмайды.' },
  'settings.start_process': { ru: 'Начать процесс', en: 'Start Process', kk: 'Процесті бастау' },
  'settings.nickname': { ru: 'Никнейм', en: 'Nickname', kk: 'Лақап ат' },
  'settings.nick_placeholder': { ru: 'Ваш ник...', en: 'Your nickname...', kk: 'Лақап атыңыз...' },
  'settings.nick_save': { ru: 'Сохранить ник', en: 'Save Nickname', kk: 'Лақап атты сақтау' },
  'settings.nick_ok': { ru: '✓ Доступен', en: '✓ Available', kk: '✓ Қолжетімді' },
  'settings.nick_err': { ru: '✕ Занят', en: '✕ Taken', kk: '✕ Алынған' },
  'settings.nick_saved': { ru: 'Ник сохранён', en: 'Nickname saved', kk: 'Лақап ат сақталды' },
  'settings.avatar_updated': { ru: 'Аватар обновлён', en: 'Avatar updated', kk: 'Аватар жаңартылды' },
  'settings.nick_check': { ru: 'Проверьте никнейм', en: 'Check nickname', kk: 'Лақап атты тексеру' },
  'settings.language': { ru: 'Язык', en: 'Language', kk: 'Тіл' },
  'settings.student': { ru: 'Студент', en: 'Student', kk: 'Студент' },
  'settings.admin': { ru: 'Администратор', en: 'Admin', kk: 'Әкімші' },
  'settings.member': { ru: 'Участник', en: 'Member', kk: 'Мүше' },
  'settings.chatra_academy': { ru: 'Академия Чатра', en: 'Chatra Academy', kk: 'Чатра Академиясы' },

  // Chats
  'chats.title': { ru: 'Чаты', en: 'Chats', kk: 'Чаттар' },
  'chats.search': { ru: 'Поиск по email...', en: 'Search by email...', kk: 'Email бойынша іздеу...' },
  'chats.no_chats': { ru: 'Нет чатов', en: 'No chats', kk: 'Чаттар жоқ' },
  'chats.no_chats_sub': { ru: 'Найдите пользователя по email', en: 'Find a user by email', kk: 'Email бойынша пайдаланушы табыңыз' },
  'chats.select': { ru: 'Выберите чат', en: 'Select a chat', kk: 'Чат таңдаңыз' },
  'chats.select_sub': { ru: 'Или найдите пользователя по email выше', en: 'Or find a user by email above', kk: 'Немесе жоғарыдан email бойынша пайдаланушы табыңыз' },
  'chats.users_found': { ru: 'Пользователи', en: 'Users', kk: 'Пайдаланушылар' },
  'chats.no_users': { ru: 'Пользователи не найдены', en: 'No users found', kk: 'Пайдаланушылар табылмады' },
  'chats.no_messages': { ru: 'Нет сообщений', en: 'No messages', kk: 'Хабарлар жоқ' },
  'chats.new_group': { ru: 'Новый групповой чат', en: 'New Group Chat', kk: 'Жаңа топтық чат' },
  'chats.group_name': { ru: 'Название чата...', en: 'Chat name...', kk: 'Чат атауы...' },
  'chats.cancel': { ru: 'Отмена', en: 'Cancel', kk: 'Болдырмау' },
  'chats.create': { ru: 'Создать', en: 'Create', kk: 'Жасау' },
  'chats.new_request': { ru: '+ Новый запрос', en: '+ New Request', kk: '+ Жаңа сұраныс' },
  'chats.recent': { ru: 'Последние обсуждения', en: 'Recent', kk: 'Соңғы талқылаулар' },
  'chats.archive': { ru: 'Архив', en: 'Archive', kk: 'Мұрағат' },
  'chats.requests': { ru: 'Запросы', en: 'Requests', kk: 'Сұраныстар' },
  'chats.personal': { ru: 'ЛИЧНЫЕ СООБЩЕНИЯ', en: 'PERSONAL MESSAGES', kk: 'ЖЕКЕ ХАБАРЛАР' },
  'chats.search_placeholder': { ru: 'Поиск обсуждений...', en: 'Search discussions...', kk: 'Талқылауларды іздеу...' },
  'chats.input_placeholder': { ru: 'Введите ваш запрос здесь...', en: 'Type your message here...', kk: 'Хабарыңызды осында жазыңыз...' },
  'chats.created': { ru: 'Чат создан', en: 'Chat created', kk: 'Чат жасалды' },
  'chats.error': { ru: 'Ошибка', en: 'Error', kk: 'Қате' },
  'chats.support': { ru: 'Поддержка', en: 'Support', kk: 'Қолдау' },
  'chats.help_center': { ru: 'Центр помощи', en: 'Help Center', kk: 'Көмек орталығы' },

  // Classes
  'classes.title': { ru: 'Классы', en: 'Classes', kk: 'Сыныптар' },
  'classes.catalog': { ru: 'Классы', en: 'Classes', kk: 'Сыныптар' },
  'classes.catalog_sub': { ru: 'Управляйте вашим обучением и исследуйте новые интеллектуальные путешествия.', en: 'Manage your learning and explore new intellectual journeys.', kk: 'Оқуыңызды басқарыңыз және жаңа зияткерлік жолдарды зерттеңіз.' },
  'classes.create': { ru: 'Создать класс', en: 'Create Class', kk: 'Сынып жасау' },
  'classes.join_code': { ru: 'Войти по коду', en: 'Join by Code', kk: 'Кодпен кіру' },
  'classes.no_classes': { ru: 'У вас нет классов', en: 'You have no classes', kk: 'Сізде сыныптар жоқ' },
  'classes.no_classes_teacher': { ru: 'Нет классов', en: 'No classes', kk: 'Сыныптар жоқ' },
  'classes.no_classes_sub_student': { ru: 'Введите код класса, чтобы присоединиться', en: 'Enter a class code to join', kk: 'Қосылу үшін сынып кодын енгізіңіз' },
  'classes.no_classes_sub_teacher': { ru: 'Создайте первый класс для студентов', en: 'Create the first class for students', kk: 'Студенттер үшін бірінші сыныпты жасаңыз' },
  'classes.open': { ru: 'Открыть →', en: 'Open →', kk: 'Ашу →' },
  'classes.lectures_count': { ru: 'лекций', en: 'lectures', kk: 'дәріс' },
  'classes.join_title': { ru: 'Войти в класс по коду', en: 'Join Class by Code', kk: 'Кодпен сыныпқа кіру' },
  'classes.join_hint': { ru: 'Введите 6-значный код класса, который вам дал преподаватель', en: 'Enter the 6-digit class code given by your teacher', kk: 'Мұғалімнің берген 6 таңбалы сынып кодын енгізіңіз' },
  'classes.join': { ru: 'Войти в класс', en: 'Join Class', kk: 'Сыныпқа кіру' },
  'classes.delete_title': { ru: 'Удалить класс', en: 'Delete Class', kk: 'Сыныпты жою' },
  'classes.delete_confirm': { ru: 'Вы уверены, что хотите удалить класс', en: 'Are you sure you want to delete class', kk: 'Сыныпты жойғыңыз келетініне сенімдісіз бе' },
  'classes.delete_warn': { ru: 'Это действие нельзя отменить.', en: 'This action cannot be undone.', kk: 'Бұл әрекетті кері қайтару мүмкін емес.' },
  'classes.delete': { ru: 'Удалить', en: 'Delete', kk: 'Жою' },
  'classes.request_new': { ru: 'Запросить новый класс', en: 'Request New Class', kk: 'Жаңа сынып сұрату' },
  'classes.request_sub': { ru: 'Поговорите со своим куратором о расширении вашей учебной программы', en: 'Talk to your supervisor about expanding your curriculum', kk: 'Оқу бағдарламаңызды кеңейту туралы кураторыңызбен сөйлесіңіз' },
  'classes.upcoming': { ru: 'БЛИЖАЙШИЕ СРОКИ', en: 'UPCOMING DEADLINES', kk: 'ЖАҚЫН МЕРЗІМДЕР' },
  'classes.academic_year': { ru: 'АКАДЕМИЧЕСКИЙ ГОД 2024', en: 'ACADEMIC YEAR 2024', kk: '2024 ОҚУ ЖЫЛЫ' },
  'classes.course': { ru: 'Курс', en: 'Course', kk: 'Курс' },
  'classes.left': { ru: 'покинуть', en: 'leave', kk: 'шығу' },
  'classes.left_ok': { ru: 'Вы покинули класс', en: 'You left the class', kk: 'Сіз сыныпты тастадыңыз' },
  'classes.joined': { ru: 'Вы вошли в класс:', en: 'You joined class:', kk: 'Сіз сыныпқа кірдіңіз:' },
  'classes.not_found': { ru: 'Класс с таким кодом не найден. Проверьте код.', en: 'Class with this code not found. Check the code.', kk: 'Бұл кодпен сынып табылмады. Кодты тексеріңіз.' },

  // Class detail
  'class.lectures': { ru: 'Лекции', en: 'Lectures', kk: 'Дәрістер' },
  'class.materials': { ru: 'Материалы', en: 'Materials', kk: 'Материалдар' },
  'class.assignments': { ru: 'Задания', en: 'Assignments', kk: 'Тапсырмалар' },
  'class.ai_chat': { ru: 'ИИ-чат', en: 'AI Chat', kk: 'ЖИ-чат' },
  'class.no_lectures': { ru: 'Лекций пока нет', en: 'No lectures yet', kk: 'Дәріс әлі жоқ' },
  'class.no_lectures_teacher': { ru: 'Нажмите «Добавить» чтобы опубликовать первую лекцию', en: 'Click "Add" to publish the first lecture', kk: 'Бірінші дәрісті жариялау үшін «Қосу» батырмасын басыңыз' },
  'class.no_lectures_student': { ru: 'Преподаватель добавит материалы', en: 'Teacher will add materials', kk: 'Мұғалім материалдар қосады' },
  'class.no_materials': { ru: 'Материалов пока нет', en: 'No materials yet', kk: 'Материалдар әлі жоқ' },
  'class.no_materials_teacher': { ru: 'Нажмите «Добавить» чтобы добавить ресурс', en: 'Click "Add" to add a resource', kk: 'Ресурс қосу үшін «Қосу» батырмасын басыңыз' },
  'class.no_assignments': { ru: 'Заданий пока нет', en: 'No assignments yet', kk: 'Тапсырмалар әлі жоқ' },
  'class.no_assignments_teacher': { ru: 'Нажмите «Задание» чтобы создать первое', en: 'Click "Assignment" to create the first one', kk: 'Бірінші тапсырманы жасау үшін «Тапсырма» батырмасын басыңыз' },
  'class.no_assignments_student': { ru: 'Учитель добавит задания', en: 'Teacher will add assignments', kk: 'Мұғалім тапсырмалар қосады' },
  'class.add': { ru: 'Добавить', en: 'Add', kk: 'Қосу' },
  'class.assignment_btn': { ru: 'Задание', en: 'Assignment', kk: 'Тапсырма' },
  'class.code': { ru: 'Код:', en: 'Code:', kk: 'Код:' },
  'class.code_copied': { ru: 'Код скопирован:', en: 'Code copied:', kk: 'Код көшірілді:' },
  'class.back': { ru: 'Назад', en: 'Back', kk: 'Артқа' },
  'class.in_progress': { ru: 'В ПРОЦЕССЕ', en: 'IN PROGRESS', kk: 'ҮДЕРІСТЕ' },
  'class.overdue': { ru: 'ПРОСРОЧЕНО', en: 'OVERDUE', kk: 'МЕРЗІМІ ӨТКЕН' },
  'class.not_started': { ru: 'НЕ НАЧАТО', en: 'NOT STARTED', kk: 'БАСТАЛМАҒАН' },
  'class.submit_late': { ru: 'СДАТЬ С ОПОЗДАНИЕМ', en: 'SUBMIT LATE', kk: 'КЕШІГІП ТАПСЫРУ' },
  'class.continue': { ru: 'Продолжить работу →', en: 'Continue work →', kk: 'Жұмысты жалғастыру →' },
  'class.preview': { ru: 'Предпросмотр задания', en: 'Preview assignment', kk: 'Тапсырманы алдын ала қарау' },
  'class.your_rating': { ru: 'ВАШ РЕЙТИНГ', en: 'YOUR RATING', kk: 'СІЗДІҢ РЕЙТИНГІҢІЗ' },
  'class.pts': { ru: 'PTS', en: 'PTS', kk: 'ҰПА' },
  'class.progress': { ru: 'ПРОГРЕСС КУРСА', en: 'COURSE PROGRESS', kk: 'КУРС ҮДЕРІСІ' },
  'class.performance': { ru: 'УСПЕВАЕМОСТЬ', en: 'PERFORMANCE', kk: 'ҮЛГЕРІМ' },
  'class.next_deadline': { ru: 'СЛЕДУЮЩИЙ СРОК', en: 'NEXT DEADLINE', kk: 'КЕЛЕСІ МЕРЗІМ' },
  'class.add_calendar': { ru: 'ДОБАВИТЬ В КАЛЕНДАРЬ', en: 'ADD TO CALENDAR', kk: 'КҮНТІЗБЕГЕ ҚОСУ' },
  'class.ai_guide': { ru: 'ИИ Учебный гид', en: 'AI Learning Guide', kk: 'ЖИ Оқу нұсқаулығы' },
  'class.sort_deadline': { ru: 'СОРТИРОВКА: ПО СРОКУ', en: 'SORT: BY DEADLINE', kk: 'СҰРЫПТАУ: МЕРЗІМ БОЙЫНША' },
  'class.pending': { ru: 'В ожидании', en: 'Pending', kk: 'Күтуде' },
  'class.done': { ru: 'Завершено', en: 'Done', kk: 'Аяқталды' },
  'class.late': { ru: 'Просрочено', en: 'Overdue', kk: 'Мерзімі өткен' },
  'class.avg_score': { ru: 'Средний балл', en: 'Avg Score', kk: 'Орташа балл' },
  'class.delete_assignment': { ru: 'Задание удалено', en: 'Assignment deleted', kk: 'Тапсырма жойылды' },
  'class.delete_post': { ru: 'Удалено', en: 'Deleted', kk: 'Жойылды' },
  'class.lecture_badge': { ru: 'Лекция', en: 'Lecture', kk: 'Дәріс' },
  'class.material_badge': { ru: 'Материал', en: 'Material', kk: 'Материал' },
  'class.files': { ru: 'файл', en: 'file', kk: 'файл' },
  'class.files2': { ru: 'файла', en: 'files', kk: 'файл' },
  'class.files5': { ru: 'файлов', en: 'files', kk: 'файл' },
  'class.invite': { ru: 'Пригласить', en: 'Invite', kk: 'Шақыру' },
  'class.curriculum_pdf': { ru: 'Программа курса (PDF)', en: 'Course Program (PDF)', kk: 'Курс бағдарламасы (PDF)' },
  'class.tab_dashboard': { ru: 'Панель управления', en: 'Dashboard', kk: 'Басқару тақтасы' },
  'class.tab_assignments': { ru: 'Задания курса', en: 'Course Assignments', kk: 'Курс тапсырмалары' },
  'class.tab_calendar': { ru: 'Календарь', en: 'Calendar', kk: 'Күнтізбе' },

  // Login / Register
  'login.welcome': { ru: 'Добро пожаловать', en: 'Welcome Back', kk: 'Қош келдіңіз' },
  'login.sub': { ru: 'Войдите в свой аккаунт', en: 'Sign in to your account', kk: 'Аккаунтыңызға кіріңіз' },
  'login.password': { ru: 'Пароль', en: 'Password', kk: 'Құпия сөз' },
  'login.submit': { ru: 'Войти', en: 'Sign In', kk: 'Кіру' },
  'login.no_account': { ru: 'Нет аккаунта?', en: "Don't have an account?", kk: 'Аккаунт жоқ па?' },
  'login.register': { ru: 'Зарегистрироваться', en: 'Sign Up', kk: 'Тіркелу' },
  'login.error': { ru: 'Неверный email или пароль', en: 'Invalid email or password', kk: 'Email немесе құпия сөз қате' },

  // Register
  'register.title': { ru: 'Создать аккаунт', en: 'Create Account', kk: 'Аккаунт жасау' },
  'register.sub': { ru: 'Заполните данные для регистрации', en: 'Fill in your details to register', kk: 'Тіркелу үшін деректерді толтырыңыз' },
  'register.fullname': { ru: 'ФИО', en: 'Full Name', kk: 'Толық аты-жөні' },
  'register.fullname_placeholder': { ru: 'Иванов Иван Иванович', en: 'John Michael Smith', kk: 'Иванов Иван Иванович' },
  'register.fullname_err': { ru: 'Введите фамилию и имя', en: 'Enter first and last name', kk: 'Тегі мен атын енгізіңіз' },
  'register.email_invalid': { ru: '✕ Только gmail.com или icloud.com', en: '✕ Only gmail.com or icloud.com', kk: '✕ Тек gmail.com немесе icloud.com' },
  'register.email_ok': { ru: '✓ Email корректный', en: '✓ Email is valid', kk: '✓ Email дұрыс' },
  'register.email_required': { ru: 'Введите email', en: 'Enter your email', kk: 'Email енгізіңіз' },
  'register.pw_placeholder': { ru: 'Минимум 6 символов', en: 'At least 6 characters', kk: 'Кемінде 6 таңба' },
  'register.submit': { ru: 'Зарегистрироваться', en: 'Create Account', kk: 'Тіркелу' },
  'register.has_account': { ru: 'Уже есть аккаунт?', en: 'Already have an account?', kk: 'Аккаунтыңыз бар ма?' },
  'register.login_link': { ru: 'Войти', en: 'Sign In', kk: 'Кіру' },
  'register.pw_weak': { ru: 'Слабый', en: 'Weak', kk: 'Әлсіз' },
  'register.pw_medium': { ru: 'Средний', en: 'Medium', kk: 'Орташа' },
  'register.pw_strong': { ru: 'Надёжный', en: 'Strong', kk: 'Сенімді' },

  // General
  'general.loading': { ru: 'Загрузка...', en: 'Loading...', kk: 'Жүктелуде...' },
  'general.error': { ru: 'Ошибка', en: 'Error', kk: 'Қате' },
  'general.cancel': { ru: 'Отмена', en: 'Cancel', kk: 'Болдырмау' },
  'general.save': { ru: 'Сохранить', en: 'Save', kk: 'Сақтау' },
  'general.delete': { ru: 'Удалить', en: 'Delete', kk: 'Жою' },
  'general.close': { ru: 'Закрыть', en: 'Close', kk: 'Жабу' },
  'general.name': { ru: 'Название', en: 'Name', kk: 'Атауы' },
  'general.today': { ru: 'СЕГОДНЯ', en: 'TODAY', kk: 'БҮГІН' },
  'general.online': { ru: 'В сети', en: 'Online', kk: 'Желіде' },
  'general.search': { ru: 'Поиск...', en: 'Search...', kk: 'Іздеу...' },
}

export const useI18n = () => {
  const lang = _lang

  const t = (key: string): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang.value] || entry['ru'] || key
  }

  const setLang = (l: Lang) => {
    lang.value = l
    if (import.meta.client) localStorage.setItem('_lang', l)
  }

  return { t, lang, setLang }
}
