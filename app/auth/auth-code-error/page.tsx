
import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-500">Authentication Error</h1>
            <p className="mb-6 text-gray-600">
                There was an problem signing you in. The verification code may have expired or is invalid.
            </p>
            <Link
                href="/login"
                className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
            >
                Return to Login
            </Link>
        </div>
    )
}
