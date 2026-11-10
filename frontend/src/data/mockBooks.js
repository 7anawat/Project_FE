// ข้อมูลจำลองสำหรับแสดงหน้าหนังสือระหว่างที่ยังไม่ได้เชื่อม PostgreSQL
// เมื่อ Backend/Database พร้อมแล้ว API จะถูกใช้ก่อนโดยอัตโนมัติ
const mockBooks = [
  {
    id: 1,
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    category: 'แฟนตาซี',
    isbn: '9786161873554',
    publisher: '',
    publicationYear: 2025,
    description: 'เรื่องราวของไวโอเล็ตที่ต้องเข้าสู่สถาบันฝึกผู้ขี่มังกร และเผชิญบททดสอบที่อันตราย',
    priceTHB: 845,
    stockQuantity: 12,
    coverUrl: "https://thebookshopccs.com/cdn/shop/files/FOURTHWING.png?v=1706662241&width=1024",
    language: 'th',
  },
  {
    id: 2,
    title: 'Good Vibes, Good Life',
    author: 'Vex King',
    category: 'จิตวิทยาและพัฒนาตนเอง',
    isbn: '9786161844899',
    publisher: 'อมรินทร์ฮาวทู',
    publicationYear: 2023,
    description: 'แนวทางดูแลตัวเอง ปรับมุมมอง และสร้างนิสัยเชิงบวกเพื่อชีวิตที่ดีขึ้น',
    priceTHB: 245,
    stockQuantity: 18,
    coverUrl: null,
    language: 'th',
  },
  {
    id: 3,
    title: 'Money 101',
    author: 'จักรพงษ์ เมษพันธุ์',
    category: 'การเงิน',
    isbn: '',
    publisher: '',
    publicationYear: 2020,
    description: 'พื้นฐานการวางแผนการเงิน การออม และการจัดการเงินสำหรับชีวิตประจำวัน',
    priceTHB: 250,
    stockQuantity: 10,
    coverUrl: null,
    language: 'th',
  },
  {
    id: 4,
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'จิตวิทยาและพัฒนาตนเอง',
    isbn: '',
    publisher: '',
    publicationYear: 2018,
    description: 'วิธีสร้างนิสัยเล็ก ๆ ที่ช่วยให้เกิดการเปลี่ยนแปลงอย่างต่อเนื่อง',
    priceTHB: 329,
    stockQuantity: 8,
    coverUrl: null,
    language: 'th',
  },
  {
    id: 5,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    category: 'วรรณกรรม',
    isbn: '',
    publisher: '',
    publicationYear: 1943,
    description: 'วรรณกรรมคลาสสิกที่เล่าเรื่องมิตรภาพ ความรัก และการมองโลกผ่านหัวใจ',
    priceTHB: 195,
    stockQuantity: 6,
    coverUrl: null,
    language: 'th',
  },
  {
    id: 6,
    title: 'Harry Potter and the Philosopher’s Stone',
    author: 'J. K. Rowling',
    category: 'แฟนตาซี',
    isbn: '',
    publisher: '',
    publicationYear: 1997,
    description: 'การผจญภัยครั้งแรกของแฮร์รี่ พอตเตอร์ ในโลกเวทมนตร์',
    priceTHB: 320,
    stockQuantity: 9,
    coverUrl: null,
    language: 'th',
  },
  {
    id: 7,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    category: 'การเงิน',
    isbn: '',
    publisher: '',
    publicationYear: 2020,
    description: 'บทเรียนเกี่ยวกับพฤติกรรม ความคิด และการตัดสินใจเรื่องเงิน',
    priceTHB: 295,
    stockQuantity: 7,
    coverUrl: null,
    language: 'th',
  },
  {
    id: 8,
    title: 'Ikigai',
    author: 'Héctor García และ Francesc Miralles',
    category: 'จิตวิทยาและพัฒนาตนเอง',
    isbn: '',
    publisher: '',
    publicationYear: 2016,
    description: 'แนวคิดการค้นหาความหมายและเหตุผลในการใช้ชีวิตในแต่ละวัน',
    priceTHB: 225,
    stockQuantity: 11,
    coverUrl: "https://books.google.com/books/publisher/content?id=b6-MEAAAQBAJ&img=1&imgtk=AFLRE72NXAUN0mTpWsq1uhMNhGGT717mzYOGm8zZFWmebEQVSI6au4MVcA95A5bxTz6Yuv_LAyaoGjIuUVXv3v0ragEdZz8MUxjDDIfTYyC_2pkajgzM0mgT7TtvJRI2sR62o4eCQ_NX&printsec=frontcover&zoom=1",
    language: 'th',
  },
];

export function findMockBook(id) {
  return mockBooks.find(book => String(book.id) === String(id)) || null;
}

export function getMockBooks(q = '', category = '') {
  const keyword = q.trim().toLocaleLowerCase();
  return mockBooks.filter(book =>
    (!category || book.category === category) &&
    (!keyword || book.title.toLocaleLowerCase().includes(keyword) || book.author.toLocaleLowerCase().includes(keyword))
  );
}

export default mockBooks;
