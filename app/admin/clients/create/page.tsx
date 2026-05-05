// ABOUTME: Admin page to create new client gallery
// ABOUTME: Form to set up private client photo gallery with access controls

import ClientGalleryForm from '@/components/sol/admin/ClientGalleryForm'

export default function CreateClientGalleryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Client Gallery
        </h1>
        <p className="mt-2 text-gray-600">
          Create a private gallery to share photos with your client
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <ClientGalleryForm />
      </div>
    </div>
  )
}
