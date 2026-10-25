import Link from 'next/link';
import {JournalHeader,JournalFooter} from './components/journal-shell';
export default function NotFound(){return <><JournalHeader/><main id="main" className="missing-page"><p className="chapter-label">Một trang chưa tìm thấy</p><h1>Phần này vẫn còn để ngỏ.</h1><p>Trang có thể đã chuyển đi, hoặc chưa sẵn sàng để chia sẻ.</p><Link className="ink-link" href="/stories">Về góc đọc chuyện ↗</Link></main><JournalFooter/></>}
