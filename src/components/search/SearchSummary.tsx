/** Key/value recap of a search, so the customer sees exactly what will be sent to an adviser. */
export function SearchSummary({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="card p-5" data-testid="search-summary">
      <h2 className="font-extrabold">{title}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-noor-muted">{k}</dt>
            <dd className="font-semibold text-noor-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
