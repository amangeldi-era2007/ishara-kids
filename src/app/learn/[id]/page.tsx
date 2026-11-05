import { notFound } from 'next/navigation';
import { LessonPlayer } from '@/components/lesson-player';
import { lessons } from '@/lib/content';
export function generateStaticParams() { return lessons.map((lesson)=>({id:lesson.id})); }
export default async function LessonPage({ params }: { params: Promise<{id:string}> }) { const {id}=await params; const lesson=lessons.find((l)=>l.id===id); if(!lesson) notFound(); return <LessonPlayer lesson={lesson}/>; }
