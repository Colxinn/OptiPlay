export const dynamic = "force-dynamic";

export default function SponsorThanksPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-[#0b0b10] p-8 text-gray-200">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-purple-200">Thanks for reaching out!</h1>
        <p className="text-sm text-gray-300">
          Your OptiPlay sponsorship application has been received. Owners review new submissions every day and
          we&apos;ll email you soon if there&apos;s a fit.
        </p>
      </div>
      <div className="space-y-2 rounded-xl border border-white/10 bg-neutral-900/60 p-4 text-sm">
        <p className="font-semibold text-gray-100">What happens next?</p>
        <ul className="list-disc space-y-1 pl-5 text-gray-300">
          <li>Our team checks applications for eligibility and relevance.</li>
          <li>If approved, we&apos;ll follow up with next steps, assets, and compensation details.</li>
          <li>You can submit again in 24 hours if you need to share updated stats.</li>
        </ul>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <a
          className="rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-600"
          href="/"
        >
          Back to OptiPlay
        </a>
        <a
          className="rounded-lg border border-white/10 px-4 py-2 text-gray-200 hover:bg-neutral-900"
          href="/forum"
        >
          Visit the community forum
        </a>
      </div>
    </div>
  );
}
