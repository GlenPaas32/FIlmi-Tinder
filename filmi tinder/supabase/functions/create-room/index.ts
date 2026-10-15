import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // CORS preflight päringute käsitlemine
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Luuakse Supabase klient Edge Functioni keskkonnamuutujatega
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let code = ''
        let isUnique = false
        let attempts = 0

        // Genereerime koodi ja kontrollime, et see poleks juba 'rooms' tabelis kasutusel
        while (!isUnique && attempts < 10) {
            attempts++
            code = ''
            for (let i = 0; i < 4; i++) {
                code += letters.charAt(Math.floor(Math.random() * letters.length))
            }

            const { data: existing } = await supabaseClient
                .from('rooms')
                .select('id')
                .eq('code', code)
                .maybeSingle()

            if (!existing) {
                isUnique = true
            }
        }

        if (!isUnique) {
            throw new Error('Unikaalse toakoodi genereerimine ebaõnnestus.')
        }

        // Lisame uue toa tabelisse
        const { data, error } = await supabaseClient
            .from('rooms')
            .insert([{ code }])
            .select('id, code')
            .single()

        if (error) throw error

        // Tagastame { roomId, code }
        return new Response(
            JSON.stringify({ roomId: data.id, code: data.code }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})