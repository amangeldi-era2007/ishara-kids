'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container section" role="alert"><div className="card"><h1>Что-то пошло не так / Қате пайда болды</h1><p>Попробуй снова / Қайталап көр.</p><button type="button" className="btn btn-primary" onClick={reset}>Повторить / Қайталау</button></div></div>; }
