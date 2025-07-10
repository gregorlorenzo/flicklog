import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const publicRoutes = ['/login', '/signup', '/auth/callback']
    const isPublicRoute = publicRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        const { data: profile } = await supabase
            .from('Profile')
            .select('has_completed_onboarding')
            .eq('user_id', user.id)
            .single();

        const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
        const hasCompletedOnboarding = profile?.has_completed_onboarding ?? false;

        if (!hasCompletedOnboarding && !isOnboardingPage) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        if (hasCompletedOnboarding && isOnboardingPage) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return supabaseResponse
}