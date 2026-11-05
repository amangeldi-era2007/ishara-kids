'use client';
import Link from 'next/link';
import { SectionIntro, useProgress, useWords } from '@/components/app-shell';
import { t } from '@/lib/content';
import { badges, totalStars } from '@/lib/progress';
const badgeInfo = [
  { id:'first', icon:'🌱',name:t('Первый шаг','Алғашқы қадам'),desc:t('Заверши первый урок','Бірінші сабақты аяқта') },
  { id:'unit',icon:'🎨',name:t('Мастер открытий','Жаңалық шебері'),desc:t('Заверши первую главу','Бірінші тарауды аяқта') },
  { id:'explorer',icon:'🧭',name:t('Исследователь','Зерттеуші'),desc:t('Заверши все демо-уроки','Барлық демо-сабақты аяқта') },
  { id:'play',icon:'🎲',name:t('Друг игр','Ойын досы'),desc:t('Сыграй в две игры','Екі ойын ойна') },
];
export default function RewardsPage() { const w=useWords(); const {progress}=useProgress(); const earned=badges(progress); return <div className="container"><SectionIntro eyebrow={t('Маленькие победы','Кішкентай жеңістер')} title={t('Твои награды','Сенің марапаттарың')} description={t('Каждый шаг важен. Здесь живут звёзды и памятные значки!','Әр қадам маңызды. Мұнда жұлдыздар мен белгілер сақталады!')} /><div className="stat-row"><div className="stat"><strong>⭐ {totalStars(progress)}</strong>{w(t('звёзд','жұлдыз'))}</div><div className="stat"><strong>{Object.keys(progress.completed).length}</strong>{w(t('уроков','сабақ'))}</div><div className="stat"><strong>{earned.filter((b)=>b.unlocked).length}/{earned.length}</strong>{w(t('значков','белгі'))}</div></div><section className="section"><h2>{w(t('Коллекция значков','Белгілер жинағы'))}</h2><div className="grid two">{badgeInfo.map((item)=><div key={item.id} className={`card badge${earned.find((b)=>b.id===item.id)?.unlocked?'':' unearned'}`}><span className="badge-icon" aria-hidden="true">{item.icon}</span><span className="status">{earned.find((b)=>b.id===item.id)?.unlocked?w(t('Открыто!','Ашылды!')):w(t('Скоро откроется','Жақында ашылады'))}</span><h3 style={{ marginTop:12 }}>{w(item.name)}</h3><p>{w(item.desc)}</p></div>)}</div></section><Link className="btn btn-primary" href="/learn">{w(t('Продолжить путь','Саяхатты жалғастыру'))} →</Link></div>; }
