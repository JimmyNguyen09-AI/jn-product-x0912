'use client';
import Link from "next/link";
import {InkButton} from './components/motion-system';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="missing-page"><p className="chapter-label">Một khoảng dừng ngắn</p><h1>Chưa mở được trang này.</h1><p>Câu chuyện vẫn ở đây. Bạn thử lại nhé.</p><InkButton className="ink-button" onClick={reset}>Thử lại</InkButton><Link className="ink-link" href="/stories">Trở lại góc đọc chuyện</Link></main>}
