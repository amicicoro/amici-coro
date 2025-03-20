import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function AdminCheckPage() {
  // Check if the user is authenticated as admin
  const cookieStore = cookies()
  const adminCookie = cookieStore.get("admin_authenticated")
  const isAdmin = adminCookie?.value === "true"

  // Log the cookie for debugging
  console.log("Admin cookie:", adminCookie)

  if (!isAdmin) {
    redirect("/login")
  }

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-4">Authentication Check</h1>
      <div className="p-4 bg-green-50 text-green-700 rounded-md">
        <p>You are authenticated as an admin.</p>
        <p>Cookie value: {adminCookie?.value}</p>
      </div>
    </div>
  )
}

