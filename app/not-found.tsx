import Link from 'next/link';
import {JournalHeader,JournalFooter} from './components/journal-shell';
export default function NotFound(){return <><JournalHeader/><main id="main" className="missing-page"><p className="chapter-label">Một trang chưa tìm thấy</p><h1>Trang này vẫn còn để trống.</h1><p>Có thể nó đã dời đi chỗ khác, hoặc tôi chưa sẵn sàng đưa nó ra.</p><Link className="ink-link" href="/stories">Về góc đọc chuyện ↗</Link></main><JournalFooter/></>}
