import CreateListingForm from './CreateListingForm';

export default function NewListingPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Create New Listing
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the details below to add a new item to the database.
        </p>
      </div>
      
      <CreateListingForm />
    </main>
  );
}