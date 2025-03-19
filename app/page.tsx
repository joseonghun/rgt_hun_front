import BooksClient from './components/BooksClient';

export default function Home() {
  return (
    <div>
      <h1 className='font-bold'>도서 정보</h1>
      <BooksClient />
    </div>
  );
}