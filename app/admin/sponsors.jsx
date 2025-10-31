const ET_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
});

function formatEt(date) {
  if (!date) return '-';
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return '-';
  return `${ET_FORMATTER.format(target)} ET`;
}

export default function AdminSponsorApplications({ applications }) {
  if (!applications?.length) {
    return (
      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
        <h2 className="font-semibold mb-2">Sponsor Applications</h2>
        <p className="text-sm text-gray-400">No sponsorship submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Sponsor Applications</h2>
        <span className="text-xs text-gray-400">
          Showing {applications.length} most recent
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-200">
          <thead className="text-xs uppercase text-gray-400">
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left">Creator</th>
              <th className="px-3 py-2 text-left">Platform</th>
              <th className="px-3 py-2 text-left">Eligibility</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Proof</th>
              <th className="px-3 py-2 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-white/5 align-top">
                <td className="px-3 py-2">
                  <div className="font-semibold text-gray-100">
                    {app.user?.name || 'Unknown user'}
                  </div>
                  <div className="text-xs text-gray-500">{app.user?.email || 'N/A'}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs text-gray-400">meets 1k+?</div>
                  <div className="font-semibold">
                    {app.platformStatus === 'yes' ? 'Yes' : 'Other'}
                  </div>
                  {app.platformStatus === 'other' && app.platformDetails ? (
                    <div className="text-xs text-gray-400 break-words">{app.platformDetails}</div>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <div className="text-xs text-gray-400">10m+ videos</div>
                  <div className={`font-semibold ${app.postsLongVideos ? 'text-emerald-400' : 'text-red-300'}`}>
                    {app.postsLongVideos ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Relevant content</div>
                  <div className={`font-semibold ${app.contentRelevant ? 'text-emerald-400' : 'text-red-300'}`}>
                    {app.contentRelevant ? 'Yes' : 'No'}
                  </div>
                </td>
                <td className="px-3 py-2 capitalize">{app.sponsorshipType}</td>
                <td className="px-3 py-2">
                  <a
                    className="text-purple-200 hover:underline"
                    href={`mailto:${app.contactEmail}`}
                  >
                    {app.contactEmail}
                  </a>
                </td>
                <td className="px-3 py-2 max-w-[220px]">
                  <div className="rounded-md border border-white/10 bg-neutral-900/60 px-2 py-1 text-xs text-gray-300 break-words">
                    {app.proof}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs text-gray-400">
                  {formatEt(app.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
