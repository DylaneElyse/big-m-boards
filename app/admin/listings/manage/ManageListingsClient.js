"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ManageListingsClient({ listings }) {
  const router = useRouter();
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPrices, setEditingPrices] = useState({});
  const [updatingPrices, setUpdatingPrices] = useState(new Set());
  const [updateData, setUpdateData] = useState({
    updateStatus: false,
    newStatus: true
  });

  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleListingSelection = (listingId) => {
    setSelectedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedListings.size === filteredListings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(filteredListings.map(l => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/listings/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingIds: Array.from(selectedListings)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSelectedListings(new Set());
        setShowDeleteConfirm(false);
        router.refresh();
      } else {
        alert('Error deleting listings: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting listings:', error);
      alert('Error deleting listings. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!updateData.updateStatus) {
      alert('Please select status to update');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/listings/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingIds: Array.from(selectedListings),
          updateData: { is_available: updateData.newStatus }
        })
      });

      const data = await response.json();

      if (data.success) {
        setSelectedListings(new Set());
        setShowUpdateModal(false);
        setUpdateData({
          updateStatus: false,
          newStatus: true
        });
        router.refresh();
      } else {
        alert('Error updating listings: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating listings:', error);
      alert('Error updating listings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriceEdit = (listingId, currentPrice) => {
    setEditingPrices({
      ...editingPrices,
      [listingId]: currentPrice || ''
    });
  };

  const handlePriceSave = async (listingId) => {
    const newPrice = editingPrices[listingId];
    const price = parseFloat(newPrice);
    
    if (newPrice === '') {
      // Allow clearing the price
    } else if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    setUpdatingPrices(new Set(updatingPrices).add(listingId));
    
    try {
      const response = await fetch('/api/listings/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingIds: [listingId],
          updateData: { price: newPrice === '' ? null : price }
        })
      });

      const data = await response.json();

      if (data.success) {
        const newEditingPrices = { ...editingPrices };
        delete newEditingPrices[listingId];
        setEditingPrices(newEditingPrices);
        router.refresh();
      } else {
        alert('Error updating price: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error updating price. Please try again.');
    } finally {
      const newUpdatingPrices = new Set(updatingPrices);
      newUpdatingPrices.delete(listingId);
      setUpdatingPrices(newUpdatingPrices);
    }
  };

  const handlePriceCancel = (listingId) => {
    const newEditingPrices = { ...editingPrices };
    delete newEditingPrices[listingId];
    setEditingPrices(newEditingPrices);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/admin/listings"
              className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Listings
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Manage Listings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
            {selectedListings.size > 0 && (
              <span className="ml-2 text-indigo-600 font-medium">
                ({selectedListings.size} selected)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {selectedListings.size > 0 && (
            <>
              <button
                onClick={() => setShowUpdateModal(true)}
                disabled={isUpdating}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Selected
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>Delete Selected ({selectedListings.size})</>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Selection Controls */}
      {filteredListings.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedListings.size === filteredListings.length && filteredListings.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Select All ({filteredListings.length})
            </span>
          </label>
          {selectedListings.size > 0 && (
            <button
              onClick={() => setSelectedListings(new Set())}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {/* Listings Table */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search.' : 'Get started by creating a new listing.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3">
                    {/* Checkbox column */}
                  </th>
                  <th scope="col" className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedListings.has(listing.id) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedListings.has(listing.id)}
                        onChange={() => toggleListingSelection(listing.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden">
                        {listing.image_urls && listing.image_urls.length > 0 ? (
                          <Image
                            src={listing.image_urls[0]}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {listing.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingPrices.hasOwnProperty(listing.id) ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500 text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingPrices[listing.id]}
                              onChange={(e) => setEditingPrices({ ...editingPrices, [listing.id]: e.target.value })}
                              className="pl-5 w-24 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              disabled={updatingPrices.has(listing.id)}
                            />
                          </div>
                          <button
                            onClick={() => handlePriceSave(listing.id)}
                            disabled={updatingPrices.has(listing.id)}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePriceCancel(listing.id)}
                            disabled={updatingPrices.has(listing.id)}
                            className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {listing.price ? `$${listing.price}` : '—'}
                          </span>
                          <button
                            onClick={() => handlePriceEdit(listing.id, listing.price)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        listing.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.is_available ? 'Available' : 'Sold'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/listings/edit/${listing.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/listings/${listing.slug}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update {selectedListings.size} Listing{selectedListings.size !== 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-4 mb-6">
              {/* Status Update */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={updateData.updateStatus}
                    onChange={(e) => setUpdateData({ ...updateData, updateStatus: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">Update Status</span>
                </label>
                {updateData.updateStatus && (
                  <div className="ml-6 space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={updateData.newStatus === true}
                        onChange={() => setUpdateData({ ...updateData, newStatus: true })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={updateData.newStatus === false}
                        onChange={() => setUpdateData({ ...updateData, newStatus: false })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Sold
                        </span>
                      </span>
                    </label>
                  </div>
                )}
              </div>

            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateData({
                    updateStatus: false,
                    newStatus: true,
                    updatePrice: false,
                    newPrice: ''
                  });
                }}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Listings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete {selectedListings.size} listing{selectedListings.size !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
