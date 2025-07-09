import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function RootRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const personalSpace = await prisma.space.findFirst({
    where: {
      owner_id: user.id,
      type: 'PERSONAL',
    },
    select: {
      id: true,
    },
  });

  if (!personalSpace) {
    console.error(`CRITICAL: Personal space not found for user ${user.id}.`);
    return redirect('/spaces/new');
  }

  redirect(`/spaces/${personalSpace.id}`);
}