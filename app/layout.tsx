import type { Metadata } from 'next';
export const metadata: Metadata = {title:'VSix Assistant',description:'Investor education and team toolkit with optional Gemini AI.'};
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body style={{margin:0}}>{children}</body></html>; }
