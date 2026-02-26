const colors: Record<string, string> = {
  'Not Contacted':  'bg-gray-100 text-gray-600',
  'Outreach Sent':  'bg-blue-100 text-blue-700',
  'Follow Up Sent': 'bg-yellow-100 text-yellow-700',
  'In Conversation':'bg-purple-100 text-purple-700',
  'Confirmed':      'bg-green-100 text-green-700',
  'Declined':       'bg-red-100 text-red-700',
  'No Response':    'bg-orange-100 text-orange-700',
  'Recorded':       'bg-teal-100 text-teal-700',
  'Published':      'bg-indigo-100 text-indigo-700',
  // Partner statuses
  'Prospecting':    'bg-gray-100 text-gray-600',
  'In Discussion':  'bg-blue-100 text-blue-700',
  'Agreement Sent': 'bg-yellow-100 text-yellow-700',
  'Active':         'bg-green-100 text-green-700',
  'Completed':      'bg-indigo-100 text-indigo-700',
  // Asset statuses
  'Draft':          'bg-gray-100 text-gray-600',
  'In Review':      'bg-yellow-100 text-yellow-700',
  'Approved':       'bg-green-100 text-green-700',
  'Scheduled':      'bg-blue-100 text-blue-700',
  'Posted':         'bg-indigo-100 text-indigo-700',
  'Archived':       'bg-gray-100 text-gray-500',
}

export default function StatusBadge({ status }: { status: string }) {
  const cls = colors[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
