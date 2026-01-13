import Link from 'next/link'

export default function ConfirmEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
          <p className="mt-2 text-gray-600">
            We've sent a confirmation link to your email address. 
            Please click the link to verify your account and complete your registration.
          </p>
          <p className="mt-4 text-gray-600">
            If you don't see the email, check your spam folder or 
            <Link href="/signup" className="ml-1 text-blue-600 hover:underline">
              try signing up again
            </Link>.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}