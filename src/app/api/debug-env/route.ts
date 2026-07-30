import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 40) + '...' : 'UNDEFINED',
    DIRECT_URL: process.env.DIRECT_URL ? process.env.DIRECT_URL.slice(0, 40) + '...' : 'UNDEFINED',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'UNDEFINED',
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
    envKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEXTAUTH') || k.includes('DIRECT')).sort(),
  })
}
