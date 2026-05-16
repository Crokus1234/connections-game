import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerName, score, mistakes } = body

    if (!playerName || score === undefined || mistakes === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('connections_leaderboard')
      .insert([{ player_name: playerName, score, mistakes }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save score.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('connections_leaderboard')
      .select('player_name, score, mistakes, created_at')
      .order('score', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch leaderboard.' }, { status: 500 })
    }

    return NextResponse.json({ leaderboard: data })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
