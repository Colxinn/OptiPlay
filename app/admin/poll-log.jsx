'use client';

export default function AdminPollLog({ polls }) {
  if (!polls?.length) {
    return (
      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
        <h2 className="font-semibold mb-2">Recent Polls</h2>
        <p className="text-sm text-gray-400">No polls have been published yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Recent Polls</h2>
        <span className="text-xs text-gray-500">{polls.length} recorded</span>
      </div>
      <div className="space-y-2">
        {polls.map((poll) => (
          <div key={poll.id} className="rounded-lg border border-white/10 bg-neutral-900/60 p-3 text-sm text-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-purple-100">{poll.question}</div>
              <div className="text-xs text-gray-400">
                {new Date(poll.startsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/New_York",
                })}{" "}
                ET
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              {poll.game ? <span className="rounded-full border border-white/10 px-2 py-0.5 text-purple-200">{poll.game}</span> : null}
              <span>
                Ends{" "}
                {new Date(poll.endsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/New_York",
                })}{" "}
                ET
              </span>
              <span>
                Created by {poll.createdBy?.name || poll.createdBy?.email || "Owner"}{" "}
                <span className="text-gray-500">({poll.createdBy?.email || "n/a"})</span>
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-300">
              Options: {poll.options.map((opt) => opt.text).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
