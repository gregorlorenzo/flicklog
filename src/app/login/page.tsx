import { login } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    const { error, message } = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button formAction={login} className="w-full">
                            Login
                        </Button>
                        {/* We'll add a link to signup later */}
                    </form>
                    {error && (
                        <p className="mt-4 rounded-md border border-destructive bg-destructive/10 p-2 text-center text-sm text-destructive">
                            {error}
                        </p>
                    )}
                    {message && (
                        <p className="mt-4 rounded-md border border-border bg-muted/50 p-2 text-center text-sm text-muted-foreground">
                            {message}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}